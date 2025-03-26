import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

// Get current directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Directory containing shadcn components
const componentsDir = path.join(__dirname, 'src', 'components', 'ui');

// Process all TypeScript files in the components/ui directory
fs.readdir(componentsDir, (err, files) => {
  if (err) {
    console.error('Error reading directory:', err);
    return;
  }

  // Filter for TypeScript files
  const tsFiles = files.filter(file => file.endsWith('.tsx'));

  tsFiles.forEach(file => {
    const filePath = path.join(componentsDir, file);
    
    // Read file content
    fs.readFile(filePath, 'utf8', (err, data) => {
      if (err) {
        console.error(`Error reading file ${file}:`, err);
        return;
      }

      // Replace @/lib/utils with relative path
      let newContent = data.replace(
        /from ["']@\/lib\/utils["']/g, 
        'from "../../lib/utils"'
      );

      // Replace other @/ imports with relative paths
      newContent = newContent.replace(
        /from ["']@\/components\/ui\/([^"']*)["']/g, 
        'from "./$1"'
      );

      // Write the modified content back
      fs.writeFile(filePath, newContent, 'utf8', (err) => {
        if (err) {
          console.error(`Error writing file ${file}:`, err);
          return;
        }
        console.log(`✅ Fixed imports in ${file}`);
      });
    });
  });
});