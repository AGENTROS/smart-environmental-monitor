const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');
const http = require('http');

const PORT = 3000;
const BASE_URL = `http://localhost:${PORT}`;
const SCREENSHOTS_DIR = path.join(__dirname, '..', '..', 'public', 'screenshots');

// Ensure directory exists
if (!fs.existsSync(SCREENSHOTS_DIR)) {
  fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true });
}

// Function to poll the dev server
function pollServer(url, timeoutMs = 60000) {
  return new Promise((resolve, reject) => {
    const start = Date.now();
    const interval = setInterval(() => {
      if (Date.now() - start > timeoutMs) {
        clearInterval(interval);
        reject(new Error('Timeout waiting for dev server to start'));
        return;
      }

      http.get(url, (res) => {
        if (res.statusCode === 200) {
          clearInterval(interval);
          resolve();
        }
      }).on('error', () => {
        // Server not ready yet
      });
    }, 1000);
  });
}

async function takeScreenshots() {
  console.log(`Polling local development server at ${BASE_URL}...`);
  try {
    await pollServer(BASE_URL, 30000);
    console.log('Dev server detected! Launching browser automation...');
  } catch (err) {
    console.error('Error: Dev server is not running on localhost:3000.');
    console.error('Please run "npm run dev" first, then execute this script.');
    process.exit(1);
  }

  const browser = await puppeteer.launch({
    headless: "new",
    defaultViewport: { width: 1440, height: 900 }
  });

  const page = await browser.newPage();

  // 1. Take Dashboard screen
  console.log('Navigating to Live Dashboard...');
  await page.goto(`${BASE_URL}/`, { waitUntil: 'networkidle2' });
  await page.waitForTimeout(2000); // Wait for animations to settle
  await page.screenshot({ path: path.join(SCREENSHOTS_DIR, 'dashboard.png') });
  console.log('Saved dashboard.png');

  // 2. Take Diagnostics Screen (Click on Device Status tab if navigation exists)
  console.log('Navigating to Diagnostics tab...');
  // Find and click the Device Status navigation button
  const tabs = await page.$$('button');
  for (const tab of tabs) {
    const text = await page.evaluate(el => el.textContent, tab);
    if (text.includes('Device Status') || text.includes('Telemetry')) {
      await tab.click();
      await page.waitForTimeout(1000);
      await page.screenshot({ path: path.join(SCREENSHOTS_DIR, 'device_status.png') });
      console.log('Saved device_status.png');
      break;
    }
  }

  await browser.close();
  console.log('Screenshots automation completed successfully!');
}

takeScreenshots();
