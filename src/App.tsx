import { useState, useRef, useEffect } from 'react';
import * as React from 'react';
import * as ReactDOM from 'react-dom/client';
import * as Babel from '@babel/standalone';
import * as LucideIcons from 'lucide-react';
import * as Recharts from 'recharts';
import * as _ from 'lodash';
import * as d3 from 'd3';
import * as THREE from 'three';
import * as Tone from 'tone';
import * as math from 'mathjs';
import './App.css';
import { exampleComponent } from './exampleComponent';

// Libraries we'll make available to user components
import { 
  Button, 
  Container, 
  Card, 
  Grid, 
  Box, 
  Typography, 
  TextField,
  Paper,
  List,
  ListItem,
  Divider 
} from '@mui/material';

const availableModules = {
  'react': React,
  '@mui/material': {
    Button, Container, Card, Grid, Box, 
    Typography, TextField, Paper, List, ListItem, Divider,
  },
  'react-dom': ReactDOM,
  'lucide-react': LucideIcons,
  'recharts': Recharts,
  'lodash': _,
  'd3': d3,
  'three': THREE,
  'tone': Tone,
  'mathjs': math
};

function App() {
  const [code, setCode] = useState<string>(exampleComponent);
  const [error, setError] = useState<string | null>(null);
  const [currentComponent, setCurrentComponent] = useState<React.ComponentType | null>(null);

  const codePreviewRef = useRef<HTMLDivElement>(null);
  const componentRef = useRef<HTMLDivElement>(null);
  const rootRef = useRef<ReactDOM.Root | null>(null);
  const printRootRef = useRef<ReactDOM.Root | null>(null);

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    let previewRoot: ReactDOM.Root | null = null;
    let printRoot: ReactDOM.Root | null = null;

    if (codePreviewRef.current && !rootRef.current) {
      previewRoot = ReactDOM.createRoot(codePreviewRef.current);
      rootRef.current = previewRoot;
    }
    if (componentRef.current && !printRootRef.current) {
      printRoot = ReactDOM.createRoot(componentRef.current);
      printRootRef.current = printRoot;
    }

    if (previewRoot) {
      try {
        renderComponent(previewRoot);
      } catch (error) {
        console.error("Initial render error:", error);
      }
    }

    return () => {
      if (previewRoot) {
        try {
          previewRoot.unmount();
        } catch (error) {
          console.error("Error unmounting preview root:", error);
        }
      }
      if (printRoot) {
        try {
          printRoot.unmount();
        } catch (error) {
          console.error("Error unmounting print root:", error);
        }
      }
      rootRef.current = null;
      printRootRef.current = null;
    };
  }, []);

  useEffect(() => {
    const style = document.createElement('style');
    style.type = 'text/css';
    style.media = 'print';
    style.innerHTML = `
      @media print {
        body * {
          visibility: hidden;
        }
        #print-container {
          visibility: visible !important;
          position: absolute !important;
          left: 0 !important;
          top: 0 !important;
          width: 100% !important;
          height: auto !important;
          overflow: visible !important;
        }
        #print-container * {
          visibility: visible !important;
        }
      }
    `;
    document.head.appendChild(style);
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  useEffect(() => {
    if (rootRef.current) {
      try {
        renderComponent(rootRef.current);
      } catch (error) {
        console.error("Error rendering component on code change:", error);
        setError(`Rendering error: ${error instanceof Error ? error.message : String(error)}`);
      }
    }
  }, [code]);

  const loadSampleCode = async (sampleNumber: number) => {
    try {
      const response = await fetch(`/sample${sampleNumber}.txt`);
      if (!response.ok) {
        throw new Error(`Failed to load sample ${sampleNumber}: ${response.statusText}`);
      }
      const sampleCode = await response.text();
      setCode(sampleCode);
    } catch (err) {
      setError(String(err));
    }
  };
  

  const preprocessUserCode = (sourceCode: string): string => {
    const userImports = new Set<string>();
    const importRegex = /import\s+(?:{[^}]*}|\*\s+as\s+\w+|\w+)\s+from\s+['"]([^'"]+)['"]/g;
    let match;

    while ((match = importRegex.exec(sourceCode)) !== null) {
      const importPath = match[1];
      userImports.add(importPath);
    }

    let transformedCode = sourceCode;

    if (userImports.has('recharts')) {
      transformedCode = transformedCode.replace(
        /import\s+{([^}]*)}\s+from\s+['"]recharts['"];?/g,
        'const { $1 } = recharts;'
      );
    }
    if (userImports.has('lodash')) {
      transformedCode = transformedCode.replace(
        /import\s+\*\s+as\s+_\s+from\s+['"]lodash['"];?/g,
        '// lodash is available as _'
      );
      transformedCode = transformedCode.replace(
        /import\s+_\s+from\s+['"]lodash['"];?/g,
        '// lodash is available as _'
      );
    }
    if (userImports.has('lucide-react')) {
      transformedCode = transformedCode.replace(
        /import\s+{([^}]*)}\s+from\s+['"]lucide-react['"];?/g,
        'const { $1 } = lucideReact;'
      );
    }
    if (userImports.has('@mui/material')) {
      transformedCode = transformedCode.replace(
        /import\s+{([^}]*)}\s+from\s+['"]@mui\/material['"];?/g,
        'const { $1 } = mui;'
      );
    }
    if (userImports.has('d3')) {
      transformedCode = transformedCode.replace(
        /import\s+\*\s+as\s+d3\s+from\s+['"]d3['"];?/g,
        '// d3 is available as d3'
      );
    }
    if (userImports.has('three')) {
      transformedCode = transformedCode.replace(
        /import\s+\*\s+as\s+THREE\s+from\s+['"]three['"];?/g,
        '// THREE is available as THREE'
      );
    }
    if (userImports.has('tone')) {
      transformedCode = transformedCode.replace(
        /import\s+\*\s+as\s+Tone\s+from\s+['"]tone['"];?/g,
        '// Tone is available as Tone'
      );
    }
    if (userImports.has('mathjs')) {
      transformedCode = transformedCode.replace(
        /import\s+\*\s+as\s+math\s+from\s+['"]mathjs['"];?/g,
        '// math is available as math'
      );
    }

    // Remove leftover import lines
    transformedCode = transformedCode.replace(/import\s+.*?from\s+['"].*?['"];?\n?/g, '');
    // Remove export default lines
    transformedCode = transformedCode.replace(/export\s+default\s+([A-Za-z0-9_]+);?/g, '// exporting $1');

    return transformedCode;
  };

  const renderComponent = (root: ReactDOM.Root) => {
    try {
      setError(null);
      let componentName: string | null = null;

      const arrowMatch = code.match(
        /const\s+([A-Z][A-Za-z0-9_]*)\s*=\s*(?:\(\s*\)|\(\s*props\s*\)|\(\s*{\s*[^}]*}\s*\))\s*=>/
      );
      if (arrowMatch && arrowMatch[1]) {
        componentName = arrowMatch[1];
      }
      if (!componentName) {
        const functionMatch = code.match(/function\s+([A-Z][A-Za-z0-9_]*)\s*\(/);
        if (functionMatch && functionMatch[1]) {
          componentName = functionMatch[1];
        }
      }
      if (!componentName) {
        const exportMatch = code.match(/export\s+default\s+([A-Z][A-Za-z0-9_]*)/);
        if (exportMatch && exportMatch[1]) {
          componentName = exportMatch[1];
        }
      }

      const processedCode = preprocessUserCode(code);

      let transformedCode: string;
      transformedCode = Babel.transform(processedCode, {
        presets: ['react'],
        plugins: [
          function() {
            return {
              visitor: {
                Identifier(path: any) {
                  if (path.node.name === 'development') {
                    path.replaceWith({ type: 'BooleanLiteral', value: true });
                  }
                  if (path.node.name === 'production') {
                    path.replaceWith({ type: 'BooleanLiteral', value: false });
                  }
                }
              }
            };
          }
        ],
        filename: 'usercode.jsx'
      }).code || '';

      let componentExtractionCode;
      if (componentName) {
        componentExtractionCode = `
          try {
            if (typeof ${componentName} === 'function') {
              return ${componentName};
            } else {
              throw new Error('${componentName} is not a valid React component function');
            }
          } catch (err) {
            throw err;
          }
        `;
      } else {
        componentExtractionCode = `
          const potentialComponents = [];
          Object.keys(this).forEach(key => {
            if (typeof this[key] === 'function' && /^[A-Z]/.test(key)) {
              potentialComponents.push({ name: key, component: this[key] });
            }
          });
          if (potentialComponents.length > 0) {
            return potentialComponents[0].component;
          }
          throw new Error('No React component found in code');
        `;
      }

      const wrappedCode = `
        const React = reactLib;
        const {
          useState, useEffect, useRef, useMemo,
          useCallback, useContext, useReducer
        } = reactLib;
        const reactDOM = reactDOMLib;
        const mui = muiLib;
        const recharts = rechartsLib;
        const lucideReact = lucideLib;
        const _ = lodashLib;
        const d3 = d3Lib;
        const THREE = threeLib;
        const Tone = toneLib;
        const math = mathLib;

        const {
          Button, Container, Card, Grid, Box,
          Typography, TextField, Paper, List, ListItem, Divider
        } = mui;

        try {
          ${transformedCode}
          ${componentExtractionCode}
        } catch (err) {
          throw err;
        }
      `;

      let UserComponent: React.ComponentType<any>;
      const execFunc = new Function(
        'reactLib',
        'reactDOMLib',
        'muiLib',
        'rechartsLib',
        'lucideLib',
        'lodashLib',
        'd3Lib',
        'threeLib',
        'toneLib',
        'mathLib',
        wrappedCode
      );

      const execContext: Record<string, any> = {
        console: console,
        setTimeout: setTimeout,
        clearTimeout: clearTimeout,
        setInterval: setInterval,
        clearInterval: clearInterval
      };

      UserComponent = execFunc.call(
        execContext,
        availableModules['react'],
        availableModules['react-dom'],
        availableModules['@mui/material'],
        availableModules['recharts'],
        availableModules['lucide-react'],
        availableModules['lodash'],
        availableModules['d3'],
        availableModules['three'],
        availableModules['tone'],
        availableModules['mathjs']
      );

      if (!UserComponent || typeof UserComponent !== 'function') {
        throw new Error('Component not found or not a valid function');
      }
      setCurrentComponent(() => UserComponent);

      const generateDemoData = (count = 7) => {
        return Array.from({ length: count }, (_, i) => ({
          name: `Category ${i + 1}`,
          value: Math.floor(Math.random() * 1200) + 800,
          count: Math.floor(Math.random() * 150) + 50,
          ratio: Math.random(),
          trend: Math.sin(i / 2) * 100 + 500
        }));
      };

      const WrapperComponent = () => {
        const [activeTab, setActiveTab] = React.useState('dashboard');
        const [demoData, setDemoData] = React.useState(generateDemoData(7));

        const icons = {
          LayoutDashboard: availableModules['lucide-react'].LayoutDashboard,
          BarChart3: availableModules['lucide-react'].BarChart3,
          FileSpreadsheet: availableModules['lucide-react'].FileSpreadsheet,
          Music: availableModules['lucide-react'].Music,
          Hexagon: availableModules['lucide-react'].Hexagon,
          BrainCircuit: availableModules['lucide-react'].BrainCircuit,
          Settings: availableModules['lucide-react'].Settings,
          RotateCcw: availableModules['lucide-react'].RotateCcw,
          PlayCircle: availableModules['lucide-react'].PlayCircle,
          PauseCircle: availableModules['lucide-react'].PauseCircle,
          Wand2: availableModules['lucide-react'].Wand2
        };

        try {
          const props = {
            activeTab,
            setActiveTab,
            demoData,
            setDemoData,
            regenerateData: () => setDemoData(generateDemoData(7)),
            icons,
            LayoutDashboard: icons.LayoutDashboard,
            BarChart3: icons.BarChart3,
            FileSpreadsheet: icons.FileSpreadsheet,
            Music: icons.Music,
            Hexagon: icons.Hexagon,
            BrainCircuit: icons.BrainCircuit,
            Settings: icons.Settings,
            RotateCcw: icons.RotateCcw,
            PlayCircle: icons.PlayCircle,
            PauseCircle: icons.PauseCircle,
            Wand2: icons.Wand2
          };
          return React.createElement(UserComponent, props);
        } catch (err) {
          return (
            <div style={{ padding: '20px', color: 'red' }}>
              <h3>Component Error</h3>
              <p>{err instanceof Error ? err.message : String(err)}</p>
            </div>
          );
        }
      };

      const element = React.createElement(
        class ErrorBoundary extends React.Component<any, { hasError: boolean; error: Error | null }> {
          constructor(props: any) {
            super(props);
            this.state = { hasError: false, error: null };
          }
          static getDerivedStateFromError(error: Error) {
            return { hasError: true, error };
          }
          componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
            console.error("Rendering error caught by boundary:", error, errorInfo);
          }
          render() {
            if (this.state.hasError) {
              return (
                <div style={{ padding: '20px', color: 'red' }}>
                  <h3>Rendering Error</h3>
                  <p>{this.state.error ? this.state.error.message : 'Unknown error'}</p>
                </div>
              );
            }
            return <WrapperComponent />;
          }
        }
      );

      root.render(element);
    } catch (err) {
      console.error(err);
      setError(`Error: ${err instanceof Error ? err.message : String(err)}`);
      root.render(
        <div style={{ padding: '20px', color: 'red' }}>
          <h3>Rendering Error</h3>
          <pre style={{ whiteSpace: 'pre-wrap' }}>{err instanceof Error ? err.message : String(err)}</pre>
        </div>
      );
    }
  };

  const handlePrint = async () => {
    if (!currentComponent || !printRootRef.current) return;
    try {
      const componentToRender = currentComponent;
      printRootRef.current.render(React.createElement(componentToRender));
      setTimeout(() => {
        window.print();
        setTimeout(() => {
          console.log("Print operation complete");
        }, 500);
      }, 300);
    } catch (err) {
      console.error('Error preparing for print:', err);
      setError(`Error preparing for print: ${err instanceof Error ? err.message : String(err)}`);
    }
  };

  // Only style the .app-header, .app-footer, or custom classes in our CSS. 
  // Do not style <header> or <footer> globally.
  const showAppUI = true;

  const sampleButtonStyle = {
    padding: '0.75rem 1rem',
    backgroundColor: '#4A5568',
    color: 'white',
    border: 'none',
    borderRadius: '0.375rem',
    fontSize: '0.875rem',
    fontWeight: 500,
    cursor: 'pointer',
    transition: 'background-color 0.2s ease-in-out',
    boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)'
  };

  return (
    <div
      className="root-container"
      style={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
        height: '100vh',
        overflow: 'hidden'
      }}
    >
      <style>{`
        @media (max-width: 768px) {
          .main-container {
            flex-direction: column !important;
          }
          .left-panel, .right-panel {
            width: 100% !important;
            min-width: 0 !important;
          }
          .root-container {
            overflow: auto !important;
            height: auto !important;
          }
        }
      `}</style>

      {showAppUI && (
        <>
          <div className="app-header">
            <h1>Claude Artifact to PDF Converter</h1>
            <p>Paste your Claude artifact code, see it rendered, and download it as a PDF</p>
          </div>

          <main
            className="main-container"
            style={{
              display: 'flex',
              flexDirection: 'row',
              flex: '1 0 auto',
              padding: '1.5rem',
              gap: '1.5rem',
              maxWidth: '1600px',
              margin: '0 auto',
              width: '100%',
              boxSizing: 'border-box',
              minHeight: '0',
              overflow: 'hidden'
            }}
          >
            <div
              className="left-panel"
              style={{
                width: '45%',
                minWidth: '400px',
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden'
              }}
            >
              <h2 style={{ margin: '0 0 1rem', fontSize: '1.5rem', fontWeight: 600 }}>
                Claude Artifact Code
              </h2>

              <div
                style={{
                  height: 'calc(100vh - 320px)',
                  position: 'relative',
                  border: '1px solid #e2e8f0',
                  borderRadius: '0.5rem',
                  overflow: 'hidden',
                  boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
                  flex: 1
                }}
              >
                <textarea
                  ref={textareaRef}
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  style={{
                    width: '100%',
                    height: '100%',
                    padding: '1rem',
                    fontSize: '0.875rem',
                    fontFamily: 'ui-monospace, SFMono-Regular, SF Mono, Consolas, Liberation Mono, Menlo, monospace',
                    border: 'none',
                    resize: 'none',
                    outline: 'none',
                    overflowY: 'auto',
                    lineHeight: 1.6
                  }}
                  spellCheck={false}
                  placeholder="Paste your Claude artifact React component code here..."
                />
              </div>

              {error && (
                <div
                  style={{
                    marginTop: '1rem',
                    color: '#e53e3e',
                    padding: '0.75rem',
                    border: '1px solid #fed7d7',
                    borderRadius: '0.375rem',
                    backgroundColor: '#fff5f5',
                    fontSize: '0.875rem'
                  }}
                >
                  {error}
                </div>
              )}

              <div
                style={{
                  marginTop: '1rem',
                  display: 'flex',
                  gap: '0.5rem',
                  flexWrap: 'wrap'
                }}
              >
                <button
                  onClick={handlePrint}
                  disabled={!!error || !currentComponent}
                  style={{
                    padding: '0.75rem 1.5rem',
                    backgroundColor: !error && currentComponent ? '#D97757' : '#e2e8f0',
                    color: 'white',
                    border: 'none',
                    borderRadius: '0.375rem',
                    fontSize: '1rem',
                    fontWeight: 500,
                    cursor: !error && currentComponent ? 'pointer' : 'not-allowed',
                    transition: 'background-color 0.2s ease-in-out',
                    boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)'
                  }}
                  onMouseOver={(e) => {
                    if (!error && currentComponent) {
                      e.currentTarget.style.backgroundColor = '#C65D3D';
                    }
                  }}
                  onMouseOut={(e) => {
                    if (!error && currentComponent) {
                      e.currentTarget.style.backgroundColor = '#D97757';
                    }
                  }}
                >
                  Download as PDF
                </button>

                <button
                  onClick={() => loadSampleCode(1)}
                  style={{ ...sampleButtonStyle }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.backgroundColor = '#2D3748';
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.backgroundColor = '#4A5568';
                  }}
                >
                  Sample 1
                </button>
                <button
                  onClick={() => loadSampleCode(2)}
                  style={{ ...sampleButtonStyle }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.backgroundColor = '#2D3748';
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.backgroundColor = '#4A5568';
                  }}
                >
                  Sample 2
                </button>
                <button
                  onClick={() => loadSampleCode(3)}
                  style={{ ...sampleButtonStyle }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.backgroundColor = '#2D3748';
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.backgroundColor = '#4A5568';
                  }}
                >
                  Sample 3
                </button>
              </div>
            </div>

            <div
              className="right-panel"
              style={{
                width: '55%',
                minWidth: '500px'
              }}
            >
              <h2 style={{ margin: '0 0 1rem', fontSize: '1.5rem', fontWeight: 600 }}>
                Component Preview
              </h2>
              <div
                style={{
                  height: 'calc(100vh - 320px)',
                  border: '1px solid #e2e8f0',
                  borderRadius: '0.5rem',
                  overflow: 'auto',
                  boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)'
                }}
              >
                <div
                  ref={codePreviewRef}
                  style={{
                    // Unset all inherited styles so user code uses only its own
                    all: 'unset',
                    display: 'block',
                    boxSizing: 'border-box'
                  }}
                />
              </div>
            </div>
          </main>

          <div
            className="app-footer"
            style={{
              marginTop: 'auto',
              padding: '1rem',
              textAlign: 'center',
              borderTop: '1px solid #e2e8f0',
              backgroundColor: 'white',
              fontSize: '0.875rem',
              flexShrink: 0
            }}
          >
            <p style={{ margin: 0 }}>
              Powered by{' '}
              <a
                href="https://www.genvise.com"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  color: '#D97757',
                  textDecoration: 'none',
                  fontWeight: 500
                }}
              >
                Genvise
              </a>
            </p>
            <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.75rem' }}>
              Your code and outputs are never stored or processed on our servers and remain solely on your computer.
            </p>
          </div>
        </>
      )}

      <div
        id="print-container"
        ref={componentRef}
        style={{
          width: '100%',
          minHeight: '100vh',
          padding: '1.5rem',
          backgroundColor: 'white',
          position: 'absolute',
          left: '-9999px',
          top: 0,
          visibility: 'hidden'
        }}
      >
        {/* The component will be rendered here for printing */}
      </div>
    </div>
  );
}

export default App;
