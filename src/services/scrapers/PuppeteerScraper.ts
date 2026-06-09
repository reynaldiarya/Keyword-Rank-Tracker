import type { Browser, Page } from 'puppeteer';
import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
import * as cheerio from 'cheerio';

import type { SearchScraper, SerpEntry } from '../../types';
import { logger } from '../../utils';

// Use the Stealth plugin to hide the fact that this is a Puppeteer bot
puppeteer.use(StealthPlugin());

export class PuppeteerScraper implements SearchScraper {
  private readonly DEFAULT_USER_AGENT =
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

  // Store the browser instance to reuse it across multiple requests (reduces memory usage)
  private browser: Browser | null = null;

  /**
   * Initializes the browser instance. This prevents launching and closing the browser
   * for each individual keyword, which is resource-intensive.
   */
  async initialize(): Promise<void> {
    // If the browser is already initialized, reuse it
    if (this.browser) return;

    const browserWsEndpoint = process.env.BROWSER_WS_ENDPOINT;

    // If no remote WebSocket endpoint is provided, launch a local browser instance
    if (!browserWsEndpoint) {
      logger.info('No remote browser WS provided, launching local Puppeteer...');
      this.browser = await puppeteer.launch({ headless: true });
    } else {
      // Connect to a remote browser instance if a WebSocket endpoint is provided (e.g., browserless.io)
      this.browser = await puppeteer.connect({
        browserWSEndpoint: browserWsEndpoint,
        defaultViewport: null,
      });
    }
  }

  /**
   * Closes the browser instance to free up memory.
   * Typically invoked after all scraping tasks are completed.
   */
  async close(): Promise<void> {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
    }
  }

  /**
   * Main function to fetch search results from Google.
   */
  async fetchResults(
    keyword: string,
    start: number = 0,
    lang: string = 'id',
    country: string = 'id'
  ): Promise<SerpEntry[]> {
    // Ensure the browser instance is initialized
    if (!this.browser) {
      await this.initialize();
    }

    if (!this.browser) {
      throw new Error('Failed to initialize browser');
    }

    // Open a new browser page/tab
    const page = await this.browser.newPage();

    try {
      const userAgent = process.env.PUPPETEER_USER_AGENT || this.DEFAULT_USER_AGENT;
      const cookie = process.env.PUPPETEER_COOKIE || '';

      // Set the User-Agent header to mimic a standard web browser
      await page.setUserAgent(userAgent);

      // Set additional headers to simulate a legitimate browser request to Google
      const headers: Record<string, string> = {
        'Accept-Language': `${lang}-${country},${lang};q=0.9`,
        Accept:
          'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
        Referer: 'https://www.google.com/',
      };

      if (cookie) {
        headers['Cookie'] = cookie;
      }

      await page.setExtraHTTPHeaders(headers);

      // Set ukuran layar PC standar
      await page.setViewport({ width: 1920, height: 1080 });

      logger.info(`Searching via Puppeteer: "${keyword}"`);

      // Navigate to the Google Search query URL
      await page.goto(
        `https://www.google.com/search?q=${encodeURIComponent(keyword)}&start=${start}&gl=${country}&hl=${lang}`,
        {
          waitUntil: 'domcontentloaded',
          timeout: 60000,
        }
      );

      // Simulate basic human interaction (mouse movement/scrolling) to evade detection
      await this.humanBehavior(page);

      // Check if blocked by a CAPTCHA or unusual traffic warnings
      const isCaptcha = await page.$('iframe[src*="google.com/recaptcha"]');
      const content = await page.content();
      const isUnusual =
        content.includes('lalu lintas yang tidak wajar') || content.includes('unusual traffic');

      if (isCaptcha || isUnusual) {
        logger.error('Blocked by CAPTCHA. Please rotate IP or wait.');
        throw new Error('Puppeteer Blocked/Captcha detected');
      }

      // Wait for the search results elements to load (e.g., div.yuRUbf container)
      try {
        await page.waitForSelector('div.yuRUbf', { timeout: 10000 });
      } catch (e) {
        logger.warn('Selector not found or request timed out/blocked.', e);
      }

      // Retrieve the page HTML content
      const html = await page.content();
      const $ = cheerio.load(html);

      const results: SerpEntry[] = [];

      // Parse the HTML to extract titles, URLs, and snippets
      $('div.yuRUbf').each((i, el) => {
        const titleElement = $(el).find('h3');
        const linkElement = $(el).find('a');
        const snippetElement = $(el).find('div[style*="-webkit-line-clamp"]');

        if (titleElement.length > 0 && linkElement.length > 0) {
          results.push({
            rank: i + 1 + start,
            title: titleElement.text(),
            url: linkElement.attr('href') || '',
            snippet: snippetElement.text().replace(/\s+/g, ' ').trim(),
          });
        }
      });

      return results;
    } catch (error) {
      logger.error('Puppeteer Error:', error);
      throw error;
    } finally {
      // Close the page/tab, keeping the browser instance open for reuse
      await page.close();
    }
  }

  /**
   * Simulates simple human behavior including random mouse movements and scrolling.
   */
  private async humanBehavior(page: Page) {
    try {
      await page.mouse.move(Math.random() * 1000, Math.random() * 500);
      await page.evaluate(() => {
        window.scrollBy(0, window.innerHeight / 2);
      });
      await new Promise((r) => setTimeout(r, Math.floor(Math.random() * 2000) + 1000));
    } catch (e) {
      logger.error('Puppeteer Error:', e);
    }
  }
}
