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
// Available modules for the user code
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
  
  // Function to load sample code from text files
  const loadSampleCode = async (sampleNumber: number) => {
    try {
      const response = await fetch(`/src/sample${sampleNumber}.txt`);
      if (!response.ok) {
        throw new Error(`Failed to load sample ${sampleNumber}: ${response.statusText}`);
      }
      const sampleCode = await response.text();
      setCode(sampleCode);
    } catch (err) {
      console.error(`Error loading sample ${sampleNumber}:`, err);
      setError(`Error loading sample ${sampleNumber}: ${err instanceof Error ? err.message : String(err)}`);
    }
  };
  
  // Create roots - this only runs once on mount and not on re-renders
  useEffect(() => {
    let previewRoot: ReactDOM.Root | null = null;
    let printRoot: ReactDOM.Root | null = null;
    
    // Create roots only if they don't exist
    if (codePreviewRef.current && !rootRef.current) {
      previewRoot = ReactDOM.createRoot(codePreviewRef.current);
      rootRef.current = previewRoot;
    }
    
    if (componentRef.current && !printRootRef.current) {
      printRoot = ReactDOM.createRoot(componentRef.current);
      printRootRef.current = printRoot;
    }
    
    // Initial render of the component
    if (previewRoot) {
      try {
        renderComponent(previewRoot);
      } catch (error) {
        console.error("Initial render error:", error);
      }
    }
    
    // Cleanup function
    return () => {
      // Use local variables to avoid accessing potentially nullified refs
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
      
      // Clear refs
      rootRef.current = null;
      printRootRef.current = null;
    };
  }, []); // Empty dependency array means this only runs once
  // Add print style to document head
  useEffect(() => {
    // Create a style element for print styles
    const style = document.createElement('style');
    style.type = 'text/css';
    style.media = 'print';
    
    // Define styles that hide everything except the print-container when printing
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
    
    // Add the style element to document head
    document.head.appendChild(style);
    
    // Clean up function to remove the style element when component unmounts
    return () => {
      document.head.removeChild(style);
    };
  }, []);
  // Handle code changes
  useEffect(() => {
    // Only re-render if the root already exists
    if (rootRef.current) {
      try {
        renderComponent(rootRef.current);
      } catch (error) {
        console.error("Error rendering component on code change:", error);
        setError(`Rendering error: ${error instanceof Error ? error.message : String(error)}`);
      }
    }
  }, [code]);
  // Function to modify imports in user code
  const preprocessUserCode = (sourceCode: string): string => {
    // Keep track of what the user is importing
    const userImports = new Set<string>();
    
    // First, check what libraries the user is importing
    const importRegex = /import\s+(?:{[^}]*}|\*\s+as\s+\w+|\w+)\s+from\s+['"]([^'"]+)['"]/g;
    let match;
    
    while ((match = importRegex.exec(sourceCode)) !== null) {
      const importPath = match[1];
      userImports.add(importPath);
    }
    
    // Transform the code to handle imports
    let transformedCode = sourceCode;
    
    // Replace direct imports with namespace imports where needed
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
    
    // Add support for d3.js imports
    if (userImports.has('d3')) {
      transformedCode = transformedCode.replace(
        /import\s+\*\s+as\s+d3\s+from\s+['"]d3['"];?/g,
        '// d3 is available as d3'
      );
    }
    
    // Add support for three.js imports
    if (userImports.has('three')) {
      transformedCode = transformedCode.replace(
        /import\s+\*\s+as\s+THREE\s+from\s+['"]three['"];?/g,
        '// THREE is available as THREE'
      );
    }
    
    // Add support for tone.js imports
    if (userImports.has('tone')) {
      transformedCode = transformedCode.replace(
        /import\s+\*\s+as\s+Tone\s+from\s+['"]tone['"];?/g,
        '// Tone is available as Tone'
      );
    }
    
    // Add support for mathjs imports
    if (userImports.has('mathjs')) {
      transformedCode = transformedCode.replace(
        /import\s+\*\s+as\s+math\s+from\s+['"]mathjs['"];?/g,
        '// math is available as math'
      );
    }
    
    // Remove all remaining import statements
    transformedCode = transformedCode.replace(/import\s+.*?from\s+['"].*?['"];?\n?/g, '');
    
    // Remove export default statements
    transformedCode = transformedCode.replace(/export\s+default\s+([A-Za-z0-9_]+);?/g, '// exporting $1');
    
    return transformedCode;
  };
  // Function to render the component to a specified root
  const renderComponent = (root: ReactDOM.Root) => {
    try {
      // Clear previous error
      setError(null);
      
      console.log("Processing component code...");
      
      // ===== STEP 1: EXTRACT COMPONENT INFO =====
      // First, identify the component name and type
      let componentName: string | null = null;
      // Check for arrow function components (most common)
      const arrowMatch = code.match(/const\s+([A-Z][A-Za-z0-9_]*)\s*=\s*(?:\(\s*\)|\(\s*props\s*\)|\(\s*{\s*[^}]*}\s*\))\s*=>/);
      if (arrowMatch && arrowMatch[1]) {
        componentName = arrowMatch[1];        
        console.log(`Found arrow function component: ${componentName}`);
      }
      
      // Check for function components
      if (!componentName) {
        const functionMatch = code.match(/function\s+([A-Z][A-Za-z0-9_]*)\s*\(/);
        if (functionMatch && functionMatch[1]) {
          componentName = functionMatch[1];          
          console.log(`Found function component: ${componentName}`);
        }
      }
      
      // Check export default for component name
      if (!componentName) {
        const exportMatch = code.match(/export\s+default\s+([A-Z][A-Za-z0-9_]*)/);
        if (exportMatch && exportMatch[1]) {
          componentName = exportMatch[1];          
          console.log(`Found component from export default: ${componentName}`);
        }
      }
      
      // ===== STEP 2: PREPROCESS CODE =====
      console.log("Preprocessing code...");
      
      // Process the code to handle imports and exports
      const processedCode = preprocessUserCode(code);
      
      // ===== STEP 3: APPLY BABEL TRANSFORMATION =====
      console.log("Applying Babel transformation...");
      
      let transformedCode: string;
      try {
        // @ts-ignore - Babel types aren't properly defined
        transformedCode = Babel.transform(processedCode, {
          presets: ['react'],
          plugins: [
            // Handle environment variables
            function() {
              return {
                visitor: {
                  // @ts-ignore - Babel visitor path type isn't properly defined
                  Identifier(path: any) {
                    if (path.node.name === 'development') {
                      // @ts-ignore - Babel types isn't properly defined
                      path.replaceWith({ type: 'BooleanLiteral', value: true });
                    }
                    if (path.node.name === 'production') {
                      // @ts-ignore - Babel types isn't properly defined
                      path.replaceWith({ type: 'BooleanLiteral', value: false });
                    }
                  }
                }
              };
            }
          ],
          filename: 'usercode.jsx',
        }).code || '';
        
        console.log("Babel transformation successful");
      } catch (babelError) {
        console.error("Babel transformation failed:", babelError);
        throw new Error(`Code transformation failed: ${babelError instanceof Error ? babelError.message : String(babelError)}`);
      }
      
      // ===== STEP 4: CREATE WRAPPER CODE =====
      console.log("Creating component wrapper...");
      
      // Create a more targeted wrapper based on the component type
      let componentExtractionCode;
      if (componentName) {
        // We know the component name, so we can directly reference it
        componentExtractionCode = `
          // Extract the component directly by name
          try {
            // Check if the component was defined and is a function
            if (typeof ${componentName} === 'function') {
              console.log('Found component by name: ${componentName}');
              return ${componentName};
            } else {
              console.error('Component ${componentName} found but is not a function:', ${componentName});
              throw new Error('Component ${componentName} is not a valid React component function');
            }
          } catch (err) {
            console.error('Error extracting component ${componentName}:', err);
            throw err;
          }
        `;
      } else {
        // We don't know the component name, so scan for potential components
        componentExtractionCode = `
          // Scan for potential components in the global context
          const potentialComponents = [];
          
          // Scan for components by React naming convention (PascalCase)
          Object.keys(this).forEach(key => {
            if (typeof this[key] === 'function' && /^[A-Z]/.test(key) && 
                !['React', 'ReactDOM', 'Object', 'Array', 'Function'].includes(key)) {
              potentialComponents.push({ name: key, component: this[key] });
            }
          });
          
          console.log('Found potential components:', potentialComponents.map(c => c.name));
          
          if (potentialComponents.length > 0) {
            // Return the first component we found
            return potentialComponents[0].component;
          }
          
          throw new Error('No React component found in the code');
        `;
      }
      
      // Full wrapper code - explicitly make Material UI components available
      const wrappedCode = `
        // Make React available
        const React = reactLib;
        const { 
          useState, useEffect, useRef, useMemo, 
          useCallback, useContext, useReducer 
        } = reactLib;
        
        // Make libraries available with namespaces to prevent naming conflicts
        const reactDOM = reactDOMLib;
        const mui = muiLib;
        const recharts = rechartsLib;
        const lucideReact = lucideLib;
        const _ = lodashLib;
        const d3 = d3Lib;
        const THREE = threeLib;
        const Tone = toneLib;
        const math = mathLib;
        
        // Make common Material UI components directly available
        const { 
          Button, Container, Card, Grid, Box, 
          Typography, TextField, Paper, List, ListItem, Divider 
        } = mui;
        
        // Define user's component
        try {
          ${transformedCode}
          
          ${componentExtractionCode}
        } catch (err) {
          console.error('Evaluation error:', err);
          throw err;
        }
      `;
      
      // ===== STEP 5: EXECUTE CODE =====
      console.log("Executing component code...");
      
      let UserComponent: React.ComponentType<any>;
      try {
        // Create function from the wrapped code
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
        
        // Safe execution context
        const execContext: Record<string, any> = {
          console: console,
          setTimeout: setTimeout,
          clearTimeout: clearTimeout,
          setInterval: setInterval,
          clearInterval: clearInterval
        };
        
        // Execute function to get the component
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
        
        // Validate the component is a function
        if (!UserComponent || typeof UserComponent !== 'function') {
          throw new Error(`Component not found or not a function. Check that your component is properly defined.`);
        }
        
        // Save component for printing
        setCurrentComponent(() => UserComponent);
        console.log("Component successfully evaluated");
      } catch (err) {
        console.error('Execution error:', err);
        const errorMessage = err instanceof Error ? err.message : String(err);
        throw new Error(`Component execution failed: ${errorMessage}`);
      }
      
      // ===== STEP 6: RENDER COMPONENT =====
      console.log("Rendering component...");
      
      try {
        // Generate proper demo data function similar to the one in the component
        const generateDemoData = (count = 7) => {
          return Array.from({ length: count }, (_, i) => ({
            name: `Category ${i+1}`,
            value: Math.floor(Math.random() * 1200) + 800,
            count: Math.floor(Math.random() * 150) + 50,
            ratio: Math.random(),
            trend: Math.sin(i/2) * 100 + 500
          }));
        };
        
        // Create wrapper component that provides all expected props/state
        const WrapperComponent = () => {
          // Add all state that might be needed by the component
          const [activeTab, setActiveTab] = React.useState('dashboard');
          const [demoData, setDemoData] = React.useState(generateDemoData(7));
          
          // Ensure we have the Lucide icons that the component needs
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
          
          // Clean and fix potential JSX issues by wrapping the component
          // Fix broken/incomplete JSX that might be in the original component
          try {
            // Create props object with all needed values
            const props = {
              activeTab,
              setActiveTab,
              demoData,
              setDemoData,
              regenerateData: () => setDemoData(generateDemoData(7)),
              icons: icons,
              // Provide all Lucide icon components
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
            
            // Return the user component with props
            return React.createElement(UserComponent, props);
          } catch (err) {
            console.error("Error in wrapper component:", err);
            return React.createElement(
              'div',
              { style: { padding: '20px', color: 'red' } },
              React.createElement('h3', null, 'Component Error'),
              React.createElement('p', null, err instanceof Error ? err.message : String(err))
            );
          }
        };
        
        // Create element with error boundary
        const element = React.createElement(
          class ErrorBoundary extends React.Component<any, {hasError: boolean, error: Error | null}> {
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
                return React.createElement(
                  'div',
                  { style: { padding: '20px', color: 'red' } },
                  React.createElement('h3', null, 'Rendering Error'),
                  React.createElement('p', null, this.state.error ? this.state.error.message : 'Unknown error')
                );
              }
              
              return React.createElement(WrapperComponent);
            }
          }
        );
        
        // Render with the error boundary wrapper
        root.render(element);
        console.log("Component successfully rendered");
      } catch (renderError) {
        console.error('Error in final rendering step:', renderError);
        throw new Error(`Rendering failed: ${renderError instanceof Error ? renderError.message : String(renderError)}`);
      }
      
    } catch (err) {
      console.error('Error rendering component:', err);
      setError(`Error: ${err instanceof Error ? err.message : String(err)}`);
      
      // Show error in the preview
      root.render(
        React.createElement(
          'div',
          { style: { padding: '20px', color: 'red' } },
          React.createElement('h3', null, 'Rendering Error'),
          React.createElement('pre', { style: { whiteSpace: 'pre-wrap' } }, 
            err instanceof Error ? err.message : String(err)
          )
        )
      );
    }
  };
  // Function to handle printing without affecting the main UI
  const handlePrint = async () => {
    if (!currentComponent || !printRootRef.current) return;
    
    try {
      // Store the component before printing
      const componentToRender = currentComponent;
      
      // Render the component in the print container
      printRootRef.current.render(React.createElement(componentToRender));
      
      // CSS in @media print will handle visibility during print
      // Open print dialog after a short delay to ensure rendering is complete
      setTimeout(() => {
        window.print();
        
        // Reset after printing dialog is closed
        setTimeout(() => {
          console.log("Print operation complete");
        }, 500);
      }, 300);
    } catch (err) {
      console.error('Error preparing for print:', err);
      setError(`Error preparing for print: ${err instanceof Error ? err.message : String(err)}`);
    }
  };
  // Determine if we should show the app UI or just the print view
  const showAppUI = true; // Always show the app UI
  
  // Define the common style for sample buttons
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
    boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
  };
  
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      minHeight: '100vh',
      height: '100vh', /* Force full height */
      fontFamily: 'Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      color: '#1a202c',
      background: '#f7fafc',
      overflow: 'hidden' /* Prevent body scroll */
    }}>
      {showAppUI && (
        <>
          <header style={{
            background: 'linear-gradient(135deg, #D97757 0%, #E68B6F 40%, #F2A48D 100%)',
            color: 'white',
            padding: '1.5rem',
            textAlign: 'center',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
            flexShrink: 0 /* Prevent header from shrinking */
          }}>
            <h1 style={{ margin: '0 0 0.5rem', fontSize: '2.25rem', fontWeight: 700 }}>Claude Artifact to PDF Converter</h1>
            <p style={{ margin: 0, fontSize: '1.125rem', opacity: 0.9 }}>
              Paste your Claude artifact code, see it rendered, and download it as a PDF
            </p>
          </header>
          <main style={{
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
            overflow: 'hidden' /* Prevent main content from causing scroll */
          }}>
            <div style={{ 
              width: '45%', 
              minWidth: '400px',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden' /* Contain any overflow */
            }}>
              <h2 style={{ 
                margin: '0 0 1rem', 
                fontSize: '1.5rem', 
                fontWeight: 600, 
                color: '#4a5568' 
              }}>
                Claude Artifact Code
              </h2>
              <div style={{ 
                height: 'calc(100vh - 320px)', /* Adjusted to leave room for header, footer, and margins */
                position: 'relative',
                border: '1px solid #e2e8f0',
                borderRadius: '0.5rem',
                overflow: 'hidden',
                backgroundColor: 'white',
                boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
                flex: 1
              }}>
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
                    backgroundColor: '#f8fafc',
                    border: 'none',
                    resize: 'none',
                    outline: 'none',
                    overflowY: 'auto',
                    lineHeight: 1.6,
                    color: '#1a202c'
                  }}
                  spellCheck={false}
                  placeholder="Paste your Claude artifact React component code here..."
                />
              </div>
              {error && (
                <div style={{
                  marginTop: '1rem',
                  color: '#e53e3e',
                  padding: '0.75rem',
                  border: '1px solid #fed7d7',
                  borderRadius: '0.375rem',
                  backgroundColor: '#fff5f5',
                  fontSize: '0.875rem'
                }}>
                  {error}
                </div>
              )}
              
              {/* Action buttons */}
              <div style={{ 
                marginTop: '1rem', 
                display: 'flex', 
                gap: '0.5rem', 
                flexWrap: 'wrap'
              }}>
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
                    boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
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
                
                {/* Sample artifact buttons */}
                <button 
                  onClick={() => loadSampleCode(1)}
                  style={{...sampleButtonStyle}}
                  onMouseOver={(e) => { e.currentTarget.style.backgroundColor = '#2D3748'; }}
                  onMouseOut={(e) => { e.currentTarget.style.backgroundColor = '#4A5568'; }}
                >
                  Sample 1
                </button>
                
                <button 
                  onClick={() => loadSampleCode(2)}
                  style={{...sampleButtonStyle}}
                  onMouseOver={(e) => { e.currentTarget.style.backgroundColor = '#2D3748'; }}
                  onMouseOut={(e) => { e.currentTarget.style.backgroundColor = '#4A5568'; }}
                >
                  Sample 2
                </button>
                
                <button 
                  onClick={() => loadSampleCode(3)}
                  style={{...sampleButtonStyle}}
                  onMouseOver={(e) => { e.currentTarget.style.backgroundColor = '#2D3748'; }}
                  onMouseOut={(e) => { e.currentTarget.style.backgroundColor = '#4A5568'; }}
                >
                  Sample 3
                </button>
              </div>
            </div>
            <div style={{ 
              width: '55%', 
              minWidth: '500px',
            }}>
              <h2 style={{ 
                margin: '0 0 1rem', 
                fontSize: '1.5rem', 
                fontWeight: 600,
                color: '#4a5568'
              }}>
                Component Preview
              </h2>
              <div style={{ 
                height: 'calc(100vh - 320px)', /* Adjusted to leave room for header, footer, and margins */
                border: '1px solid #e2e8f0',
                borderRadius: '0.5rem',
                overflow: 'auto',
                backgroundColor: 'white',
                boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
              }}>
                <div ref={codePreviewRef} style={{ padding: '1.5rem' }}>
                  {/* The component will be rendered here */}
                </div>
              </div>
            </div>
          </main>
          <footer style={{ 
            marginTop: 'auto',
            padding: '1rem',
            textAlign: 'center',
            borderTop: '1px solid #e2e8f0',
            backgroundColor: 'white',
            fontSize: '0.875rem',
            color: '#4a5568',
            flexShrink: 0 /* Prevent footer from shrinking */
          }}>
            <p style={{ margin: 0 }}>
              Powered by <a 
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
            <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.75rem', color: '#718096' }}>
              Your code and outputs are never stored or processed on our servers and remain solely on your computer.
            </p>
          </footer>
        </>
      )}
      
      {/* Print container - always rendered but visibility controlled by CSS */}
      <div id="print-container" ref={componentRef} style={{
        width: '100%',
        minHeight: '100vh',
        padding: '1.5rem',
        backgroundColor: 'white',
        position: 'absolute',
        left: '-9999px',
        top: 0,
        visibility: 'hidden' /* Hidden by default, print CSS will make it visible */
      }}>
        {/* The component will be rendered here for printing */}
      </div>
    </div>
  );
}
export default App;