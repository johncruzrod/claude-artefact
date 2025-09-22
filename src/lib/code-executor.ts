import * as React from "react";
import * as Babel from "@babel/standalone";

import type { ModuleRegistry } from "./module-registry";

export type RenderableComponent = React.ComponentType<unknown>;

export interface ExecutionResult {
  component: RenderableComponent;
  componentName: string;
  namedExports: string[];
  compileMs: number;
  runtimeMs: number;
  warnings: string[];
  codeType: 'react' | 'html';
}

export interface ExecuteOptions {
  runtimeWindow?: Window | null;
}

export class UserCodeError extends Error {
  context?: string;

  constructor(message: string, context?: string) {
    super(message);
    this.name = "UserCodeError";
    this.context = context;
  }
}

const AVAILABLE_PLUGINS = ["transform-modules-commonjs"];
const AVAILABLE_PRESETS: [string, unknown][] = [
  ["typescript", { allExtensions: true, isTSX: true }],
  ["react", { runtime: "automatic", development: false }],
];

function isRenderableFunction(value: unknown): value is RenderableComponent {
  return typeof value === "function";
}

function isExoticComponent(value: unknown): value is RenderableComponent {
  if (!value || typeof value !== "object") {
    return false;
  }

  const exotic = value as { $$typeof?: symbol };
  const exoticTypes = [
    Symbol.for("react.forward_ref"),
    Symbol.for("react.memo"),
    Symbol.for("react.lazy"),
  ];

  return Boolean(exotic.$$typeof && exoticTypes.includes(exotic.$$typeof));
}

function wrapElement(element: React.ReactElement): RenderableComponent {
  const Wrapped = () => element;
  Wrapped.displayName =
    typeof element.type === "string"
      ? element.type
      : (element.type as RenderableComponent | undefined)?.displayName ||
        (element.type as { name?: string }).name ||
        "Component";
  return Wrapped;
}

function isHtmlCode(code: string): boolean {
  const trimmedCode = code.trim();
  // Check if it looks like HTML
  return (
    trimmedCode.startsWith('<') &&
    trimmedCode.endsWith('>') &&
    !trimmedCode.includes('import ') &&
    !trimmedCode.includes('export ') &&
    !trimmedCode.includes('function ') &&
    !trimmedCode.includes('const ') &&
    !trimmedCode.includes('let ') &&
    !trimmedCode.includes('var ') &&
    !trimmedCode.includes('=>') &&
    !trimmedCode.includes('React.') &&
    !trimmedCode.includes('useState') &&
    !trimmedCode.includes('useEffect')
  );
}

function createHtmlComponent(htmlCode: string): RenderableComponent {
  const HtmlComponent = () => {
    return React.createElement('div', {
      dangerouslySetInnerHTML: { __html: htmlCode }
    });
  };
  HtmlComponent.displayName = 'HtmlComponent';
  return HtmlComponent;
}

function extractComponent(moduleExports: unknown) {
  if (!moduleExports) {
    return { component: null, componentName: "", namedExports: [] as string[] };
  }

  if (moduleExports instanceof Promise) {
    throw new UserCodeError(
      "Async exports are not supported",
      "Await the promise and export a React component synchronously."
    );
  }

  if (isRenderableFunction(moduleExports) || isExoticComponent(moduleExports)) {
    const component = moduleExports as RenderableComponent;
    const componentName =
      component.displayName || (component as { name?: string }).name || "Component";
    return { component, componentName, namedExports: [] as string[] };
  }

  const exportObject = moduleExports as Record<string, unknown>;
  const namedExports = Object.keys(exportObject || {}).filter(
    (key) => key !== "default" && key !== "__esModule"
  );

  const potentialCandidates: unknown[] = [];

  if ("default" in (exportObject || {})) {
    potentialCandidates.push(exportObject.default);
  }
  potentialCandidates.push(moduleExports);
  namedExports.forEach((key) => {
    potentialCandidates.push(exportObject[key]);
  });

  for (const candidate of potentialCandidates) {
    if (!candidate) continue;
    if (isRenderableFunction(candidate) || isExoticComponent(candidate)) {
      const component = candidate as RenderableComponent;
      const componentName =
        component.displayName || (component as { name?: string }).name || "Component";
      return { component, componentName, namedExports };
    }
    if (React.isValidElement(candidate)) {
      const component = wrapElement(candidate);
      return { component, componentName: component.displayName || "Component", namedExports };
    }
  }

  return { component: null, componentName: "", namedExports };
}

