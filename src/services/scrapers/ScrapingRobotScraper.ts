import axios from 'axios';
import * as cheerio from 'cheerio';

import type { SearchScraper, SerpEntry } from '../../types';
import { logger } from '../../utils';

interface ScrapingRobotResponse {
  status?: string;
  httpCode?: number;
  result?: string;
}

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

    const googleUrl = new URL('https://www.google.com/search');
    googleUrl.searchParams.set('q', keyword);
    googleUrl.searchParams.set('hl', lang);
    googleUrl.searchParams.set('gl', country.toLowerCase());
    if (start !== 0) googleUrl.searchParams.set('start', String(start));

    // Let Scraping Robot use its default proxy. The Google URL sets the search region.
    const apiUrl = new URL('https://api.scrapingrobot.com/');
    apiUrl.search = new URLSearchParams({
      token: this.apiKey,
      url: googleUrl.href,
    }).toString();

    try {
      logger.info(`Searching via Scraping Robot: "${keyword}"`);
      const { data } = await axios.get<ScrapingRobotResponse>(apiUrl.href);
      const { status, httpCode, result: html } = data;
      if (
        status === 'FAIL' ||
        (httpCode !== undefined && httpCode !== 200) ||
        typeof html !== 'string' ||
        !html.trim()
      ) {
        throw new Error('Scraping Robot did not return a successful Google page');
      }

      const $ = cheerio.load(html);

      const results: SerpEntry[] = [];
      const entries = $('div.yuRUbf');

      entries.each((index, element) => {
        const titleElement = $(element).find('h3');
        const linkElement = $(element).find('a').first();
        const snippetElement = $(element).find('div[style*="-webkit-line-clamp"]');
        const href = linkElement.attr('href');
        if (!href) return;

        let url = href;
        const redirect = URL.parse(href, googleUrl);
        if (redirect?.origin === googleUrl.origin && redirect.pathname === '/goto') {
          // Google can hide the destination in an opaque redirect and show the address in the citation.
          const [displayedAddress] = linkElement
            .find('cite')
            .first()
            .text()
            .trim()
            .split(/[\s›»]/, 1);
          const destination = displayedAddress ? URL.parse(displayedAddress) : null;
          if (
            !destination ||
            (destination.protocol !== 'http:' && destination.protocol !== 'https:') ||
            destination.username ||
            destination.password
          ) {
            return;
          }
          url = destination.href;
        }

        results.push({
          rank: index + 1 + start,
          title: titleElement.text(),
          url,
          snippet: snippetElement.text().replace(/\s+/g, ' ').trim(),
        });
      });

      if (!results.length && (entries.length > 0 || !$('#search, #rso, #topstuff').length)) {
        throw new Error('Scraping Robot did not return readable Google results');
      }

      return results;
    } catch (error) {
      logger.error('Scraping Robot Error:', error);
      throw error;
    }
  }
}
