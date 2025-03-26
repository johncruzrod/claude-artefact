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

// We'll make these Material UI components available
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

/* 
   Placeholder implementations for "@/components/ui/card". 
   These are minimal <div>/<h3> etc. to avoid runtime errors 
   if user code references those imports. They won't have 
   the real styling or logic, just placeholders.
*/
const MyCustomCard = ({ children, className, ...rest }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={className || ''} {...rest}>{children}</div>
);

const MyCustomCardHeader = ({ children, className, ...rest }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={className || ''} {...rest}>{children}</div>
);

const MyCustomCardTitle = ({ children, className, ...rest }: React.HTMLAttributes<HTMLDivElement>) => (
  <h3 className={className || ''} {...rest}>{children}</h3>
);

const MyCustomCardContent = ({ children, className, ...rest }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={className || ''} {...rest}>{children}</div>
);

const MyCustomCardFooter = ({ children, className, ...rest }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={className || ''} {...rest}>{children}</div>
);

const MyCustomCardDescription = ({ children, className, ...rest }: React.HTMLAttributes<HTMLParagraphElement>) => (
  <p className={className || ''} {...rest}>{children}</p>
);

// Combine them into one object mapped to "@/components/ui/card"
const MyCardModule = {
  Card: MyCustomCard,
  CardHeader: MyCustomCardHeader,
  CardTitle: MyCustomCardTitle,
  CardContent: MyCustomCardContent,
  CardFooter: MyCustomCardFooter,
  CardDescription: MyCustomCardDescription,
};

// Our available modules
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
  'mathjs': math,

  // The crucial addition: placeholders for "@/components/ui/card"
  '@/components/ui/card': MyCardModule
};