function createRequire(registry: ModuleRegistry, runtimeWindow?: Window | null) {
  const cache = new Map<string, unknown>();
  const supported = Object.keys(registry).sort();

  const loadedCss = new Set<string>();

  const injectCss = (specifier: string) => {
    const doc = runtimeWindow?.document ?? null;
    if (!doc) return {};
    try {
      // Build a jsDelivr URL for the package CSS path
      // E.g. antd/dist/reset.css -> https://cdn.jsdelivr.net/npm/antd/dist/reset.css
      const url = specifier.startsWith("http")
        ? specifier
        : `https://cdn.jsdelivr.net/npm/${specifier}`;

      if (loadedCss.has(url)) return {};
      const link = doc.createElement("link");
      link.rel = "stylesheet";
      link.href = url;
      (link as HTMLLinkElement).crossOrigin = "anonymous";
      link.referrerPolicy = "no-referrer";
      link.setAttribute("data-runtime-css", specifier);
      doc.head.appendChild(link);
      loadedCss.add(url);
    } catch {
      // no-op — CSS injection failures should not break runtime
    }
    return {};
  };

  const resolveModule = (id: string): unknown => {
    if (cache.has(id)) {
      return cache.get(id);
    }

    let resolved: unknown;

    // Handle CSS imports from libraries (e.g., 'antd/dist/reset.css', 'bootstrap/dist/css/bootstrap.min.css')
    if (/\.css($|\?)/.test(id)) {
      resolved = injectCss(id);
    } else if (id in registry) {
      resolved = registry[id];
    } else if (id.startsWith("@mui/material")) {
      resolved = registry["@mui/material"];
    } else if (id.startsWith("@mui/system")) {
      resolved = registry["@mui/system"];
    } else if (id.startsWith("@tanstack/react-query")) {
      resolved = registry["@tanstack/react-query"];
    } else if (id.startsWith("react-icons/")) {
      throw new UserCodeError(
        `React Icons (${id}) not supported to reduce bundle size`,
        "Use Lucide React instead - it has 5,295+ icons including all common ones: import { IconName } from 'lucide-react'"
      );      
    } else if (id.startsWith("lucide-react")) {
      resolved = registry["lucide-react"];
    } else if (id.startsWith("@hookform/resolvers/")) {
      resolved = registry["@hookform/resolvers/zod"];
    } else if (id.startsWith("@/components/ui/")) {
      resolved = registry[id];
    } else if (id === "react/jsx-runtime") {
      resolved = registry["react/jsx-runtime"];
    } else if (id === "react/jsx-dev-runtime") {
      resolved = registry["react/jsx-dev-runtime"];
    } else if (id === "clsx") {
      resolved = registry.clsx;
    } else if (id === "classnames") {
      resolved = registry.classnames ?? registry.clsx;
    } else if (id === "axios") {
      resolved = registry.axios;
    } else if (id === "zustand") {
      resolved = registry.zustand;
    } else if (id === "redux") {
      resolved = registry.redux;
    } else if (id === "react-redux") {
      resolved = registry["react-redux"];
    } else if (id === "formik") {
      resolved = registry.formik;
    } else if (id === "yup") {
      resolved = registry.yup;
    } else if (id === "zod") {
      resolved = registry.zod;
    } else if (id === "styled-components") {
      resolved = registry["styled-components"];
    } else if (id === "framer-motion") {
      resolved = registry["framer-motion"];
    } else if (id === "@chakra-ui/react") {
      resolved = registry["@chakra-ui/react"];
    } else if (id === "antd") {
      resolved = registry["antd"];
    } else if (id === "react-bootstrap") {
      resolved = registry["react-bootstrap"];
    } else if (id === "lodash-es") {
      resolved = registry["lodash-es"];
    } else if (id === "lodash") {
      resolved = registry["lodash"];
    } else if (id === "tone") {
      resolved = registry["tone"];
    } else {
      throw new UserCodeError(
        `Unsupported import: "${id}"`,
        `Supported modules: ${supported.join(", ")}`
      );
    }

    cache.set(id, resolved);
    return resolved;
  };

  const requireImpl = (id: string) => {
    const moduleId = id?.trim();
    if (!moduleId) {
      throw new UserCodeError("Module name is required for import");
    }
    if (moduleId.startsWith("./") || moduleId.startsWith("../")) {
      throw new UserCodeError(
        `Relative imports are not supported (received "${moduleId}")`,
        "Stick to supported libraries or inline your dependencies."
      );
    }
    return resolveModule(moduleId);
  };

  return requireImpl;
}

