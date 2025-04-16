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
import { Info } from 'lucide-react';
import { Link } from 'react-router-dom';

// Import the actual ShadCN components using relative paths
import { Card as ShadcnCard, CardHeader as ShadcnCardHeader, CardFooter as ShadcnCardFooter, 
  CardTitle as ShadcnCardTitle, CardDescription as ShadcnCardDescription, 
  CardContent as ShadcnCardContent } from "./components/ui/card";
import { Button as ShadcnButton } from "./components/ui/button";
import { Badge as ShadcnBadge } from "./components/ui/badge";

// Import additional ShadCN components
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, 
  DialogTitle, DialogTrigger } from "./components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, 
  DropdownMenuTrigger } from "./components/ui/dropdown-menu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./components/ui/tabs";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, 
  SelectValue } from "./components/ui/select";
import { Input } from "./components/ui/input";
import { Table, TableBody, TableCaption, TableCell, TableHead, 
  TableHeader, TableRow } from "./components/ui/table";
import { Alert, AlertDescription, AlertTitle } from "./components/ui/alert";
import { Label } from "./components/ui/label";
import { Switch } from "./components/ui/switch";
import { Checkbox } from "./components/ui/checkbox";
import { Avatar, AvatarFallback, AvatarImage } from "./components/ui/avatar";
import { Slider } from "./components/ui/slider";
import { Separator } from "./components/ui/separator";
import { Popover, PopoverContent, PopoverTrigger } from "./components/ui/popover";
import { Progress } from "./components/ui/progress";

// We'll make these Material UI components available
import { 
  Button as MuiButton, 
  Container, 
  Card as MuiCard, 
  Grid, 
  Box, 
  Typography, 
  TextField,
  Paper,
  List,
  ListItem,
  Divider 
} from '@mui/material';

// Create module objects for ShadCN paths - using the actual components now
const ButtonModule = {
  Button: ShadcnButton
};

const BadgeModule = {
  Badge: ShadcnBadge
};

const CardModule = {
  Card: ShadcnCard,
  CardHeader: ShadcnCardHeader, 
  CardFooter: ShadcnCardFooter,
  CardTitle: ShadcnCardTitle,
  CardDescription: ShadcnCardDescription,
  CardContent: ShadcnCardContent
};

// Additional ShadCN component modules
const DialogModule = {
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger
};

const DropdownMenuModule = {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
};

const TabsModule = {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
};

const SelectModule = {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue
};

const InputModule = {
  Input
};

const TableModule = {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
};

const AlertModule = {
  Alert,
  AlertDescription,
  AlertTitle
};

const LabelModule = {
  Label
};

const SwitchModule = {
  Switch
};

const CheckboxModule = {
  Checkbox
};

const AvatarModule = {
  Avatar,
  AvatarFallback,
  AvatarImage
};

const SliderModule = {
  Slider
};

const SeparatorModule = {
  Separator
};

const PopoverModule = {
  Popover,
  PopoverContent,
  PopoverTrigger
};

const ProgressModule = {
  Progress
};

