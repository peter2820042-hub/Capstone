import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';

const SCREENSHOTS_DIR = './screenshots';

// User pages to screenshot
const userPages = [
  { name: 'Dashboard', path: '/user' },
  { name: 'Billing', path: '/user/billing' },
  { name: 'Payment', path: '/user/payment' },
  { name: 'Violation', path: '/user/violation' },
  { name: 'Notification', path: '/user/notification' },
  { name: 'Profile', path: '/user/profile' },
];

async function takeScreenshots() {
  // Create screenshots directory if it doesn't exist
  if (!fs.existsSync(SCREENSHOTS_DIR)) {
    fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true });
  }

  const browser = await puppeteer.launch({
    headless: false,
    args: ['--window-size=1920,1080'],
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1920, height: 1080 });

  const baseUrl = 'http://localhost:5173';

  console.log('Starting screenshot capture for User Pages...\n');

  for (const userPage of userPages) {
    try {
      const url = `${baseUrl}${userPage.path}`;
      console.log(`Capturing: ${userPage.name} (${url})`);

      await page.goto(url, { waitUntil: 'networkidle0', timeout: 30000 });
      
      // Wait a bit for any animations/rendering
      await new Promise(resolve => setTimeout(resolve, 1000));

      const screenshotPath = path.join(SCREENSHOTS_DIR, `${userPage.name}.png`);
      await page.screenshot({ 
        path: screenshotPath, 
        fullPage: true 
      });
      
      console.log(`✓ Saved: ${screenshotPath}\n`);
    } catch (error) {
      console.error(`✗ Error capturing ${userPage.name}: ${error.message}\n`);
    }
  }

  await browser.close();
  console.log('Screenshot capture complete!');
  console.log(`Screenshots saved in: ${path.resolve(SCREENSHOTS_DIR)}`);
}

takeScreenshots().catch(console.error);