export function executeUserCode(
  source: string,
  registry: ModuleRegistry,
  options?: ExecuteOptions
): ExecutionResult {
  const code = source.replace(/\uFEFF/g, "").trimEnd();

  if (!code.trim()) {
    throw new UserCodeError("Add some React or HTML code to get started");
  }

  // Check if this is HTML code
  if (isHtmlCode(code)) {
    const component = createHtmlComponent(code);
    return {
      component,
      componentName: 'HtmlComponent',
      namedExports: [],
      compileMs: 0,
      runtimeMs: 0,
      warnings: [],
      codeType: 'html'
    };
  }

  let transformed;
  const compileStart = performance.now();

  try {
    transformed = Babel.transform(code, {
      filename: "UserComponent.tsx",
      presets: AVAILABLE_PRESETS,
      plugins: AVAILABLE_PLUGINS,
      sourceType: "module",
      retainLines: true,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown compilation error";
    throw new UserCodeError(`Compilation failed: ${message}`);
  }

  const compileMs = performance.now() - compileStart;
  const compiledCode = transformed?.code;

  if (!compiledCode) {
    throw new UserCodeError("Compilation produced no output");
  }

  const runtimeWindow = options?.runtimeWindow ?? null;
  const runtimeGlobalObject = (runtimeWindow ?? globalThis) as typeof globalThis;
  const runtimeGlobal = runtimeGlobalObject as unknown as Record<string, unknown>;
  const FrameFunction = (runtimeWindow
    ? ((runtimeWindow as unknown as typeof globalThis).Function ?? Function)
    : Function) as typeof Function;

  const module = { exports: {} as Record<string, unknown> };
  const requireImpl = createRequire(registry, runtimeWindow);
  const runtimeProcess = { env: { NODE_ENV: "production" } };
  const runtimeStart = performance.now();

  const previousReact = runtimeGlobal.React;
  const previousReactDOM = runtimeGlobal.ReactDOM;
  const previousReactDOMClient = runtimeGlobal["ReactDOMClient"];

  runtimeGlobal.React = registry["react"];
  runtimeGlobal.ReactDOM = registry["react-dom"];
  runtimeGlobal.ReactDOMClient = registry["react-dom/client"];

  try {
    const executor = new FrameFunction(
      "require",
      "module",
      "exports",
      "process",
      compiledCode
    );
    executor(requireImpl, module, module.exports, runtimeProcess);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown runtime error";
    throw new UserCodeError(`Runtime error: ${message}`);
  } finally {
    runtimeGlobal.React = previousReact;
    runtimeGlobal.ReactDOM = previousReactDOM;
    runtimeGlobal.ReactDOMClient = previousReactDOMClient;
  }

  const runtimeMs = performance.now() - runtimeStart;
  const exportedValue = module.exports;
  const { component, componentName, namedExports } = extractComponent(exportedValue);

  if (!component) {
    throw new UserCodeError(
      "No React component exported",
      "Export a component via default export or a named export."
    );
  }

  return {
    component,
    componentName,
    namedExports,
    compileMs,
    runtimeMs,
    warnings: [],
    codeType: 'react'
  };
}