function App() {
  const [code, setCode] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [currentComponent, setCurrentComponent] = useState<React.ComponentType | null>(null);

  // We'll store a warning message if the user code references "@/components/ui/card"
  const [placeholderWarning, setPlaceholderWarning] = useState<string | null>(null);

  // States to show "copied!" confirmation
  const [hintCopied, setHintCopied] = useState(false);
  const [pdfTipCopied, setPdfTipCopied] = useState(false);

  const codePreviewRef = useRef<HTMLDivElement>(null);
  const componentRef = useRef<HTMLDivElement>(null);
  const rootRef = useRef<ReactDOM.Root | null>(null);
  const printRootRef = useRef<ReactDOM.Root | null>(null);

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // The text we want the user to copy for removing @/components/ui/card
  const removalHintText = `Please create the artifact as is, but without @/components/ui/card`;

  // The text we want the user to copy for PDF print tip
  const pdfBreakTipText = `Can you also make it so that when printed each individual component does not break on the printed pages?`;

  // Function to copy the removal hint text
  const handleCopyHint = () => {
    navigator.clipboard.writeText(removalHintText).then(() => {
      setHintCopied(true);
      setTimeout(() => setHintCopied(false), 2000); // Hide after 2s
    }).catch(err => {
      console.error('Failed to copy text:', err);
    });
  };

  // Function to copy the PDF tip text
  const handleCopyPdfTip = () => {
    navigator.clipboard.writeText(pdfBreakTipText).then(() => {
      setPdfTipCopied(true);
      setTimeout(() => setPdfTipCopied(false), 2000); // Hide after 2s
    }).catch(err => {
      console.error('Failed to copy text:', err);
    });
  };

  // Create React roots once on mount
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

  // Inject a little print CSS
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

  // Re-render on code changes
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

  // Add a new useEffect to load the tutorial on component mount
  useEffect(() => {
    const loadTutorial = async () => {
      try {
        const response = await fetch('/tutorial.txt');
        if (!response.ok) {
          throw new Error(`Failed to load tutorial: ${response.statusText}`);
        }
        const tutorialCode = await response.text();
        setCode(tutorialCode);
        setError(null);
        setPlaceholderWarning(null);
      } catch (err) {
        setError(String(err));
      }
    };
    
    loadTutorial();
  }, []);

  // Load sample code from e.g. public/sample1.txt, public/sample2.txt, ...
  const loadSampleCode = async (sampleNumber: number) => {
    try {
      const response = await fetch(`/sample${sampleNumber}.txt`);
      if (!response.ok) {
        throw new Error(`Failed to load sample ${sampleNumber}: ${response.statusText}`);
      }
      const sampleCode = await response.text();
      setCode(sampleCode);
      setError(null);
      setPlaceholderWarning(null);
    } catch (err) {
      setError(String(err));
    }
  };

  // Preprocess user code: remove/transform imports
  const preprocessUserCode = (sourceCode: string): string => {
    setPlaceholderWarning(null);

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

    // If the user tries to import from "@/components/ui/card", 
    // we do a transform and show a user-friendly warning
    if (userImports.has('@/components/ui/card')) {
      setPlaceholderWarning(
        'We detected a custom library import ("@/components/ui/card") that we cannot fully style.\n\n' +
        'Your component will still render, but it may not look correct.\n\n' +
        'To fix this, please ask Claude to remove "@/components/ui/card" references by saying:\n'
      );

      transformedCode = transformedCode.replace(
        /import\s+{([^}]*)}\s+from\s+['"]@\/components\/ui\/card['"];?/g,
        'const { $1 } = customCard;'
      );
    }

    // Remove any leftover import lines
    transformedCode = transformedCode.replace(/import\s+.*?from\s+['"].*?['"];?\n?/g, '');

    // Remove export default lines
    transformedCode = transformedCode.replace(
      /export\s+default\s+([A-Za-z0-9_]+);?/g,
      '// exporting $1'
    );

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

      const transformedCode = Babel.transform(processedCode, {
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

      let componentExtractionCode: string;
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

        // For "@/components/ui/card" imports
        const customCard = cardLib;

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
        'cardLib',
        wrappedCode
      );

      const execContext: Record<string, any> = {
        console: console,
        setTimeout: setTimeout,
        clearTimeout: clearTimeout,
        setInterval: setInterval,
        clearInterval: clearInterval
      };

      const UserComponent = execFunc.call(
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
        availableModules['mathjs'],
        availableModules['@/components/ui/card']
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
          <pre style={{ whiteSpace: 'pre-wrap' }}>
            {err instanceof Error ? err.message : String(err)}
          </pre>
        </div>
      );
    }
  };

  // Print logic
  const handlePrint = async () => {
    if (!currentComponent || !printRootRef.current) return;
    try {
      const componentToRender = currentComponent;
      // Render in the hidden print container
      printRootRef.current.render(React.createElement(componentToRender));
      // Give it a short delay, then print
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

  const showAppUI = true;

  const sampleButtonStyle: React.CSSProperties = {
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

  // Add this to your state declarations at the top of the App component
  const [leftPanelWidth, setLeftPanelWidth] = useState(35); // Changed from 40 to 35
  const [isDragging, setIsDragging] = useState(false);

  // Update the event handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  // Add this useEffect to handle the mouse move and up events
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      
      const container = document.querySelector('.main-container');
      if (container) {
        const containerRect = container.getBoundingClientRect();
        const newWidth = ((e.clientX - containerRect.left) / containerRect.width) * 100;
        setLeftPanelWidth(Math.min(Math.max(newWidth, 20), 80));
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging]);

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
        .resize-handle {
          width: 8px;
          cursor: col-resize;
          background: #e2e8f0;
          margin: 0 -4px;
          position: relative;
          z-index: 10;
          transition: background 0.2s;
          touch-action: none; /* Prevent touch scrolling while dragging */
        }
        .resize-handle:hover {
          background: #cbd5e1;
        }
        .resize-handle.active {
          background: #94a3b8;
        }
        ${isDragging ? `
          body * {
            cursor: col-resize !important;
            user-select: none !important;
          }
        ` : ''}
      `}</style>

      {showAppUI && (
        <>
          {/* Our custom "header" in the app */}
          <div className="app-header" style={{ padding: '0.5rem 0' }}>
            <h1 style={{ 
              margin: '0 0 0.25rem 0',  // Further reduced margin
              fontSize: '1.5rem'         // Even smaller font size
            }}>
              Claude Artifact to PDF Converter
            </h1>
            <p style={{ 
              margin: 0,                 // Removed all margins
              fontSize: '0.8rem',        // Smaller font size
              color: '#fff'             // Changed from '#666' to '#fff'
            }}>
              Paste your Claude artifact code, see it rendered, and download it as a PDF
            </p>
          </div>

          <main
            className="main-container"
            style={{
              display: 'flex',
              flexDirection: 'row',
              flex: '1',
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
                width: `${leftPanelWidth}%`,
                minWidth: '350px',
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
                  marginBottom: '1rem',
                  padding: '1rem',
                  border: '1px solid #e2e8f0',
                  borderRadius: '0.5rem',
                  backgroundColor: '#f8fafc'
                }}
              >
                <p style={{ 
                  margin: '0 0 0.5rem 0',
                  fontSize: '0.75rem',
                  color: '#1a202c',
                  fontWeight: 600
                }}>
                  Tip: For best results when saving as PDF, tell Claude:
                </p>
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                  <button
                    onClick={handleCopyPdfTip}
                    style={{
                      padding: '0.5rem 0.75rem',
                      fontSize: '0.75rem',
                      cursor: 'pointer',
                      backgroundColor: pdfTipCopied ? '#48BB78' : '#4A5568',
                      color: '#fff',
                      border: 'none',
                      borderRadius: '0.375rem',
                      transition: 'background-color 0.2s ease-in-out'
                    }}
                  >
                    Copy
                  </button>
                  <span style={{ fontSize: '0.75rem', color: '#4A5568' }}>
                    {pdfTipCopied ? 'Copied!' : '"Can you also make it so that when printed each individual component does not break on the printed pages?"'}
                  </span>
                </div>
              </div>

              {/* If we have a placeholder warning, show it above the code box */}
              {placeholderWarning && (
                <div
                  style={{
                    marginBottom: '1rem',
                    padding: '0.75rem',
                    border: '1px solid #fed7d7',
                    borderRadius: '0.375rem',
                    backgroundColor: '#fff5f5',
                    color: '#c62828',
                    fontSize: '0.875rem',
                    whiteSpace: 'pre-line'
                  }}
                >
                  {placeholderWarning}
                  <div
                    style={{
                      backgroundColor: '#fefefe',
                      border: '1px solid #ddd',
                      padding: '0.5rem',
                      borderRadius: '0.25rem',
                      marginTop: '0.5rem',
                      display: 'inline-flex',
                      alignItems: 'center'
                    }}
                  >
                    <code style={{ fontSize: '0.85rem', whiteSpace: 'nowrap' }}>
                      {removalHintText}
                    </code>
                    <button
                      onClick={handleCopyHint}
                      style={{
                        marginLeft: '0.5rem',
                        padding: '0.25rem 0.5rem',
                        fontSize: '0.75rem',
                        cursor: 'pointer',
                        backgroundColor: '#D97757',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '0.25rem'
                      }}
                    >
                      Copy
                    </button>
                    {hintCopied && (
                      <span style={{ marginLeft: '0.5rem', fontSize: '0.75rem', color: '#16a34a' }}>
                        Copied!
                      </span>
                    )}
                  </div>
                </div>
              )}

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
                  onChange={(e) => {
                    setCode(e.target.value);
                    setError(null);
                    setPlaceholderWarning(null);
                  }}
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
              className={`resize-handle ${isDragging ? 'active' : ''}`}
              onMouseDown={handleMouseDown}
              style={{
                width: '8px',
                backgroundColor: isDragging ? '#94a3b8' : '#e2e8f0',
                cursor: 'col-resize',
                margin: '0 -4px',
                position: 'relative',
                zIndex: 10,
                transition: 'background-color 0.2s'
              }}
            />

            <div
              className="right-panel"
              style={{
                width: `${100 - leftPanelWidth}%`,
                minWidth: '350px'
              }}
            >
              <h2 style={{ margin: '0 0 1rem', fontSize: '1.5rem', fontWeight: 600 }}>
                Component Preview
              </h2>

              <div
                style={{
                  height: 'calc(100vh - 240px)',
                  border: '1px solid #e2e8f0',
                  borderRadius: '0.5rem',
                  overflow: 'auto',
                  boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)'
                }}
              >
                <div
                  ref={codePreviewRef}
                  style={{
                    all: 'unset',
                    display: 'block',
                    boxSizing: 'border-box'
                  }}
                />
              </div>
            </div>
          </main>

          {/* Our custom app footer */}
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

      {/* Hidden print container */}
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
        {/* The user's component for printing */}
      </div>
    </div>
  );
}

export default App;
