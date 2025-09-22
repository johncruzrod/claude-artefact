import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ErrorInfo,
} from "react";
import { createRoot, type Root } from "react-dom/client";
import {
  AlertCircle,
  BarChart3,
  FileDown,
  History,
  QrCode,
  Sparkles,
  Waves,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "./components/ui/card";
import { Button } from "./components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "./components/ui/alert";
import { createModuleRegistry } from "./lib/module-registry";
import {
  executeUserCode,
  type RenderableComponent,
  type ExecutionResult,
  UserCodeError,
} from "./lib/code-executor";
import { useDebouncedValue } from "./hooks/useDebouncedValue";
import "./App.css";
import { CacheProvider } from "@emotion/react";
import createCache from "@emotion/cache";
import { StyleSheetManager } from "styled-components";
import { Provider as ReduxProvider } from "react-redux";
import { createStore } from "redux";
import { MemoryRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ChakraProvider } from "@chakra-ui/react";
// Twind v1 (Tailwind-in-JS) to support utility classes inside the iframe without CDN
import { twind as twCreate, cssom as twCssom, observe as twObserve } from "@twind/core";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore - presets are CJS/loose typings
import presetTailwindMod from "@twind/preset-tailwind";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import presetAutoprefixMod from "@twind/preset-autoprefix";

const TWIND_STYLE_ATTR = "data-twind";

const FrameStyleProviders = ({
  targetDocument,
  cacheKey,
  children,
}: {
  targetDocument: Document | null;
  cacheKey: string;
  children: React.ReactNode;
}) => {
  const cache = React.useMemo(() => {
    if (!targetDocument) return null;
    return createCache({ key: cacheKey, container: targetDocument.head });
  }, [cacheKey, targetDocument]);

  const styledTarget = targetDocument?.head ?? undefined;

  if (!cache) return <>{children}</>;

  return (
    <CacheProvider value={cache}>
      <StyleSheetManager target={styledTarget}>{children}</StyleSheetManager>
    </CacheProvider>
  );
};

const RuntimeProviders = ({ children }: { children: React.ReactNode }) => {
  const storeRef = React.useRef<ReturnType<typeof createStore>>(null);
  const queryRef = React.useRef<QueryClient>(null);

  if (!storeRef.current) {
    // minimal no-op redux store to prevent hook crashes
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const reducer = (state: any = {}) => state;
    storeRef.current = createStore(reducer);
  }
  if (!queryRef.current) {
    queryRef.current = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
        },
      },
    });
  }

  return (
    <MemoryRouter>
      <ReduxProvider store={storeRef.current}>
        <QueryClientProvider client={queryRef.current}>
          <ChakraProvider>{children}</ChakraProvider>
        </QueryClientProvider>
      </ReduxProvider>
    </MemoryRouter>
  );
};

// Intentionally do not sync host styles into the preview/print frames
// to keep the rendered component isolated and accurate to user code.
const syncDocumentStyles = () => {
  return;
};

// Install Twind into a given iframe document to render Tailwind utility classes at runtime.
const twindInstalledDocs = new WeakSet<Document>();
const twInstances = new WeakMap<Document, (cn: string) => string>();
function ensureTwind(doc: Document | null): ((cn: string) => string) | null {
  if (!doc) return null;
  if (twInstances.has(doc)) return twInstances.get(doc)!;
  try {
    const head = doc.head || doc.getElementsByTagName("head")[0];
    if (!head) return null;
    
    // Create a <style> tag in the iframe document and use its CSSStyleSheet for cssom
    const styleEl = doc.createElement("style");
    styleEl.setAttribute(TWIND_STYLE_ATTR, "true");
    head.appendChild(styleEl);
    
    const cssSheet = (styleEl.sheet as CSSStyleSheet) || (doc as unknown as { styleSheets: CSSStyleSheet[] }).styleSheets?.[doc.styleSheets.length - 1];
    if (!cssSheet) return null;
    
    const sheet = twCssom(cssSheet);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const presetTailwind = (presetTailwindMod as any).default ?? presetTailwindMod;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const presetAutoprefix = (presetAutoprefixMod as any).default ?? presetAutoprefixMod;
    
    const tw = twCreate({ 
      presets: [presetAutoprefix(), presetTailwind()], 
      preflight: false,
      theme: {
        extend: {
          colors: {
            border: "hsl(var(--border))",
            input: "hsl(var(--input))",
            ring: "hsl(var(--ring))",
            background: "hsl(var(--background))",
            foreground: "hsl(var(--foreground))",
            primary: {
              DEFAULT: "hsl(var(--primary))",
              foreground: "hsl(var(--primary-foreground))",
            },
            secondary: {
              DEFAULT: "hsl(var(--secondary))",
              foreground: "hsl(var(--secondary-foreground))",
            },
            destructive: {
              DEFAULT: "hsl(var(--destructive))",
              foreground: "hsl(var(--destructive-foreground))",
            },
            muted: {
              DEFAULT: "hsl(var(--muted))",
              foreground: "hsl(var(--muted-foreground))",
            },
            accent: {
              DEFAULT: "hsl(var(--accent))",
              foreground: "hsl(var(--accent-foreground))",
            },
            popover: {
              DEFAULT: "hsl(var(--popover))",
              foreground: "hsl(var(--popover-foreground))",
            },
            card: {
              DEFAULT: "hsl(var(--card))",
              foreground: "hsl(var(--card-foreground))",
            },
          },
        }
      }
    }, sheet);
    
    // Observe the entire document to generate CSS for class attributes as they change
    if (doc.documentElement) {
      twObserve(tw, doc.documentElement);
    }
    
    // Mark to avoid duplicate installs
    twindInstalledDocs.add(doc);
    twInstances.set(doc, tw);
    return tw;
  } catch (error) {
    console.warn("Failed to initialize Twind in iframe", error);
    return null;
  }
}

