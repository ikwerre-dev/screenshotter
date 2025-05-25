import puppeteer from 'puppeteer';

export async function takeScreenshot(url: string): Promise<Buffer> {
  const browserlessApiKey = Math.random() < 0.5
    ? process.env.BROWSERLESS_API_KEY_1
    : process.env.BROWSERLESS_API_KEY_2

  console.log(`Using Browserless API Key: ${browserlessApiKey === process.env.BROWSERLESS_API_KEY_1 ? '1' : '2'}`);

  if (!browserlessApiKey) {
    throw new Error('Browserless API key is missing in environment variables');
  }

  try {
    const browser = await puppeteer.connect({
      browserWSEndpoint: `wss://chrome.browserless.io?token=${browserlessApiKey}`,
    });
    const page = await browser.newPage();

    await page.setViewport({
      width: 1920,
      height: 1080,
    });

    await page.goto(url, {
      waitUntil: 'networkidle0',
    });

    const screenshot = await page.screenshot({
      type: 'png',
    });

    await browser.close();

    return Buffer.from(screenshot);
  } catch (error) {
    console.error('Error taking screenshot:', error);
    throw error;
  }
}