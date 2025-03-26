export const exampleComponent = `import React from 'react';
import { 
  FileText, Copy, BookOpen, Download, Code, 
  ExternalLink, Settings, CheckCircle, Star
} from 'lucide-react';

function ClaudeTutorial() {
  // Claude brand colors to use throughout the component
  const claudeColors = {
    primary: '#D97757',
    primaryLight: '#E68B6F', 
    primaryDark: '#C65D3D',
    secondary: '#4A5568',
    secondaryLight: '#718096',
    secondaryDark: '#2D3748',
    white: '#FFFFFF',
    bgDefault: '#F7FAFC',
    bgPaper: '#FFFFFF'
  };
  // Active step state (not functional in this example)
  const [activeStep, setActiveStep] = React.useState(0);
  
  return (
    <div className="max-w-3xl mx-auto py-4">
      <div className="p-4 rounded-lg overflow-hidden shadow-sm bg-white">
        {/* Hero section */}
        <div className="p-4 mb-4 rounded-lg text-white text-center relative overflow-hidden" 
             style={{ 
               backgroundColor: claudeColors.primary,
               backgroundImage: "linear-gradient(135deg, " + claudeColors.primary + " 0%, " + claudeColors.primaryLight + " 40%, #F2A48D 100%)"
             }}>
          <div className="absolute top-[-20px] right-[-20px] w-[120px] h-[120px] rounded-full bg-white/10" />
          <div className="absolute bottom-[-30px] left-[-30px] w-[150px] h-[150px] rounded-full bg-white/10" />
          
          <Star size={32} className="mb-4" />
          <h4 className="font-bold text-2xl mb-1">
            Claude Artifact to PDF Converter
          </h4>
          <h6 className="opacity-90 max-w-md mx-auto">
            Convert Claude's code artifacts into beautifully rendered, downloadable PDFs in seconds
          </h6>
        </div>
        
        {/* Introduction */}
        <div className="mb-5">
          <p className="text-lg leading-relaxed" style={{ color: claudeColors.secondary }}>
            This tool makes it easy to transform code artifacts from Claude into professional PDFs. Simply paste your artifact code, preview how it looks, and download it as a PDF document.
          </p>
        </div>
        
        {/* Guided steps with Stepper */}
        <h5 className="flex items-center mb-3 text-xl" style={{ color: claudeColors.secondaryDark }}>
          <BookOpen size={20} className="mr-2" /> 
          How to Use This Tool
        </h5>
        
        <div className="mb-5">
          {/* Step 1 */}
          <div className="mb-6">
            <div className="flex">
              <div className="mr-4 flex flex-col items-center">
                <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: claudeColors.primary }}>
                  <span className="text-white font-medium">1</span>
                </div>
                <div className="w-0.5 h-full bg-gray-200 my-2"></div>
              </div>
              <div className="flex-1">
                <h6 className="text-lg font-medium mb-2" style={{ color: claudeColors.secondaryDark }}>
                  Find an artifact in your Claude conversation
                </h6>
                <div className="ml-0">
                  <p className="mb-2" style={{ color: claudeColors.secondary }}>
                    When you ask Claude to create React components, charts, or visualisations, it will display artifacts with code blocks that look like this:
                  </p>
                  
                  <div className="mb-2 overflow-hidden rounded-lg border border-gray-100 shadow-md">
                    <img 
                      src="/artefact.png"
                      alt="Claude artifact example" 
                      className="w-full h-auto object-contain"
                      style={{ maxHeight: '300px' }}
                    />
                  </div>
                  
                  <p style={{ color: claudeColors.secondary }}>
                    These artifacts contain React code that can be rendered into interactive components.
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Step 2 */}
          <div className="mb-6">
            <div className="flex">
              <div className="mr-4 flex flex-col items-center">
                <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: claudeColors.primary }}>
                  <span className="text-white font-medium">2</span>
                </div>
                <div className="w-0.5 h-full bg-gray-200 my-2"></div>
              </div>
              <div className="flex-1">
                <h6 className="text-lg font-medium mb-2" style={{ color: claudeColors.secondaryDark }}>
                  Copy the code from the artifact
                </h6>
                <div className="ml-0">
                  <p className="mb-2" style={{ color: claudeColors.secondary }}>
                    Click the copy button in the bottom-right corner of the artifact to copy the code to your clipboard:
                  </p>
                  
                  <div className="flex items-center mb-3">
                    <div className="max-w-xs overflow-hidden rounded-lg border border-gray-100 shadow-md">
                      <img 
                        src="/copyartefactsmallimage.png"
                        alt="Copy button on Claude artifact" 
                        className="w-full h-auto object-contain"
                        style={{ maxHeight: '200px' }}
                      />
                    </div>
                    <div 
                      className="flex ml-4 p-2.5 rounded-lg items-center"
                      style={{ backgroundColor: 'rgba(217,119,87,0.08)' }}
                    >
                      <Copy size={18} style={{ color: claudeColors.primary }} className="mr-3" />
                      <p className="font-medium" style={{ color: claudeColors.primaryDark }}>
                        Click this icon to copy code
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Step 3 */}
          <div className="mb-6">
            <div className="flex">
              <div className="mr-4 flex flex-col items-center">
                <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: claudeColors.primary }}>
                  <span className="text-white font-medium">3</span>
                </div>
                <div className="w-0.5 h-full bg-gray-200 my-2"></div>
              </div>
              <div className="flex-1">
                <h6 className="text-lg font-medium mb-2" style={{ color: claudeColors.secondaryDark }}>
                  Paste the code into this tool
                </h6>
                <div className="ml-0">
                  <p className="mb-2" style={{ color: claudeColors.secondary }}>
                    Delete this tutorial code from the editor on the left and paste the copied code from Claude.
                  </p>
                  
                  <div 
                    className="flex p-2 rounded-lg text-white items-center mb-2"
                    style={{ backgroundColor: claudeColors.primaryLight }}
                  >
                    <CheckCircle size={20} className="mr-3" />
                    <p className="font-medium">
                      The code will automatically render in the preview panel on the right
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Step 4 */}
          <div className="mb-6">
            <div className="flex">
              <div className="mr-4 flex flex-col items-center">
                <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: claudeColors.primary }}>
                  <span className="text-white font-medium">4</span>
                </div>
                <div className="w-0.5 h-full bg-gray-200 my-2"></div>
              </div>
              <div className="flex-1">
                <h6 className="text-lg font-medium mb-2" style={{ color: claudeColors.secondaryDark }}>
                  Download as PDF
                </h6>
                <div className="ml-0">
                  <p className="mb-2" style={{ color: claudeColors.secondary }}>
                    Once your component renders correctly in the preview panel, click the "Download as PDF" button at the bottom of the editor.
                  </p>
                  
                  <div className="flex items-center mb-2">
                    <button 
                      className="flex items-center px-3 py-2 rounded-md text-white font-medium"
                      style={{ backgroundColor: claudeColors.primary }}
                      disabled
                    >
                      <Download size={16} className="mr-2" />
                      Download as PDF
                    </button>
                    <p className="ml-2 italic" style={{ color: claudeColors.secondary }}>
                      ← The button will look like this
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Step 5 */}
          <div className="mb-6">
            <div className="flex">
              <div className="mr-4 flex flex-col items-center">
                <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: claudeColors.primary }}>
                  <span className="text-white font-medium">5</span>
                </div>
              </div>
              <div className="flex-1">
                <h6 className="text-lg font-medium mb-2" style={{ color: claudeColors.secondaryDark }}>
                  Customise your PDF output
                </h6>
                <div className="ml-0">
                  <p className="mb-2" style={{ color: claudeColors.secondary }}>
                    You can customise how your PDF looks by adjusting the print settings in your browser:
                  </p>
                  
                  <div className="mb-3 overflow-hidden rounded-lg border border-gray-100 shadow-md">
                    <img 
                      src="/printartefact.png"
                      alt="Print settings dialog" 
                      className="w-full h-auto object-contain"
                      style={{ maxHeight: '300px' }}
                    />
                  </div>
                  
                  <div 
                    className="p-2 rounded-lg mb-2"
                    style={{ backgroundColor: 'rgba(217,119,87,0.08)' }}
                  >
                    <p className="flex items-center mb-1.5 font-medium" style={{ color: claudeColors.primaryDark }}>
                      <Settings size={16} className="mr-2" />
                      Recommended settings:
                    </p>
                    
                    <div className="space-y-1">
                      <div className="flex justify-between">
                        <p className="font-medium" style={{ color: claudeColors.secondary }}>
                          Page Size:
                        </p>
                        <p style={{ color: claudeColors.secondary }}>
                          A4 or Letter
                        </p>
                      </div>
                      
                      <div className="flex justify-between">
                        <p className="font-medium" style={{ color: claudeColors.secondary }}>
                          Scale:
                        </p>
                        <p style={{ color: claudeColors.secondary }}>
                          Default or "Fit to page"
                        </p>
                      </div>
                      
                      <div className="flex justify-between">
                        <p className="font-medium" style={{ color: claudeColors.secondary }}>
                          Orientation:
                        </p>
                        <p style={{ color: claudeColors.secondary }}>
                          Choose based on content
                        </p>
                      </div>
                      
                      <div className="flex justify-between">
                        <p className="font-medium" style={{ color: claudeColors.secondary }}>
                          Margins:
                        </p>
                        <p style={{ color: claudeColors.secondary }}>
                          None or Minimal
                        </p>
                      </div>
                      
                      <div className="flex justify-between">
                        <p className="font-medium" style={{ color: claudeColors.secondary }}>
                          Headers and Footers:
                        </p>
                        <p style={{ color: claudeColors.secondary }}>
                          Off
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Supported Libraries */}
        <div className="mb-5">
          <h5 className="flex items-center mb-3 text-xl" style={{ color: claudeColors.secondaryDark }}>
            <BookOpen size={20} className="mr-2" />
            Supported Libraries
          </h5>
          
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {[
              { name: 'React', desc: 'Core library & hooks' },
              { name: 'Material UI', desc: 'UI components & styling' },
              { name: 'Recharts', desc: 'Data visualisation' },
              { name: 'Lucide Icons', desc: 'SVG icons' },
              { name: 'Lodash', desc: 'Utility functions' },
              { name: 'Tailwind', desc: 'Utility CSS classes' }
            ].map((lib, index) => (
              <div 
                key={index} 
                className="p-2.5 rounded-lg transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 border border-gray-100"
              >
                <h6 
                  className="font-semibold mb-0.5 text-sm"
                  style={{ color: claudeColors.primary }}
                >
                  {lib.name}
                </h6>
                <p 
                  className="text-xs"
                  style={{ color: claudeColors.secondary }}
                >
                  {lib.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
        
        {/* Pro Tips */}
        <div className="mb-4">
          <h5 className="flex items-center mb-3 text-xl" style={{ color: claudeColors.secondaryDark }}>
            <Star size={20} className="mr-2" />
            Pro Tips
          </h5>
          
          <div 
            className="p-3 mb-3 rounded-lg border-none"
            style={{ background: 'linear-gradient(135deg, rgba(217,119,87,0.1) 0%, rgba(230,139,111,0.1) 100%)' }}
          >
            <div className="flex items-start">
              <CheckCircle 
                size={22} 
                className="mr-3 mt-0.5"
                style={{ color: claudeColors.primary }} 
              />
              <div>
                <h6 
                  className="font-semibold mb-1"
                  style={{ color: claudeColors.secondaryDark }}
                >
                  Ask Claude to create specific components
                </h6>
                <p style={{ color: claudeColors.secondary }}>
                  Try asking Claude for dashboards, data visualisations, reports, certificates, invoices, or presentations.
                </p>
              </div>
            </div>
          </div>
          
          <div 
            className="p-3 rounded-lg border-none"
            style={{ background: 'linear-gradient(135deg, rgba(217,119,87,0.1) 0%, rgba(230,139,111,0.1) 100%)' }}
          >
            <div className="flex items-start">
              <CheckCircle 
                size={22} 
                className="mr-3 mt-0.5"
                style={{ color: claudeColors.primary }} 
              />
              <div>
                <h6 
                  className="font-semibold mb-1"
                  style={{ color: claudeColors.secondaryDark }}
                >
                  Component structure requirements
                </h6>
                <p 
                  className="mb-1.5"
                  style={{ color: claudeColors.secondary }}
                >
                  For best results, ensure your component:
                </p>
                <div className="flex flex-wrap gap-1 mb-1">
                  <span 
                    className="px-2 py-0.5 text-xs rounded-full mb-1 inline-flex items-center"
                    style={{ 
                      backgroundColor: 'rgba(217,119,87,0.2)', 
                      color: claudeColors.primaryDark 
                    }}
                  >
                    Has all required imports
                  </span>
                  <span 
                    className="px-2 py-0.5 text-xs rounded-full mb-1 inline-flex items-center"
                    style={{ 
                      backgroundColor: 'rgba(217,119,87,0.2)', 
                      color: claudeColors.primaryDark 
                    }}
                  >
                    Is exported as default
                  </span>
                  <span 
                    className="px-2 py-0.5 text-xs rounded-full mb-1 inline-flex items-center"
                    style={{ 
                      backgroundColor: 'rgba(217,119,87,0.2)', 
                      color: claudeColors.primaryDark 
                    }}
                  >
                    Uses supported libraries
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="h-px bg-gray-200 mb-3"></div>
        
        {/* Footer */}
        <div className="text-center">
          <p 
            className="mb-2"
            style={{ color: claudeColors.secondaryLight }}
          >
            Get started by replacing this tutorial with your Claude artifact code.
          </p>
          <a
            href="https://claude.ai" 
            target="_blank" 
            rel="noopener noreferrer"
            className="inline-flex items-center px-3 py-1 text-sm border rounded-md"
            style={{
              color: claudeColors.primary,
              borderColor: claudeColors.primary,
            }}
          >
            Visit Claude.ai
            <ExternalLink size={14} className="ml-1" />
          </a>
        </div>
      </div>
    </div>
  );
}

export default ClaudeTutorial;`;