function seedTwindStyles(doc: Document | null) {
  if (!doc) return;
  const tw = twInstances.get(doc) ?? ensureTwind(doc);
  if (!tw) return;
  try {
    const els = doc.querySelectorAll("[class]");
    for (const el of Array.from(els)) {
      const cn = (el as HTMLElement).getAttribute("class") || "";
      if (cn) tw(cn);
    }
  } catch {
    // ignore
  }
}

const buildFrameDocument = ({ padded }: { padded: boolean }): string => {
  const padding = padded ? "padding: 28px 32px 32px 32px;" : "padding: 16px;";
  return `<!DOCTYPE html><html lang="en"><head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <style>
      *, *::before, *::after { 
        box-sizing: border-box; 
      }
      html, body { 
        height: 100%; 
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
      }
      body {
        margin: 0;
        background: #ffffff;
        color: #111827;
        line-height: 1.5;
        ${padding}
      }
      a { color: inherit; }
      #root {
        min-height: calc(100vh - 2px);
        display: block;
      }
      .print-wrapper {
        display: block;
      }
      
      /* Ensure charts render properly in PDF */
      svg {
        max-width: 100% !important;
        height: auto !important;
      }
      
      .recharts-wrapper {
        width: 100% !important;
      }
      
      .recharts-surface {
        overflow: visible !important;
      }
      
      /* Shadcn/UI CSS Variables */
      :root {
        --background: 0 0% 100%;
        --foreground: 222.2 84% 4.9%;
        --card: 0 0% 100%;
        --card-foreground: 222.2 84% 4.9%;
        --popover: 0 0% 100%;
        --popover-foreground: 222.2 84% 4.9%;
        --primary: 222.2 47.4% 11.2%;
        --primary-foreground: 210 40% 98%;
        --secondary: 210 40% 96%;
        --secondary-foreground: 222.2 84% 4.9%;
        --muted: 210 40% 96%;
        --muted-foreground: 215.4 16.3% 46.9%;
        --accent: 210 40% 96%;
        --accent-foreground: 222.2 84% 4.9%;
        --destructive: 0 84.2% 60.2%;
        --destructive-foreground: 210 40% 98%;
        --border: 214.3 31.8% 91.4%;
        --input: 214.3 31.8% 91.4%;
        --ring: 222.2 84% 4.9%;
        --radius: 0.5rem;
      }
      
      /* Comprehensive Tailwind CSS utilities */
      
      /* Background Colors */
      .bg-gray-50 { background-color: #f9fafb; }
      .bg-gray-100 { background-color: #f3f4f6; }
      .bg-white { background-color: #ffffff; }
      .bg-yellow-500 { background-color: #eab308; }
      .bg-blue-500 { background-color: #3b82f6; }
      .bg-blue-600 { background-color: #2563eb; }
      .bg-green-500 { background-color: #22c55e; }
      .bg-orange-500 { background-color: #f97316; }
      .bg-blue-50 { background-color: #eff6ff; }
      .bg-green-50 { background-color: #f0fdf4; }
      .bg-yellow-50 { background-color: #fefce8; }
      .bg-red-50 { background-color: #fef2f2; }
      
      /* Text Colors */
      .text-white { color: #ffffff; }
      .text-gray-900 { color: #111827; }
      .text-gray-800 { color: #1f2937; }
      .text-gray-700 { color: #374151; }
      .text-gray-600 { color: #4b5563; }
      .text-blue-900 { color: #1e3a8a; }
      .text-blue-800 { color: #1e40af; }
      
      /* Spacing - Padding */
      .p-1 { padding: 0.25rem; }
      .p-2 { padding: 0.5rem; }
      .p-3 { padding: 0.75rem; }
      .p-4 { padding: 1rem; }
      .p-6 { padding: 1.5rem; }
      .p-8 { padding: 2rem; }
      .px-1 { padding-left: 0.25rem; padding-right: 0.25rem; }
      .px-2 { padding-left: 0.5rem; padding-right: 0.5rem; }
      .px-3 { padding-left: 0.75rem; padding-right: 0.75rem; }
      .px-4 { padding-left: 1rem; padding-right: 1rem; }
      .py-1 { padding-top: 0.25rem; padding-bottom: 0.25rem; }
      .py-2 { padding-top: 0.5rem; padding-bottom: 0.5rem; }
      .py-3 { padding-top: 0.75rem; padding-bottom: 0.75rem; }
      
      /* Spacing - Margin */
      .m-0 { margin: 0; }
      .m-1 { margin: 0.25rem; }
      .m-2 { margin: 0.5rem; }
      .m-4 { margin: 1rem; }
      .mb-1 { margin-bottom: 0.25rem; }
      .mb-2 { margin-bottom: 0.5rem; }
      .mb-3 { margin-bottom: 0.75rem; }
      .mb-4 { margin-bottom: 1rem; }
      .mb-6 { margin-bottom: 1.5rem; }
      .mt-1 { margin-top: 0.25rem; }
      .mt-2 { margin-top: 0.5rem; }
      .mt-3 { margin-top: 0.75rem; }
      
      /* Typography */
      .text-xs { font-size: 0.75rem; line-height: 1rem; }
      .text-sm { font-size: 0.875rem; line-height: 1.25rem; }
      .text-base { font-size: 1rem; line-height: 1.5rem; }
      .text-lg { font-size: 1.125rem; line-height: 1.75rem; }
      .text-xl { font-size: 1.25rem; line-height: 1.75rem; }
      .text-2xl { font-size: 1.5rem; line-height: 2rem; }
      .text-3xl { font-size: 1.875rem; line-height: 2.25rem; }
      
      .font-normal { font-weight: 400; }
      .font-medium { font-weight: 500; }
      .font-semibold { font-weight: 600; }
      .font-bold { font-weight: 700; }
      
      /* Layout */
      .min-h-screen { min-height: 100vh; }
      .max-w-full { max-width: 100%; }
      .w-full { width: 100%; }
      .h-full { height: 100%; }
      
      /* Flexbox */
      .flex { display: flex; }
      .flex-col { flex-direction: column; }
      .flex-row { flex-direction: row; }
      .justify-start { justify-content: flex-start; }
      .justify-center { justify-content: center; }
      .justify-between { justify-content: space-between; }
      .justify-end { justify-content: flex-end; }
      .items-start { align-items: flex-start; }
      .items-center { align-items: center; }
      .items-end { align-items: flex-end; }
      
      /* Grid */
      .grid { display: grid; }
      .grid-cols-1 { grid-template-columns: repeat(1, minmax(0, 1fr)); }
      .grid-cols-2 { grid-template-columns: repeat(2, minmax(0, 1fr)); }
      .grid-cols-3 { grid-template-columns: repeat(3, minmax(0, 1fr)); }
      .gap-2 { gap: 0.5rem; }
      .gap-3 { gap: 0.75rem; }
      .gap-4 { gap: 1rem; }
      .gap-6 { gap: 1.5rem; }
      
      /* Spacing utilities */
      .space-y-1 > * + * { margin-top: 0.25rem; }
      .space-y-2 > * + * { margin-top: 0.5rem; }
      .space-y-3 > * + * { margin-top: 0.75rem; }
      
      /* Borders */
      .border { border-width: 1px; }
      .border-0 { border-width: 0; }
      .border-t { border-top-width: 1px; }
      .border-r { border-right-width: 1px; }
      .border-b { border-bottom-width: 1px; }
      .border-l { border-left-width: 1px; }
      .border-l-4 { border-left-width: 4px; }
      .border-gray-200 { border-color: #e5e7eb; }
      .border-gray-300 { border-color: #d1d5db; }
      .border-blue-200 { border-color: #bfdbfe; }
      .border-blue-600 { border-left-color: #2563eb; }
      .border-l-blue-600 { border-left-color: #2563eb; }
      
      /* Border Radius */
      .rounded { border-radius: 0.25rem; }
      .rounded-sm { border-radius: 0.125rem; }
      .rounded-md { border-radius: 0.375rem; }
      .rounded-lg { border-radius: 0.5rem; }
      .rounded-xl { border-radius: 0.75rem; }
      
      /* Display */
      .block { display: block; }
      .inline { display: inline; }
      .inline-block { display: inline-block; }
      .hidden { display: none; }
      
      /* Position */
      .relative { position: relative; }
      .absolute { position: absolute; }
      .fixed { position: fixed; }
      .static { position: static; }
      
      /* Responsive Grid - Mobile First */
      @media (min-width: 640px) {
        .sm\\:grid-cols-2 { grid-template-columns: repeat(2, minmax(0, 1fr)); }
      }
      
      @media (min-width: 768px) {
        .md\\:grid-cols-2 { grid-template-columns: repeat(2, minmax(0, 1fr)); }
        .md\\:grid-cols-3 { grid-template-columns: repeat(3, minmax(0, 1fr)); }
      }
      
      @media (min-width: 1024px) {
        .lg\\:grid-cols-2 { grid-template-columns: repeat(2, minmax(0, 1fr)); }
        .lg\\:grid-cols-3 { grid-template-columns: repeat(3, minmax(0, 1fr)); }
        .lg\\:grid-cols-4 { grid-template-columns: repeat(4, minmax(0, 1fr)); }
      }
      
      @media (min-width: 1280px) {
        .xl\\:grid-cols-2 { grid-template-columns: repeat(2, minmax(0, 1fr)); }
        .xl\\:grid-cols-3 { grid-template-columns: repeat(3, minmax(0, 1fr)); }
        .xl\\:grid-cols-4 { grid-template-columns: repeat(4, minmax(0, 1fr)); }
      }
      
      /* Additional utilities for complex layouts */
      .overflow-hidden { overflow: hidden; }
      .overflow-auto { overflow: auto; }
      .text-left { text-align: left; }
      .text-center { text-align: center; }
      .text-right { text-align: right; }
      .uppercase { text-transform: uppercase; }
      .lowercase { text-transform: lowercase; }
      .capitalize { text-transform: capitalize; }
      .leading-none { line-height: 1; }
      .leading-tight { line-height: 1.25; }
      .leading-normal { line-height: 1.5; }
      .leading-relaxed { line-height: 1.625; }
      .tracking-tight { letter-spacing: -0.025em; }
      .tracking-normal { letter-spacing: 0; }
      .tracking-wide { letter-spacing: 0.025em; }
    </style>
  </head><body>
    <div id="root"></div>
  </body></html>`;
};

