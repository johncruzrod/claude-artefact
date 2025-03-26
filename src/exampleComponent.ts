export const exampleComponent = `import React from 'react';
import { 
  Container, Typography, Paper, Box, Button, 
  Card, Divider
} from '@mui/material';
import { FileText, BookOpen, Check, Download, Code } from 'lucide-react';

function ClaudeTutorial() {
  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Paper elevation={0} sx={{ p: 4, borderRadius: 2, bgcolor: 'white', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
        {/* Header */}
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <BookOpen size={32} style={{ color: '#5850EC', marginRight: '16px' }} />
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 700, color: '#1a202c' }}>
              Claude Artifact to PDF Converter
            </Typography>
            <Typography variant="subtitle1" sx={{ color: '#4a5568' }}>
              Turn Claude's artifacts into beautiful PDFs in seconds
            </Typography>
          </Box>
        </Box>
        
        <Divider sx={{ mb: 4 }} />

        {/* Introduction */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="body1" sx={{ mb: 2 }}>
            This tool allows you to transform artifacts from Claude into rendered PDFs. If you've asked Claude to create a React component, chart, or document, you can use this tool to see it rendered and save it as a PDF.
          </Typography>
        </Box>

        {/* Step-by-step guide */}
        <Typography variant="h5" sx={{ fontWeight: 600, mb: 3, color: '#2d3748' }}>
          How to Use This Tool
        </Typography>

        {/* Step 1 */}
        <Box sx={{ mb: 4, pl: 2, borderLeft: '2px solid #5850EC' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Box sx={{ 
              width: 28, 
              height: 28, 
              borderRadius: '50%', 
              bgcolor: '#5850EC', 
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 'bold',
              mr: 2
            }}>
              1
            </Box>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Find an artifact in your Claude conversation
            </Typography>
          </Box>
          
          <Box sx={{ pl: 5, mb: 3 }}>
            <Typography variant="body2" sx={{ mb: 2, color: '#4a5568' }}>
              When you ask Claude to create React components, charts, or visualisations, it will display artifacts that look like this:
            </Typography>
            
            <Card variant="outlined" sx={{ mb: 2, overflow: 'hidden' }}>
              <Box sx={{ 
                width: '100%',
                height: 'auto',
                backgroundImage: 'url(/artefact.png)',
                backgroundSize: 'contain',
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'center',
                pt: '50%' // 2:1 aspect ratio
              }} />
            </Card>
            
            <Typography variant="body2" sx={{ color: '#4a5568' }}>
              These artifacts contain React code that can be rendered into interactive components.
            </Typography>
          </Box>
        </Box>

        {/* Step 2 */}
        <Box sx={{ mb: 4, pl: 2, borderLeft: '2px solid #5850EC' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Box sx={{ 
              width: 28, 
              height: 28, 
              borderRadius: '50%', 
              bgcolor: '#5850EC', 
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 'bold',
              mr: 2
            }}>
              2
            </Box>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Copy the code from the artifact
            </Typography>
          </Box>
          
          <Box sx={{ pl: 5, mb: 3 }}>
            <Typography variant="body2" sx={{ mb: 2, color: '#4a5568' }}>
              Click the copy button in the bottom-right corner of the artifact to copy the code:
            </Typography>
            
            <Card variant="outlined" sx={{ mb: 2, maxWidth: 300, overflow: 'hidden' }}>
              <Box sx={{ 
                width: '100%',
                height: 'auto',
                backgroundImage: 'url(/copyartefactsmallimage.png)',
                backgroundSize: 'contain',
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'center',
                pt: '75%' // 4:3 aspect ratio
              }} />
            </Card>
            
          </Box>
        </Box>

        {/* Step 3 */}
        <Box sx={{ mb: 4, pl: 2, borderLeft: '2px solid #5850EC' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Box sx={{ 
              width: 28, 
              height: 28, 
              borderRadius: '50%', 
              bgcolor: '#5850EC', 
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 'bold',
              mr: 2
            }}>
              3
            </Box>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Paste the code into this tool
            </Typography>
          </Box>
          
          <Box sx={{ pl: 5, mb: 3 }}>
            <Typography variant="body2" sx={{ mb: 2, color: '#4a5568' }}>
              Delete this tutorial code from the editor on the left and paste the copied code from Claude.
            </Typography>
            
            <Typography variant="body2" sx={{ color: '#4a5568' }}>
              The code will automatically render in the preview panel on the right as you paste it.
            </Typography>
          </Box>
        </Box>

        {/* Step 4 */}
        <Box sx={{ mb: 4, pl: 2, borderLeft: '2px solid #5850EC' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Box sx={{ 
              width: 28, 
              height: 28, 
              borderRadius: '50%', 
              bgcolor: '#5850EC', 
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 'bold',
              mr: 2
            }}>
              4
            </Box>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Download as PDF
            </Typography>
          </Box>
          
          <Box sx={{ pl: 5, mb: 3 }}>
            <Typography variant="body2" sx={{ mb: 2, color: '#4a5568' }}>
              Once your component renders correctly in the preview panel, click the "Download as PDF" button at the bottom of the editor.
            </Typography>
            
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Button 
                variant="contained" 
                startIcon={<Download size={16} />}
                sx={{ 
                  bgcolor: '#5850EC', 
                  '&:hover': { bgcolor: '#4338ca' },
                  fontWeight: 500
                }}
                disabled
              >
                Download as PDF
              </Button>
              <Typography variant="body2" sx={{ ml: 2, color: '#4a5568' }}>
                ← The button will look like this
              </Typography>
            </Box>
            
            <Typography variant="body2" sx={{ color: '#4a5568' }}>
              Your browser's print dialog will open. Select "Save as PDF" as the destination to download your rendered component.
            </Typography>
          </Box>
        </Box>

        {/* Supported Libraries */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h5" sx={{ fontWeight: 600, mb: 2, color: '#2d3748' }}>
            Supported Libraries
          </Typography>
          
          <Typography variant="body2" sx={{ mb: 2, color: '#4a5568' }}>
            This tool supports the following libraries commonly used in Claude artifacts:
          </Typography>
          
          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 2 }}>
            <Card sx={{ p: 2, bgcolor: '#f8fafc', border: '1px solid #e2e8f0' }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 0.5 }}>React</Typography>
              <Typography variant="body2" sx={{ color: '#4a5568', fontSize: '0.8rem' }}>
                Core library & hooks
              </Typography>
            </Card>
            
            <Card sx={{ p: 2, bgcolor: '#f8fafc', border: '1px solid #e2e8f0' }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 0.5 }}>Material UI</Typography>
              <Typography variant="body2" sx={{ color: '#4a5568', fontSize: '0.8rem' }}>
                UI components & styling
              </Typography>
            </Card>
            
            <Card sx={{ p: 2, bgcolor: '#f8fafc', border: '1px solid #e2e8f0' }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 0.5 }}>Recharts</Typography>
              <Typography variant="body2" sx={{ color: '#4a5568', fontSize: '0.8rem' }}>
                Charts & data visualisation
              </Typography>
            </Card>
            
            <Card sx={{ p: 2, bgcolor: '#f8fafc', border: '1px solid #e2e8f0' }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 0.5 }}>Lucide Icons</Typography>
              <Typography variant="body2" sx={{ color: '#4a5568', fontSize: '0.8rem' }}>
                Beautiful SVG icons
              </Typography>
            </Card>
            
            <Card sx={{ p: 2, bgcolor: '#f8fafc', border: '1px solid #e2e8f0' }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 0.5 }}>Lodash</Typography>
              <Typography variant="body2" sx={{ color: '#4a5568', fontSize: '0.8rem' }}>
                Utility functions
              </Typography>
            </Card>
            
            <Card sx={{ p: 2, bgcolor: '#f8fafc', border: '1px solid #e2e8f0' }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 0.5 }}>Tailwind Classes</Typography>
              <Typography variant="body2" sx={{ color: '#4a5568', fontSize: '0.8rem' }}>
                Utility CSS classes
              </Typography>
            </Card>
          </Box>
        </Box>

        {/* Pro Tips */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h5" sx={{ fontWeight: 600, mb: 2, color: '#2d3748' }}>
            Pro Tips
          </Typography>
          
          <Card sx={{ p: 3, bgcolor: '#f7fafc', border: '1px solid #e2e8f0', mb: 2 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1, color: '#2d3748' }}>
              Ask Claude to create specific components
            </Typography>
            <Typography variant="body2" sx={{ color: '#4a5568' }}>
              You can ask Claude to create React components for various purposes like: dashboards, data visualisations, reports, certificates, invoices, or presentations.
            </Typography>
          </Card>
          
          <Card sx={{ p: 3, bgcolor: '#f7fafc', border: '1px solid #e2e8f0', mb: 2 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1, color: '#2d3748' }}>
              Component structure requirements
            </Typography>
            <Typography variant="body2" sx={{ color: '#4a5568', mb: 1 }}>
              For best results, make sure your component:
            </Typography>
            <ul style={{ margin: 0, paddingLeft: '20px', color: '#4a5568' }}>
              <li style={{ fontSize: '0.875rem', marginBottom: '4px' }}>Has all required imports at the top</li>
              <li style={{ fontSize: '0.875rem', marginBottom: '4px' }}>Is exported as default</li>
              <li style={{ fontSize: '0.875rem', marginBottom: '4px' }}>Uses supported libraries</li>
            </ul>
          </Card>
        </Box>

        <Divider sx={{ mb: 3 }} />
        
        {/* Footer */}
        <Box sx={{ textAlign: 'center' }}>
          <Typography variant="body2" sx={{ color: '#718096', mb: 1 }}>
            Get started by replacing this tutorial with your Claude artifact code.
          </Typography>
          <Box 
            component="a"
            href="https://claude.ai" 
            target="_blank" 
            rel="noopener noreferrer"
            sx={{ 
              display: 'inline-flex', 
              alignItems: 'center',
              color: '#5850EC',
              textDecoration: 'none',
              fontSize: '0.875rem',
              '&:hover': { textDecoration: 'underline' }
            }}
          >
            <span>Visit Claude.ai</span>
          </Box>
        </Box>
      </Paper>
    </Container>
  );
}

export default ClaudeTutorial;`;