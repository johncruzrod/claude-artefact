import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get current directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Output file path
const outputFile = 'project-files.txt';

// Function to recursively walk directories
function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    const filePath = path.join(dir, f);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      // Skip node_modules directory
      if (f === 'node_modules') return;
      walkDir(filePath, callback);
    } else {
      // Skip package-lock.json
      if (f === 'package-lock.json') return;
      callback(filePath);
    }
  });
}

// Create or clear the output file
fs.writeFileSync(outputFile, '');

// Walk through directories and append file contents to output file
walkDir('.', (filePath) => {
  try {
    // Skip binary files and the output file itself
    const ext = path.extname(filePath).toLowerCase();
    if (['.png', '.jpg', '.jpeg', '.gif', '.ico', '.woff', '.woff2', '.ttf', '.eot', '.otf'].includes(ext)) {
      return;
    }
    
    if (path.basename(filePath) === outputFile) {
      return;
    }
    
    // Read file content
    const content = fs.readFileSync(filePath, 'utf8');
    
    // Append file path and content to output file
    const separator = '\n' + '='.repeat(80) + '\n';
    const fileHeader = `FILE: ${filePath}${separator}`;
    const fileFooter = separator + '\n\n';
    
    fs.appendFileSync(outputFile, fileHeader + content + fileFooter);
    
    console.log(`Added: ${filePath}`);
  } catch (err) {
    console.error(`Error processing file ${filePath}: ${err.message}`);
  }
});

console.log(`All files extracted to ${outputFile}`); 