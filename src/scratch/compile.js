const fs = require('fs');
const path = require('path');
const { marked } = require('marked');

const INPUT_FILE = path.join(__dirname, '..', '..', 'Project_Report_Academic.md');
const OUTPUT_FILE = path.join(__dirname, '..', '..', 'Project_Report_Final.html');

console.log('Starting compilation of academic project report...');

// Read input file
if (!fs.existsSync(INPUT_FILE)) {
  console.error(`Error: Input file not found at ${INPUT_FILE}`);
  process.exit(1);
}

let markdown = fs.readFileSync(INPUT_FILE, 'utf8');

// Regex to find image references: ![caption](public/screenshots/name.png)
const imageRegex = /!\[(.*?)\]\((public\/screenshots\/.*?\.png)\)/g;
let match;
const replacements = [];

console.log('Embedding image assets as Base64 Data URLs...');

while ((match = imageRegex.exec(markdown)) !== null) {
  const fullMatch = match[0];
  const caption = match[1];
  const relativeImagePath = match[2];
  const absoluteImagePath = path.join(__dirname, '..', '..', relativeImagePath);

  if (fs.existsSync(absoluteImagePath)) {
    const fileBuffer = fs.readFileSync(absoluteImagePath);
    const base64Data = fileBuffer.toString('base64');
    const dataUrl = `data:image/png;base64,${base64Data}`;
    replacements.push({
      target: fullMatch,
      replacement: `![${caption}](${dataUrl})`
    });
    console.log(`- Successfully embedded: ${relativeImagePath}`);
  } else {
    console.warn(`- Warning: Image file not found at ${absoluteImagePath}`);
  }
}

// Apply image replacements
for (const rep of replacements) {
  markdown = markdown.replace(rep.target, rep.replacement);
}

// Configure marked options
marked.setOptions({
  gfm: true,
  breaks: true,
  headerIds: true,
  mangle: false
});

// Convert markdown to HTML
console.log('Parsing Markdown to HTML...');
const mainContent = marked.parse(markdown);

