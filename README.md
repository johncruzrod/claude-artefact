# React Component to PDF Converter

A powerful web application that renders React components and converts them to PDF files with customisable options.

## Features

- Write or paste React component code in the integrated code editor
- Real-time preview of the rendered component
- Support for Material-UI components and Lucide icons
- Customisable PDF generation options:
  - Page size (A4, Letter, Legal)
  - Orientation (Portrait, Landscape)
  - Margin settings
- Component name auto-detection
- Comprehensive error reporting

## Use Cases

- Create branded invoices and documents
- Generate proposals with consistent styling
- Develop printable reports
- Design marketing assets with React

## Technologies Used

- React + Vite
- TypeScript
- react-to-pdf (for PDF generation)
- @uiw/react-textarea-code-editor (for code editing)
- Material-UI (component library)
- Lucide React (icon library)
- Babel (for JSX transformation)
- Tailwind CSS (for styling)

## Getting Started

1. Clone this repository
2. Install dependencies: `npm install`
3. Start the development server: `npm run dev`
4. Open your browser to the localhost URL displayed in the terminal

## Usage

1. Write or paste your React component code in the editor panel
2. View the rendered component in the preview panel
3. Select PDF options (page size, orientation, margins)
4. Click "Generate PDF" to create and download a PDF of your component

## Supported Libraries

The application includes support for:
- React (core features and hooks)
- Material-UI components
- Lucide React icons
- Tailwind CSS classes

## Component Requirements

- Components should be defined as a function called with any name (the app will detect it)
- Use standard React and JSX syntax
- Import statements for React, Material-UI, and Lucide React are supported

## Example Component

```jsx
import React from 'react';
import { FileText, Code } from 'lucide-react';

function InvoiceComponent() {
  return (
    <div className="p-8 max-w-4xl mx-auto bg-white">
      <div className="flex justify-between mb-8">
        <h1 className="text-2xl font-bold">Invoice</h1>
        <div className="flex items-center">
          <FileText className="mr-2" size={20} />
          <span>Document #1234</span>
        </div>
      </div>
      
      <div className="border-t pt-4">
        <p>Your well-styled invoice content here</p>
      </div>
    </div>
  );
}

export default InvoiceComponent;
```

## Customisation

This application can be extended to support:
- Additional component libraries
- More PDF customisation options
- Custom PDF templates
- Export in other formats

## License

MIT

## Acknowledgements

- [react-to-pdf](https://github.com/ivmarcos/react-to-pdf) - For PDF generation
- [react-textarea-code-editor](https://github.com/uiwjs/react-textarea-code-editor) - For code editing