type RenderStatus = "idle" | "rendering" | "ready" | "error";

const SAMPLE_FILES = [
  { label: "QR Codes", path: "/sample2.txt", icon: "QrCode" },
  { label: "Analytics dashboard", path: "/sample1.txt", icon: "BarChart3" },
  { label: "Pendulum", path: "/sample3.txt", icon: "Waves" },
];

class PreviewErrorBoundary extends React.Component<
  {
    onError: (error: Error, errorInfo: ErrorInfo) => void;
    children: React.ReactNode;
  },
  { error: Error | null }
> {
  constructor(props: {
    onError: (error: Error, errorInfo: ErrorInfo) => void;
    children: React.ReactNode;
  }) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.props.onError(error, errorInfo);
  }

  render() {
    if (this.state.error) {
      return (
        <div className="preview-error" role="alert">
          <AlertCircle size={20} aria-hidden="true" />
          <div>
            <p className="preview-error__title">Component crashed while rendering</p>
            <p className="preview-error__details">{this.state.error.message}</p>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

const PreviewPlaceholder = () => (
  <div className="preview-placeholder">
    <div className="preview-placeholder__icon" aria-hidden="true">
      <Sparkles size={32} />
    </div>
    <h3>Ready when you are</h3>
    <p>Paste a React component or HTML code to see a live preview instantly.</p>
  </div>
);

const PreviewErrorPane = ({
  message,
  details,
}: {
  message: string;
  details?: string;
}) => (
  <div className="preview-error" role="alert">
    <AlertCircle size={20} aria-hidden="true" />
    <div>
      <p className="preview-error__title">{message}</p>
      {details ? <p className="preview-error__details">{details}</p> : null}
    </div>
  </div>
);

function App() {
  const modules = useMemo(() => createModuleRegistry(), []);
  const [code, setCode] = useState("");
  const [autoRender] = useState(true);
  const [status, setStatus] = useState<RenderStatus>("idle");
  const [error, setError] = useState<UserCodeError | null>(null);
  const [component, setComponent] = useState<RenderableComponent | null>(null);
  const [executionResult, setExecutionResult] = useState<ExecutionResult | null>(null);
  const [isPrinting, setIsPrinting] = useState(false);
  const [loadingSamplePath, setLoadingSamplePath] = useState<string | null>(null);
  const [activeSample, setActiveSample] = useState<string | null>(SAMPLE_FILES[0]?.path ?? null);
  const previewFrameRef = useRef<HTMLIFrameElement>(null);
  const previewRootRef = useRef<Root | null>(null);
  const previewPendingNodeRef = useRef<React.ReactNode | null>(null);
  const previewPendingSourceRef = useRef<string | null>(null);
  const printFrameRef = useRef<HTMLIFrameElement>(null);
  const printRootRef = useRef<Root | null>(null);
  const debouncedCode = useDebouncedValue(code, 450);

  const previewDocumentMarkup = useMemo(() => buildFrameDocument({ padded: true }), []);
  const printDocumentMarkup = useMemo(() => buildFrameDocument({ padded: false }), []);

  const syncFrameStyles = useCallback((frame: HTMLIFrameElement | null) => {
    if (!frame) {
      return;
    }
    const doc = frame.contentDocument;
    if (!doc || !doc.head) {
      return;
    }
    if (typeof document === "undefined") {
      return;
    }
    syncDocumentStyles();
  }, []);

  const syncPreviewFrameStyles = useCallback(() => {
    syncFrameStyles(previewFrameRef.current);
  }, [syncFrameStyles]);

  const syncPrintFrameStyles = useCallback(() => {
    syncFrameStyles(printFrameRef.current);
  }, [syncFrameStyles]);

  const adjustIframeHeight = useCallback((frame: HTMLIFrameElement | null) => {
    if (!frame) {
      return;
    }
    const doc = frame.contentDocument;
    if (!doc) {
      return;
    }
    const body = doc.body;
    const html = doc.documentElement;
    const height = Math.max(
      body.scrollHeight,
      body.offsetHeight,
      html.scrollHeight,
      html.offsetHeight
    );
    frame.style.height = `${Math.min(Math.max(height, 520), 2400)}px`;
  }, []);

  const ensurePreviewRoot = useCallback(() => {
    const frame = previewFrameRef.current;
    if (!frame) {
      return null;
    }
    const doc = frame.contentDocument;
    if (!doc) {
      return null;
    }
    // Initialize Twind (Tailwind runtime) once per iframe document
    ensureTwind(doc);
    const mount = doc.getElementById("root");
    if (!mount) {
      return null;
    }
    if (!previewRootRef.current) {
      previewRootRef.current = createRoot(mount);
    }
    adjustIframeHeight(frame);
    return previewRootRef.current;
  }, [adjustIframeHeight]);

  const ensurePrintRoot = useCallback(() => {
    const frame = printFrameRef.current;
    if (!frame) {
      return null;
    }
    const doc = frame.contentDocument;
    if (!doc) {
      return null;
    }
    ensureTwind(doc);
    const mount = doc.getElementById("root");
    if (!mount) {
      return null;
    }
    if (!printRootRef.current) {
      printRootRef.current = createRoot(mount);
    }
    adjustIframeHeight(frame);
    return printRootRef.current;
  }, [adjustIframeHeight]);

  const renderPreviewContent = useCallback(
    (node: React.ReactNode) => {
      const root = ensurePreviewRoot();
      if (!root) {
        previewPendingNodeRef.current = node;
        return;
      }

      const postRender = () => {
        requestAnimationFrame(() => {
          adjustIframeHeight(previewFrameRef.current);
          syncPreviewFrameStyles();
          seedTwindStyles(previewFrameRef.current?.contentDocument ?? null);
        });
      };

      try {
        root.render(node);
        postRender();
      } catch (renderError) {
        console.warn("Preview root render failed, recreating", renderError);
        root.unmount();
        previewRootRef.current = null;
        const newRoot = ensurePreviewRoot();
        if (newRoot) {
          newRoot.render(node);
          postRender();
        } else {
          previewPendingNodeRef.current = node;
        }
      }
    },
    [adjustIframeHeight, ensurePreviewRoot, syncPreviewFrameStyles]
  );

  const handlePreviewRuntimeError = useCallback(
    (previewError: Error) => {
      console.error("Preview runtime error", previewError);
      setError(
        new UserCodeError(
          "Component crashed while rendering",
          previewError.message
        )
      );
      setStatus("error");
    },
    []
  );

  const runRender = useCallback(
    (source: string) => {
      const trimmed = source.trim();

      if (!trimmed) {
        setComponent(null);
        setExecutionResult(null);
        setStatus("idle");
        setError(null);
        renderPreviewContent(<PreviewPlaceholder />);
        previewPendingSourceRef.current = null;
        return;
      }

      const frame = previewFrameRef.current;
      const frameWindow = frame?.contentWindow ?? null;
      const readyState = frame?.contentDocument?.readyState;

      setStatus("rendering");
      setError(null);

      if (!frame || !frameWindow || readyState !== "complete") {
        previewPendingSourceRef.current = source;
        renderPreviewContent(<PreviewPlaceholder />);
        return;
      }

      try {
        const result = executeUserCode(source, modules, {
          runtimeWindow: frameWindow,
        });
        const Component = result.component;

        previewPendingSourceRef.current = null;
        setComponent(() => Component);
        setExecutionResult(result);
        setStatus("ready");
        const frameDocument = frame.contentDocument ?? null;
        renderPreviewContent(
          <FrameStyleProviders targetDocument={frameDocument} cacheKey="preview">
            <RuntimeProviders>
              <PreviewErrorBoundary
                key={`${Date.now()}`}
                onError={handlePreviewRuntimeError}
              >
                <Component />
              </PreviewErrorBoundary>
            </RuntimeProviders>
          </FrameStyleProviders>
        );
      } catch (err) {
        previewPendingSourceRef.current = null;
        const userError =
          err instanceof UserCodeError
            ? err
            : new UserCodeError(
                "Unexpected error while rendering",
                err instanceof Error ? err.message : undefined
              );
        setComponent(null);
        setExecutionResult(null);
        setStatus("error");
        setError(userError);
        renderPreviewContent(
          <PreviewErrorPane
            message={userError.message}
            details={userError.context}
          />
        );
      }
    },
    [modules, renderPreviewContent, handlePreviewRuntimeError]
  );

  const loadSample = useCallback(
    async (path: string, options?: { silent?: boolean }) => {
      const silent = Boolean(options?.silent);
      if (!silent) {
        setLoadingSamplePath(path);
      }

      try {
        const response = await fetch(path);
        if (!response.ok) {
          throw new Error(`Unable to load sample (${response.status})`);
        }
        const sampleCode = await response.text();
        setCode(sampleCode);
        setActiveSample(path);
        if (!autoRender) {
          runRender(sampleCode);
        }
        setError(null);
      } catch (sampleError) {
        const message =
          sampleError instanceof Error
            ? sampleError.message
            : "Unknown error loading sample";
        const userError = new UserCodeError("Could not load sample", message);
        setError(userError);
        setStatus("error");
        renderPreviewContent(
          <PreviewErrorPane message={userError.message} details={message} />
        );
        if (silent) {
          throw sampleError;
        }
      } finally {
        if (!silent) {
          setLoadingSamplePath(null);
        }
      }
    },
    [autoRender, renderPreviewContent, runRender]
  );

  const handlePrint = useCallback(() => {
    if (!component || status !== "ready") {
      return;
    }

    const root = ensurePrintRoot();
    const frame = printFrameRef.current;
    if (!root || !frame) {
      console.warn("Print frame is not ready yet");
      return;
    }

    setIsPrinting(true);

    let Printable: RenderableComponent | null = null;
    const frameWindow = frame.contentWindow ?? null;

    if (!frameWindow) {
      setIsPrinting(false);
      console.warn("Print window is not available");
      return;
    }

    try {
      const result = executeUserCode(code, modules, {
        runtimeWindow: frameWindow,
      });
      Printable = result.component;
    } catch (err) {
      setIsPrinting(false);
      const userError =
        err instanceof UserCodeError
          ? err
          : new UserCodeError(
              "Unexpected error while preparing PDF",
              err instanceof Error ? err.message : undefined
            );
      console.error("Failed to render print component", err);
      setError(userError);
      return;
    }

    const Component = Printable;

    if (!Component) {
      setIsPrinting(false);
      console.warn("Printable component could not be created");
      return;
    }

    const frameDocument = frame.contentDocument ?? null;

    root.render(
      <FrameStyleProviders targetDocument={frameDocument} cacheKey="print">
        <RuntimeProviders>
          <div className="print-wrapper">
            <Component />
          </div>
        </RuntimeProviders>
      </FrameStyleProviders>
    );
    syncPrintFrameStyles();
    requestAnimationFrame(() => {
      adjustIframeHeight(frame);
      syncPrintFrameStyles();
    });

    if (!frameWindow) {
      setIsPrinting(false);
      return;
    }

    frameWindow.focus();
    adjustIframeHeight(frame);
    
    // Wait for charts and dynamic content to fully render before printing
    const waitForChartsAndPrint = () => {
      let attempts = 0;
      const maxAttempts = 10;
      
      const checkAndPrint = () => {
        attempts++;
        
        // Check if recharts or other chart libraries have finished rendering
        const chartElements = frameDocument?.querySelectorAll('svg, canvas, .recharts-wrapper, .recharts-surface');
        const hasCharts = chartElements && chartElements.length > 0;
        
        // Check if SVG elements have actual content (width/height)
        const svgElements = frameDocument?.querySelectorAll('svg');
        const hasRenderedSvg = svgElements && Array.from(svgElements).some(svg => {
          const rect = svg.getBoundingClientRect();
          return rect.width > 0 && rect.height > 0;
        });
        
        console.log(`PDF render attempt ${attempts}: Found ${chartElements?.length || 0} chart elements, SVG rendered: ${hasRenderedSvg}`);
        
        if ((hasCharts && hasRenderedSvg) || attempts >= maxAttempts) {
          frameWindow.print();
          setTimeout(() => {
            setIsPrinting(false);
          }, 500);
        } else {
          // Wait a bit more and try again
          setTimeout(checkAndPrint, 200);
        }
      };
      
      // Start checking after initial delay
      setTimeout(checkAndPrint, 500);
    };
    
    requestAnimationFrame(waitForChartsAndPrint);
  }, [
    adjustIframeHeight,
    code,
    component,
    ensurePrintRoot,
    modules,
    status,
    syncPrintFrameStyles,
  ]);

  useEffect(() => {
    renderPreviewContent(<PreviewPlaceholder />);
  }, [renderPreviewContent]);

  useEffect(() => {
    if (typeof document === "undefined") {
      return;
    }

    const runSync = () => {
      syncPreviewFrameStyles();
      syncPrintFrameStyles();
    };

    const headObserver = new MutationObserver(runSync);
    headObserver.observe(document.head, {
      childList: true,
      subtree: true,
    });

    const attrObserver = new MutationObserver(runSync);
    attrObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class", "data-theme"],
    });

    if (document.body) {
      attrObserver.observe(document.body, {
        attributes: true,
        attributeFilter: ["class"],
      });
    }

    runSync();

    return () => {
      headObserver.disconnect();
      attrObserver.disconnect();
    };
  }, [syncPreviewFrameStyles, syncPrintFrameStyles]);

  useEffect(() => {
    if (!SAMPLE_FILES.length) {
      return;
    }
    loadSample(SAMPLE_FILES[0].path, { silent: true }).catch((err) => {
      console.error("Failed to load default sample", err);
    });
  }, [loadSample]);

  useEffect(() => {
    const frame = previewFrameRef.current;
    if (!frame) {
      return;
    }

    const handleLoad = () => {
      if (previewRootRef.current) {
        // Avoid unmounting during React render by scheduling it.
        const root = previewRootRef.current;
        previewRootRef.current = null;
        setTimeout(() => root.unmount(), 0);
      }

      syncPreviewFrameStyles();
      requestAnimationFrame(() => {
        adjustIframeHeight(frame);
        syncPreviewFrameStyles();
      });

      const pendingSource = previewPendingSourceRef.current;
      const pendingNode = previewPendingNodeRef.current;

      previewPendingNodeRef.current = null;

      if (pendingSource) {
        previewPendingSourceRef.current = null;
        runRender(pendingSource);
        return;
      }

      if (pendingNode) {
        renderPreviewContent(pendingNode);
      } else {
        renderPreviewContent(<PreviewPlaceholder />);
      }
    };

    frame.addEventListener("load", handleLoad);

    if (frame.contentDocument?.readyState === "complete") {
      handleLoad();
    }

    return () => {
      frame.removeEventListener("load", handleLoad);
    };
  }, [
    adjustIframeHeight,
    renderPreviewContent,
    runRender,
    syncPreviewFrameStyles,
  ]);

  useEffect(() => {
    const frame = printFrameRef.current;
    if (!frame) {
      return;
    }

    const handleLoad = () => {
      if (printRootRef.current) {
        const root = printRootRef.current;
        printRootRef.current = null;
        setTimeout(() => root.unmount(), 0);
      }
      ensurePrintRoot();
      syncPrintFrameStyles();
      requestAnimationFrame(() => {
        adjustIframeHeight(frame);
        syncPrintFrameStyles();
      });
    };

    frame.addEventListener("load", handleLoad);

    if (frame.contentDocument?.readyState === "complete") {
      handleLoad();
    }

    return () => {
      frame.removeEventListener("load", handleLoad);
    };
  }, [adjustIframeHeight, ensurePrintRoot, syncPrintFrameStyles]);

  useEffect(() => {
    if (!autoRender) {
      return;
    }

    if (!debouncedCode.trim()) {
      setComponent(null);
      setExecutionResult(null);
      setStatus("idle");
      renderPreviewContent(<PreviewPlaceholder />);
      return;
    }

    runRender(debouncedCode);
  }, [autoRender, debouncedCode, renderPreviewContent, runRender]);

  useEffect(() => {
    return () => {
      if (previewRootRef.current) {
        previewRootRef.current.unmount();
        previewRootRef.current = null;
      }
      if (printRootRef.current) {
        printRootRef.current.unmount();
        printRootRef.current = null;
      }
      previewPendingNodeRef.current = null;
    };
  }, []);

  const lineCount = code ? code.split(/\r?\n/).length : 0;
  const characterCount = code.length;

  return (
    <div className="app-shell">
      <header className="app-header">
        <div className="app-header__row">
          <h1 className="app-header__headline">React & HTML Artifact Studio</h1>
          <p className="app-header__subtitle">
          </p>
        </div>
      </header>

      <main className="app-body">
        <section className="app-column editor-column">
          <div className="column-scroll">
            <Card className="app-card editor-card">
              <CardHeader>
                <CardTitle>Source code</CardTitle>
              </CardHeader>
              <CardContent className="editor-card__content">
                <div className="editor-toolbar">
                  <div className="editor-toolbar__group">
                    {SAMPLE_FILES.map((sample) => {
                      const isLoading = loadingSamplePath === sample.path;
                      const isActive = activeSample === sample.path;
                      const IconComponent = sample.icon === "BarChart3" ? BarChart3 : sample.icon === "QrCode" ? QrCode : Waves;
                      return (
                        <Button
                          key={sample.path}
                          size="sm"
                          variant={isActive ? "default" : "secondary"}
                          onClick={() => loadSample(sample.path)}
                          disabled={Boolean(loadingSamplePath)}
                        >
                          <IconComponent size={14} aria-hidden="true" />
                          {isLoading ? "Loading…" : sample.label}
                        </Button>
                      );
                    })}
                  </div>
                </div>
                <div className="editor-canvas" style={{ height: '400px' }}>
                  <textarea
                    value={code}
                    placeholder="Paste your React component or HTML code here…"
                    onChange={(event) => setCode(event.target.value)}
                    className="code-editor"
                    aria-label="React or HTML source code editor"
                    style={{ height: '100%', width: '100%' }}
                  />
                </div>
              </CardContent>
              <CardFooter className="editor-footer">
                <div className="editor-footer__stat">
                  <History size={14} aria-hidden="true" />
                  <span>{lineCount} lines</span>
                </div>
                <div className="editor-footer__stat">
                  <Sparkles size={14} aria-hidden="true" />
                  <span>{characterCount} characters</span>
                </div>
              </CardFooter>
            </Card>

            {error ? (
              <Alert variant="destructive" className="app-card alert-card">
                <AlertCircle size={18} aria-hidden="true" />
                <div>
                  <AlertTitle>{error.message}</AlertTitle>
                  {error.context ? (
                    <AlertDescription>{error.context}</AlertDescription>
                  ) : null}
                </div>
              </Alert>
            ) : null}

          </div>
        </section>

        <section className="app-column preview-column">
          <div className="column-scroll">
            <Card className="app-card preview-card">
              <CardHeader>
                <div className="preview-header">
                  <div>
                    <CardTitle>Live preview</CardTitle>
                    {executionResult && (
                      <p className="text-sm text-muted-foreground mt-1">
                        Detected: {executionResult.codeType === 'html' ? 'HTML' : 'React Component'}
                        {executionResult.codeType === 'react' && executionResult.componentName && 
                          ` (${executionResult.componentName})`}
                      </p>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="preview-card__content">
                <div className="preview-pane">
                  <iframe
                    title="Component preview"
                    ref={previewFrameRef}
                    className="preview-frame"
                    srcDoc={previewDocumentMarkup}
                  />
                </div>
              </CardContent>
              <CardFooter className="preview-footer">
                <div className="preview-actions">
                <Button
                  size="sm"
                  onClick={handlePrint}
                  disabled={!component || status !== "ready" || isPrinting}
                >
                  <FileDown size={14} aria-hidden="true" />
                  {isPrinting ? "Preparing…" : "Export PDF"}
                </Button>
              </div>
              </CardFooter>
            </Card>
          </div>
        </section>
      </main>

      <iframe
        title="Print surface"
        ref={printFrameRef}
        className="print-surface"
        srcDoc={printDocumentMarkup}
      />
    </div>
  );
}

export default App;
