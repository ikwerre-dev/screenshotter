import puppeteer from 'puppeteer';

export async function takeScreenshot(url: string) {
  const browserlessApiKey = Math.random() < 0.5
    ? process.env.BROWSERLESS_API_KEY_1
    ? process.env.BROWSERLESS_API_KEY_2;

  console.log(`Using Browserless API Key: ${browserlessApiKey === process.env.BROWSERLESS_API_KEY_1 ? '1' : '2'}`);

  if (!browserlessApiKey) {
    throw new Error('Browserless API key is missing in environment variables');
  }

  try {
    // Connect to Browserless.io
    const browser = await puppeteer.connect({
      browserWSEndpoint: `wss://chrome.browserless.io?token=${browserlessApiKey}`,
    });
    const page = await browser.newPage();

    // Set viewport size
    await page.setViewport({
      width: 1920,
      height: 1080,
    });

    // Navigate to the URL
    await page.goto(url, {
      waitUntil: 'networkidle0',
    });

    // Take screenshot
    const screenshot = await page.screenshot({
      fullPage: true,
      type: 'png',
    });

    // Close browser
    await browser.close();

    return screenshot;
  } catch (error) {
    console.error('Error taking screenshot:', error);
    throw error;
  }
}