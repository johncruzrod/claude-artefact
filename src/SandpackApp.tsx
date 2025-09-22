import { useMemo, useRef, useState } from "react";
import {
  SandpackProvider,
  SandpackLayout,
  SandpackCodeEditor,
  SandpackPreview,
} from "@codesandbox/sandpack-react";
import { FileDown, PlayCircle, RefreshCw } from "lucide-react";
import "./App.css";

const wrapperApp = `import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import { Provider as ReduxProvider } from 'react-redux';
import { createStore } from 'redux';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ChakraProvider } from '@chakra-ui/react';
import Component from './Component';

const store = createStore((state = {}) => state);
const query = new QueryClient();

export default function App(){
  return (
    <MemoryRouter>
      <ReduxProvider store={store}>
        <QueryClientProvider client={query}>
          <ChakraProvider>
            <Component />
          </ChakraProvider>
        </QueryClientProvider>
      </ReduxProvider>
    </MemoryRouter>
  );
}
`;

const indexTsx = `import './twind-setup';
import React from 'react';
import { createRoot } from 'react-dom/client';

const el = document.getElementById('root');
createRoot(el).render(<App />);
`;

const twindSetup = `import { twind, cssom, observe } from '@twind/core';
import presetTailwind from '@twind/preset-tailwind';
import presetAutoprefix from '@twind/preset-autoprefix';

const style = document.createElement('style');
document.head.appendChild(style);
const sheet = cssom(style.sheet);
const tw = twind({ presets: [presetAutoprefix(), presetTailwind()], preflight: true }, sheet);
observe(document.documentElement, tw);
`;

const placeholderComponent = `import React from 'react';

export default function Component(){
  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h1 className="text-2xl font-bold text-gray-900 mb-4">Paste your component on the left</h1>
      <p className="text-gray-700">Tailwind utilities and common React libraries are available.</p>
    </div>
  );
}
`;

const deps: Record<string, string> = {
  react: "18.2.0",
  "react-dom": "18.2.0",
  "react-router-dom": "6.26.2",
  redux: "5.0.1",
  "react-redux": "9.2.0",
  zustand: "4.5.5",
  "@tanstack/react-query": "5.62.7",
  axios: "1.7.9",
  "react-hook-form": "7.54.2",
  formik: "2.4.6",
  yup: "1.6.1",
  zod: "3.24.2",
  "styled-components": "6.1.15",
  "@emotion/react": "11.14.0",
  "@emotion/styled": "11.14.0",
  "framer-motion": "11.15.0",
  "@mui/material": "6.4.8",
  "@mui/system": "6.4.8",
  "@mui/material/styles": "6.4.8",
  "@chakra-ui/react": "2.8.2",
  antd: "5.23.2",
  "react-bootstrap": "2.10.9",
  classnames: "2.5.1",
  clsx: "2.1.1",
  "lucide-react": "0.484.0",
  "react-icons": "5.3.0",
  // Tailwind runtime in sandbox
  "@twind/core": "1.1.3",
  "@twind/preset-tailwind": "1.1.4",
  "@twind/preset-autoprefix": "1.0.7",
};

export default function SandpackApp() {
  const [componentCode, setComponentCode] = useState<string>(placeholderComponent);
  const [filesNonce, setFilesNonce] = useState(0);
  const previewRef = useRef<HTMLDivElement>(null);

  const files = useMemo(() => ({
    "/index.tsx": { code: indexTsx, active: false },
    "/twind-setup.ts": { code: twindSetup, active: false },
    "/App.tsx": { code: wrapperApp, active: false },
    "/Component.tsx": { code: componentCode, active: true },
    "/index.html": { code: '<div id="root"></div>', active: false },
  }), [componentCode, filesNonce]);

  const run = () => setFilesNonce((n) => n + 1);

  const print = () => {
    const iframe = previewRef.current?.querySelector("iframe");
    if (iframe?.contentWindow) {
      iframe.contentWindow.focus();
      iframe.contentWindow.print();
    }
  };

  return (
    <div className="app-shell">
      <header className="app-header">
        <div className="app-header__row">
          <h1 className="app-header__headline">React Artifact Studio (Rebuilt)</h1>
        </div>
      </header>
      <main className="app-body">
        <SandpackProvider
          template="react-ts"
          customSetup={{ dependencies: deps }}
          files={files}
          options={{ recompileMode: "delayed", recompileDelay: 300 }}
        >
          <SandpackLayout>
            <div className="app-column editor-column app-card" style={{ padding: 8 }}>
              <div style={{ display: "flex", gap: 8, padding: 8 }}>
                <button className="ui-button" onClick={run}><PlayCircle size={14}/> Render</button>
                <button className="ui-button" onClick={() => { setComponentCode(placeholderComponent); run(); }}><RefreshCw size={14}/> Reset</button>
                <button className="ui-button" onClick={print}><FileDown size={14}/> Export PDF</button>
              </div>
              <SandpackCodeEditor showLineNumbers showTabs={false} closableTabs={false} />
            </div>
            <div className="app-column preview-column app-card" ref={previewRef}>
              <SandpackPreview showOpenInCodeSandbox={false} showRefreshButton={true} />
            </div>
          </SandpackLayout>
        </SandpackProvider>
      </main>
    </div>
  );
}
