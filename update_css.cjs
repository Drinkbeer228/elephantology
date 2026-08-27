const fs = require('fs');

let html = fs.readFileSync('index.html', 'utf8');

const newCSS = `
    .prose-kingdom blockquote {
      border-left: 4px solid #ffd166;
      padding-left: 1.25rem;
      margin: 1.5rem 0;
      font-style: italic;
      color: #cbd5e1;
      background: rgba(27, 29, 36, 0.5); /* bg-kingdom-card/50 */
      padding-top: 1rem;
      padding-bottom: 1rem;
      border-radius: 0 8px 8px 0;
    }
    
    .prose-kingdom blockquote blockquote {
      margin-top: 1rem;
      margin-bottom: 0;
      background: rgba(255, 209, 102, 0.05);
    }

    .prose-kingdom table {
      width: 100%;
      border-collapse: collapse;
      margin: 1.5rem 0;
      font-size: 0.85rem;
      background: #1b1d24;
      border: 1px solid #34384a;
      border-radius: 8px;
      display: block;
      overflow-x: auto;
      white-space: nowrap;
    }
    
    @media (min-width: 640px) {
      .prose-kingdom table {
         display: table;
         white-space: normal;
      }
    }

    .prose-kingdom th {
      background: #242733; /* bg-kingdom-surface */
      color: #ffd166; /* kingdom-gold */
      text-align: left;
      padding: 12px 16px;
      font-weight: 700;
      border-bottom: 1px solid #34384a;
    }

    .prose-kingdom tr {
      transition: background-color 0.15s ease;
    }
    
    .prose-kingdom tr:hover {
      background: rgba(52, 56, 74, 0.3);
    }

    .prose-kingdom td {
      padding: 12px 16px;
      border-bottom: 1px solid #34384a;
    }
    
    .prose-kingdom td:first-child {
      font-weight: 500;
      color: #e2e8f0;
    }

    .prose-kingdom code {
      background: #242733;
      color: #ffd166; /* kingdom-gold or light gray */
      padding: 3px 6px;
      border-radius: 6px;
      font-family: monospace;
      font-size: 0.85em;
    }

    .prose-kingdom pre {
      background: #1b1d24;
      border: 1px solid #34384a;
      padding: 1rem;
      border-radius: 12px;
      overflow-x: auto;
      margin: 1.5rem 0;
    }

    .prose-kingdom pre code {
      background: transparent;
      padding: 0;
      color: #e2e8f0;
      font-size: 0.85em;
    }
    
    .prose-kingdom .footnotes {
      margin-top: 3rem;
      padding-top: 1rem;
      border-top: 1px solid #34384a;
      font-size: 0.8rem;
      color: #8e96ac;
    }
    
    .prose-kingdom .footnotes ol {
      padding-left: 1.5rem;
    }
    
    .prose-kingdom sup a {
      color: #ffd166;
      text-decoration: none;
      padding: 0 2px;
    }
    
    .prose-kingdom sup a:hover,
    .prose-kingdom sup a:focus {
      color: #fff;
      background: rgba(255, 209, 102, 0.2);
      border-radius: 2px;
    }
`;

const regex = /\.prose-kingdom blockquote \{[\s\S]*?\.prose-kingdom pre code \{[\s\S]*?\}/;
html = html.replace(regex, newCSS.trim());

fs.writeFileSync('index.html', html);
console.log("Updated CSS in index.html");
