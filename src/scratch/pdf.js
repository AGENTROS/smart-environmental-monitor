const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

const HTML_FILE = path.join(__dirname, '..', '..', 'Project_Report_Final.html');
const PDF_FILE = path.join(__dirname, '..', '..', 'Project_Report_Final.pdf');

console.log('Starting PDF generation using Puppeteer...');

if (!fs.existsSync(HTML_FILE)) {
  console.error(`Error: Compiled HTML report not found at ${HTML_FILE}`);
  console.error('Please run "node src/scratch/compile.js" first.');
  process.exit(1);
}

async function generatePDF() {
  const browser = await puppeteer.launch({
    headless: "new",
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  
  // Navigate to local compiled HTML file using file:// scheme
  const fileUrl = `file://${HTML_FILE}`;
  console.log(`Loading: ${fileUrl}...`);
  await page.goto(fileUrl, { waitUntil: 'networkidle0' });

  // Custom margin header/footer templates
  const headerTemplate = `
    <div style="font-size: 8px; width: 100%; display: flex; justify-content: space-between; color: #888; font-family: 'Outfit', sans-serif; padding: 0 20px; box-sizing: border-box;">
      <span>B.Tech CSE Mini Project Report</span>
      <span>JSPM RSCOE</span>
    </div>
  `;

  const footerTemplate = `
    <div style="font-size: 8px; width: 100%; display: flex; justify-content: space-between; color: #888; font-family: 'Outfit', sans-serif; padding: 0 20px; box-sizing: border-box;">
      <span>Department of Computer Science & Engineering</span>
      <span>Page <span class="pageNumber"></span> of <span class="totalPages"></span></span>
    </div>
  `;

  console.log('Rendering and printing vector PDF...');
  await page.pdf({
    path: PDF_FILE,
    format: 'A4',
    printBackground: true,
    displayHeaderFooter: true,
    headerTemplate: headerTemplate,
    footerTemplate: footerTemplate,
    margin: {
      top: '0.8in',
      right: '0.6in',
      bottom: '0.8in',
      left: '0.6in'
    }
  });

  await browser.close();
  console.log(`PDF print successful! Saved to: ${PDF_FILE}`);
}

generatePDF().catch(err => {
  console.error('Error generating PDF:', err);
  process.exit(1);
});