// HTML Template with Premium Dark Theme CSS
const htmlTemplate = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Project Report - Smart Environmental & Security Monitoring System</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;600;800&family=JetBrains+Mono:wght@400;700&display=swap');

  :root {
    --bg-color: #0b0f19;
    --card-bg: #111827;
    --border-color: #1f2937;
    --text-primary: #f3f4f6;
    --text-secondary: #9ca3af;
    --accent-color: #0ea5e9;
    --accent-glow: rgba(14, 165, 233, 0.15);
    --accent-green: #10b981;
    --accent-red: #ef4444;
  }

  body {
    background-color: var(--bg-color);
    color: var(--text-primary);
    font-family: 'Outfit', sans-serif;
    line-height: 1.6;
    margin: 0;
    padding: 0;
  }

  /* Page layout */
  .container {
    max-width: 900px;
    margin: 0 auto;
    padding: 40px 20px;
  }

  /* Typography */
  h1, h2, h3, h4, h5, h6 {
    color: var(--text-primary);
    font-weight: 800;
    margin-top: 1.5em;
    margin-bottom: 0.5em;
    letter-spacing: -0.025em;
  }

  h1 {
    font-size: 2.25rem;
    border-bottom: 2px solid var(--border-color);
    padding-bottom: 10px;
    margin-top: 2em;
    color: var(--accent-color);
  }

  h2 {
    font-size: 1.75rem;
    border-bottom: 1px solid var(--border-color);
    padding-bottom: 8px;
    color: var(--text-primary);
  }

  h3 {
    font-size: 1.35rem;
  }

  p {
    margin-bottom: 1.25em;
    color: var(--text-secondary);
    font-size: 1.05rem;
  }

  strong {
    color: var(--text-primary);
  }

  /* Lists */
  ul, ol {
    margin-bottom: 1.5em;
    padding-left: 24px;
    color: var(--text-secondary);
  }

  li {
    margin-bottom: 0.5em;
  }

  /* Horizontal Rules */
  hr {
    border: 0;
    height: 1px;
    background: var(--border-color);
    margin: 40px 0;
  }

  /* Tables */
  table {
    width: 100%;
    border-collapse: collapse;
    margin: 25px 0;
    font-size: 0.95rem;
    background-color: var(--card-bg);
    border-radius: 8px;
    overflow: hidden;
    border: 1px solid var(--border-color);
  }

  th, td {
    padding: 12px 16px;
    text-align: left;
  }

  th {
    background-color: #1f2937;
    color: var(--text-primary);
    font-weight: 600;
  }

  tr {
    border-bottom: 1px solid var(--border-color);
  }

  tr:last-child {
    border-bottom: none;
  }

  td {
    color: var(--text-secondary);
  }

  /* Code blocks */
  pre {
    background-color: #030712;
    padding: 16px;
    border-radius: 8px;
    overflow-x: auto;
    border: 1px solid var(--border-color);
    margin: 20px 0;
  }

  code {
    font-family: 'JetBrains Mono', monospace;
    font-size: 0.9rem;
    color: #e2e8f0;
    background-color: rgba(31, 41, 55, 0.5);
    padding: 2px 6px;
    border-radius: 4px;
  }

  pre code {
    padding: 0;
    background-color: transparent;
    color: #f1f5f9;
  }

  /* Images */
  img {
    max-width: 100%;
    height: auto;
    display: block;
    margin: 20px auto;
    border-radius: 8px;
    border: 1px solid var(--border-color);
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.5);
  }

  em {
    display: block;
    text-align: center;
    color: var(--text-secondary);
    font-size: 0.9rem;
    margin-top: -10px;
    margin-bottom: 20px;
  }

  /* Cover Page Styles */
  .cover-page {
    display: flex;
    flex-direction: column;
    justify-content: center;
    min-height: 90vh;
    padding: 40px;
    text-align: center;
    border: 1px solid var(--border-color);
    border-radius: 16px;
    background-color: var(--card-bg);
    margin-bottom: 60px;
    box-shadow: 0 4px 30px rgba(0,0,0,0.4);
    box-sizing: border-box;
  }

  .cover-page h1 {
    font-size: 2.75rem;
    color: var(--accent-color);
    border-bottom: none;
    margin-bottom: 10px;
  }

  .cover-page h3 {
    font-size: 1.5rem;
    color: var(--text-secondary);
    font-weight: 300;
    margin-top: 0;
    margin-bottom: 40px;
  }

  .cover-page p {
    font-size: 1.15rem;
    color: var(--text-primary);
  }

  .cover-page img {
    max-height: 280px;
    margin: 30px auto;
    border: 2px solid var(--border-color);
  }

  /* Print specific formatting */
  @media print {
    body {
      background-color: #ffffff;
      color: #000000;
    }
    .container {
      max-width: 100%;
      padding: 0;
    }
    h1, h2, h3 {
      page-break-after: avoid;
      color: #000000 !important;
      border-bottom-color: #000000 !important;
    }
    pre, blockquote, table, img {
      page-break-inside: avoid;
    }
    p, li, td {
      color: #333333 !important;
    }
    .cover-page {
      page-break-after: always;
      background: none !important;
      border: none !important;
      box-shadow: none !important;
      color: #000000 !important;
    }
    .cover-page h1 {
      color: #000000 !important;
    }
    .cover-page h3 {
      color: #555555 !important;
    }
    th {
      background-color: #f3f4f6 !important;
      color: #000000 !important;
      border-bottom: 2px solid #000000;
    }
    tr, td, table {
      border-color: #cccccc !important;
    }
    code {
      color: #000000 !important;
      background-color: #f3f4f6 !important;
    }
  }
</style>
</head>
<body>
<div class="container">
  ${mainContent}
</div>
</body>
</html>
`;

// Save Output File
fs.writeFileSync(OUTPUT_FILE, htmlTemplate, 'utf8');
console.log(`Compilation complete! Self-contained HTML saved to: ${OUTPUT_FILE}`);
