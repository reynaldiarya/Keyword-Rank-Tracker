import axios from 'axios';
import * as cheerio from 'cheerio';

import type { SearchScraper, SerpEntry } from '../../types';
import { logger } from '../../utils';

/**
 * Scraper using a third-party API (Scraping Robot).
 * Typically more stable than local Puppeteer, but requires API usage credits.
 */
export class ScrapingRobotScraper implements SearchScraper {
  private readonly apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async fetchResults(
    keyword: string,
    start: number = 0,
    lang: string = 'id',
    country: string = 'ID'
  ): Promise<SerpEntry[]> {
    if (!this.apiKey) {
      logger.error('SCRAPING_ROBOT_API_KEY is not configured');
      throw new Error('SCRAPING_ROBOT_API_KEY is not configured');
    }

    const formattedKeyword = keyword.split(' ').join('+');
    // Target Google Search URL to be scraped via the API
    const googleUrl = encodeURI(
      `https://www.google.com/search?hl=${lang}&q=${formattedKeyword}&start=${start}`
    );

    // Send request to the Scraping Robot API
    const apiUrl = `https://api.scrapingrobot.com/?token=${this.apiKey}&proxyCountry=${country}&render=false&url=${googleUrl}`;

    try {
      logger.info(`Searching via Scraping Robot: "${keyword}"`);
      const response = await axios.get(apiUrl);
      const html = response.data.result;
      const $ = cheerio.load(html);

      const results: SerpEntry[] = [];
      const entries = $('div.yuRUbf');

      entries.each((index, element) => {
        const titleElement = $(element).find('h3');
        const linkElement = $(element).find('a');
        const snippetElement = $(element).find('div[style*="-webkit-line-clamp"]');

        if (linkElement.length > 0) {
          results.push({
            rank: index + 1 + start,
            title: titleElement.text(),
            url: linkElement.attr('href') || '',
            snippet: snippetElement.text().replace(/\s+/g, ' ').trim(),
          });
        }
      });

      return results;
    } catch (error) {
      logger.error('Scraping Robot Error:', error);
      throw error;
    }
  }
}