// Our available modules
const availableModules = {
  'react': React,
  '@mui/material': {
    Button: MuiButton, 
    Container, 
    Card: MuiCard, 
    Grid, 
    Box, 
    Typography, 
    TextField, 
    Paper, 
    List, 
    ListItem, 
    Divider
  },
  'react-dom': ReactDOM,
  'lucide-react': LucideIcons,
  'recharts': Recharts,
  'lodash': _,
  'd3': d3,
  'three': THREE,
  'tone': Tone,
  'mathjs': math,
  // ShadCN/UI components with our actual implementations
  '@/components/ui/card': CardModule,
  '@/components/ui/button': ButtonModule,
  '@/components/ui/badge': BadgeModule,
  // Additional ShadCN components
  '@/components/ui/dialog': DialogModule,
  '@/components/ui/dropdown-menu': DropdownMenuModule,
  '@/components/ui/tabs': TabsModule,
  '@/components/ui/select': SelectModule,
  '@/components/ui/input': InputModule,
  '@/components/ui/table': TableModule,
  '@/components/ui/alert': AlertModule,
  '@/components/ui/label': LabelModule,
  '@/components/ui/switch': SwitchModule,
  '@/components/ui/checkbox': CheckboxModule,
  '@/components/ui/avatar': AvatarModule,
  '@/components/ui/slider': SliderModule,
  '@/components/ui/separator': SeparatorModule,
  '@/components/ui/popover': PopoverModule,
  '@/components/ui/progress': ProgressModule
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

  // Wrap preprocessUserCode in useCallback - moved BEFORE renderComponent
  const preprocessUserCode = React.useCallback((sourceCode: string): string => {
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
    // If the user tries to import from "@/components/ui/card"
    if (userImports.has('@/components/ui/card')) {
      transformedCode = transformedCode.replace(
        /import\s+{([^}]*)}\s+from\s+['"]@\/components\/ui\/card['"];?/g,
        'const { $1 } = shadcnCard;'
      );
    }
    
    // ShadCN/UI imports handling
    if (userImports.has('@/components/ui/button')) {
      transformedCode = transformedCode.replace(
        /import\s+{([^}]*)}\s+from\s+['"]@\/components\/ui\/button['"];?/g,
        'const { $1 } = shadcnButton;'
      );
    }
    if (userImports.has('@/components/ui/badge')) {
      transformedCode = transformedCode.replace(
        /import\s+{([^}]*)}\s+from\s+['"]@\/components\/ui\/badge['"];?/g,
        'const { $1 } = shadcnBadge;'
      );
    }
    if (userImports.has('@/components/ui/card')) {
      setPlaceholderWarning(null); // Don't show warning for our supported components
      transformedCode = transformedCode.replace(
        /import\s+{([^}]*)}\s+from\s+['"]@\/components\/ui\/card['"];?/g,
        'const { $1 } = shadcnCard;'
      );
    }
    
    // Additional ShadCN components
    if (userImports.has('@/components/ui/dialog')) {
      transformedCode = transformedCode.replace(
        /import\s+{([^}]*)}\s+from\s+['"]@\/components\/ui\/dialog['"];?/g,
        'const { $1 } = shadcnDialog;'
      );
    }
    if (userImports.has('@/components/ui/dropdown-menu')) {
      transformedCode = transformedCode.replace(
        /import\s+{([^}]*)}\s+from\s+['"]@\/components\/ui\/dropdown-menu['"];?/g,
        'const { $1 } = shadcnDropdownMenu;'
      );
    }
    if (userImports.has('@/components/ui/tabs')) {
      transformedCode = transformedCode.replace(
        /import\s+{([^}]*)}\s+from\s+['"]@\/components\/ui\/tabs['"];?/g,
        'const { $1 } = shadcnTabs;'
      );
    }
    if (userImports.has('@/components/ui/select')) {
      transformedCode = transformedCode.replace(
        /import\s+{([^}]*)}\s+from\s+['"]@\/components\/ui\/select['"];?/g,
        'const { $1 } = shadcnSelect;'
      );
    }
    if (userImports.has('@/components/ui/input')) {
      transformedCode = transformedCode.replace(
        /import\s+{([^}]*)}\s+from\s+['"]@\/components\/ui\/input['"];?/g,
        'const { $1 } = shadcnInput;'
      );
    }
    if (userImports.has('@/components/ui/table')) {
      transformedCode = transformedCode.replace(
        /import\s+{([^}]*)}\s+from\s+['"]@\/components\/ui\/table['"];?/g,
        'const { $1 } = shadcnTable;'
      );
    }
    
    if (userImports.has('@/components/ui/alert')) {
      transformedCode = transformedCode.replace(
        /import\s+{([^}]*)}\s+from\s+['"]@\/components\/ui\/alert['"];?/g,
        'const { $1 } = shadcnAlert;'
      );
    }
    
    if (userImports.has('@/components/ui/label')) {
      transformedCode = transformedCode.replace(
        /import\s+{([^}]*)}\s+from\s+['"]@\/components\/ui\/label['"];?/g,
        'const { $1 } = shadcnLabel;'
      );
    }
    
    if (userImports.has('@/components/ui/switch')) {
      transformedCode = transformedCode.replace(
        /import\s+{([^}]*)}\s+from\s+['"]@\/components\/ui\/switch['"];?/g,
        'const { $1 } = shadcnSwitch;'
      );
    }
    
    if (userImports.has('@/components/ui/checkbox')) {
      transformedCode = transformedCode.replace(
        /import\s+{([^}]*)}\s+from\s+['"]@\/components\/ui\/checkbox['"];?/g,
        'const { $1 } = shadcnCheckbox;'
      );
    }
    
    if (userImports.has('@/components/ui/avatar')) {
      transformedCode = transformedCode.replace(
        /import\s+{([^}]*)}\s+from\s+['"]@\/components\/ui\/avatar['"];?/g,
        'const { $1 } = shadcnAvatar;'
      );
    }
    
    if (userImports.has('@/components/ui/slider')) {
      transformedCode = transformedCode.replace(
        /import\s+{([^}]*)}\s+from\s+['"]@\/components\/ui\/slider['"];?/g,
        'const { $1 } = shadcnSlider;'
      );
    }
    
    if (userImports.has('@/components/ui/separator')) {
      transformedCode = transformedCode.replace(
        /import\s+{([^}]*)}\s+from\s+['"]@\/components\/ui\/separator['"];?/g,
        'const { $1 } = shadcnSeparator;'
      );
    }
    
    if (userImports.has('@/components/ui/popover')) {
      transformedCode = transformedCode.replace(
        /import\s+{([^}]*)}\s+from\s+['"]@\/components\/ui\/popover['"];?/g,
        'const { $1 } = shadcnPopover;'
      );
    }
    
    if (userImports.has('@/components/ui/progress')) {
      transformedCode = transformedCode.replace(
        /import\s+{([^}]*)}\s+from\s+['"]@\/components\/ui\/progress['"];?/g,
        'const { $1 } = shadcnProgress;'
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
  }, [setPlaceholderWarning]);

  // Wrap renderComponent in useCallback - moved BEFORE the useEffect that uses it
  const renderComponent = React.useCallback((root: ReactDOM.Root) => {
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
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
      
      // THIS IS THE FIX: Make shadcn components available before MUI components
      // to avoid naming conflicts
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
        
        // For ShadCN/UI imports - MAKE THESE AVAILABLE FIRST with their proper structure
        // Shadcn components are exported as named exports
        const shadcnButton = shadcnButtonLib;
        const shadcnBadge = shadcnBadgeLib;
        const shadcnCard = shadcnCardLib;
        const shadcnDialog = shadcnDialogLib;
        const shadcnDropdownMenu = shadcnDropdownMenuLib;
        const shadcnTabs = shadcnTabsLib;
        const shadcnSelect = shadcnSelectLib;
        const shadcnInput = shadcnInputLib;
        const shadcnTable = shadcnTableLib;
        const shadcnAlert = shadcnAlertLib;
        const shadcnLabel = shadcnLabelLib;
        const shadcnSwitch = shadcnSwitchLib;
        const shadcnCheckbox = shadcnCheckboxLib;
        const shadcnAvatar = shadcnAvatarLib;
        const shadcnSlider = shadcnSliderLib;
        const shadcnSeparator = shadcnSeparatorLib;
        const shadcnPopover = shadcnPopoverLib;
        const shadcnProgress = shadcnProgressLib;
        
        // NEW: Use renamed MUI components to avoid conflicts with shadcn
        const {
          Button: MuiButton, Container, Card: MuiCard, Grid, Box,
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
        'shadcnCardLib',
        'shadcnButtonLib',
        'shadcnBadgeLib',
        'shadcnDialogLib',
        'shadcnDropdownMenuLib',
        'shadcnTabsLib',
        'shadcnSelectLib',
        'shadcnInputLib',
        'shadcnTableLib',
        'shadcnAlertLib',
        'shadcnLabelLib',
        'shadcnSwitchLib',
        'shadcnCheckboxLib',
        'shadcnAvatarLib',
        'shadcnSliderLib',
        'shadcnSeparatorLib',
        'shadcnPopoverLib',
        'shadcnProgressLib',
        wrappedCode
      );
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
        availableModules['@/components/ui/card'],
        availableModules['@/components/ui/button'],
        availableModules['@/components/ui/badge'],
        availableModules['@/components/ui/dialog'],
        availableModules['@/components/ui/dropdown-menu'],
        availableModules['@/components/ui/tabs'],
        availableModules['@/components/ui/select'],
        availableModules['@/components/ui/input'],
        availableModules['@/components/ui/table'],
        availableModules['@/components/ui/alert'],
        availableModules['@/components/ui/label'],
        availableModules['@/components/ui/switch'],
        availableModules['@/components/ui/checkbox'],
        availableModules['@/components/ui/avatar'],
        availableModules['@/components/ui/slider'],
        availableModules['@/components/ui/separator'],
        availableModules['@/components/ui/popover'],
        availableModules['@/components/ui/progress']
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
        // Use 'object' for props type as suggested by ESLint instead of {}
        class ErrorBoundary extends React.Component<object, { hasError: boolean; error: Error | null }> {
          constructor(props: object) {
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
  }, [code, setError, setCurrentComponent, preprocessUserCode]);

  // Re-render on code changes - Now uses the correctly defined renderComponent
  useEffect(() => {
    if (rootRef.current) {
      try {
        renderComponent(rootRef.current);
      } catch (error) {
        console.error("Error rendering component on code change:", error);
        setError(`Rendering error: ${error instanceof Error ? error.message : String(error)}`);
      }
    }
  }, [code, renderComponent]);

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
          <div className="genvise-app-header" style={{ 
            padding: '0.5rem 1.5rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <div style={{ flexGrow: 1, textAlign: 'center', marginRight: '1rem' }}>
              <h1 style={{ 
                margin: '0 0 0.25rem 0',
                fontSize: '1.5rem'
              }}>
                Claude Artifact to PDF Converter
              </h1>
              <p style={{ 
                margin: 0,
                fontSize: '0.8rem',
                color: '#fff'
              }}>
                Paste your Claude artifact code, see it rendered, and download it as a PDF.
                Your code and outputs are never stored or processed on our servers and remain solely on your computer.{' '}
                <Link 
                  to="/privacy" 
                  style={{
                    color: '#fff',
                    textDecoration: 'underline',
                    fontWeight: 500
                  }}
                >
                  Privacy Policy
                </Link>
              </p>
            </div>
            
            <Link 
              to="/info" 
              title="About this tool"
              style={{
                color: '#fff',
                padding: '0.3rem',
                borderRadius: '50%',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'background-color 0.2s',
                marginLeft: '1rem',
                flexShrink: 0
              }}
              onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.2)'}
              onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
            >
              <Info size={20} />
            </Link>
          </div>
          
          {/* Samples Bar */}
          <div style={{
            padding: '0.75rem 1.5rem',
            backgroundColor: '#f8fafc',
            borderBottom: '1px solid #e2e8f0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '1rem',
            flexWrap: 'wrap'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '1rem',
              maxWidth: '1600px',
              width: '100%',
              justifyContent: 'center'
            }}>
              <span style={{
                fontSize: '0.875rem',
                fontWeight: 500,
                color: '#4a5568'
              }}>
                Sample Artifacts:
              </span>
              <div style={{
                display: 'flex',
                gap: '0.5rem'
              }}>
                {[
                  { id: 1, name: 'Dashboard' },
                  { id: 2, name: 'Avocado' },
                  { id: 3, name: 'Pendulum' }
                ].map((sample) => (
                  <button
                    key={sample.id}
                    onClick={() => loadSampleCode(sample.id)}
                    style={{
                      padding: '0.5rem 0.75rem',
                      backgroundColor: '#4A5568',
                      color: 'white',
                      border: 'none',
                      borderRadius: '0.375rem',
                      fontSize: '0.75rem',
                      fontWeight: 500,
                      cursor: 'pointer',
                      transition: 'background-color 0.2s ease-in-out',
                      boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)'
                    }}
                    onMouseOver={(e) => {
                      e.currentTarget.style.backgroundColor = '#2D3748';
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.backgroundColor = '#4A5568';
                    }}
                  >
                    {sample.name}
                  </button>
                ))}
              </div>
            </div>
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
              <h2 className="genvise-section-title" style={{ margin: '0 0 1rem', fontSize: '1.5rem', fontWeight: 600 }}>
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
                    {pdfTipCopied ? 'Copied!' : '"Edit the artefact so that components do not overlap over page breaks when printed, but dont put each component on a new page."'}
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
              <h2 className="genvise-section-title" style={{ margin: '0 0 1rem', fontSize: '1.5rem', fontWeight: 600 }}>
                Component Preview
              </h2>
              <div
                className="genvise-preview-container"
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
                    display: 'block',
                    width: '100%',
                    height: '100%',
                    padding: '20px' // Add some padding for the preview
                  }}
                />
              </div>
            </div>
          </main>
          {/* Our custom app footer */}
          <div
            className="genvise-app-footer"
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
              Your code and outputs are never stored or processed on our servers and remain solely on your computer.{' '}
              <Link 
                to="/privacy" 
                style={{
                  color: '#D97757',
                  textDecoration: 'underline',
                  fontWeight: 500
                }}
              >
                Privacy Policy
              </Link>
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