import { logger } from '../utils';
import type { SearchScraper } from '../types';
import { ScrapingRobotScraper } from './scrapers/ScrapingRobotScraper';
import { PuppeteerScraper } from './scrapers/PuppeteerScraper';
import { SerperDevScraper } from './scrapers/SerperDevScraper';
import { config } from '../config/config';

export interface RankingResult {
  keyword: string;
  rank: number | null;
  url: string | null;
}

export type ScraperType = 'scrapingRobot' | 'puppeteer' | 'serperDev';

export class KeywordRankingService {
  private readonly BATCH_SIZE = 1; // Number of keywords to process concurrently (in parallel)

  public async getKeywordRankings(
    website: string,
    keywords: string[],
    page: number = 1,
    scraperType: ScraperType = 'scrapingRobot'
  ): Promise<RankingResult[]> {
    const start = (page - 1) * 10;
    const results: RankingResult[] = [];

    // Select the scraper type based on the request parameters
    let scraper: SearchScraper;
    if (scraperType === 'puppeteer') {
      scraper = new PuppeteerScraper();
    } else if (scraperType === 'serperDev') {
      scraper = new SerperDevScraper(config.serperDevApiKey);
    } else {
      scraper = new ScrapingRobotScraper(config.scrapingRobotApiKey);
    }

    // Initialize the scraper (crucial for Puppeteer to avoid spawning multiple browser instances)
    if (scraper.initialize) {
      await scraper.initialize();
    }

    try {
      // Process keywords in batches to avoid overloading system resources or hitting rate limits
      for (let i = 0; i < keywords.length; i += this.BATCH_SIZE) {
        const batch = keywords.slice(i, i + this.BATCH_SIZE);

        // Process the current batch concurrently
        const batchPromises = batch.map((keyword) =>
          this.checkKeyword(website, keyword, start, scraper)
        );
        const batchResults = await Promise.all(batchPromises);
        results.push(...batchResults);
      }
    } finally {
      // Close the scraper to clean up resources (e.g., closing the Puppeteer browser instance)
      if (scraper.close) {
        await scraper.close();
      }
    }

    return results.filter((r) => r.rank !== null);
  }

  private async checkKeyword(
    website: string,
    keyword: string,
    start: number,
    scraper: SearchScraper
  ): Promise<RankingResult> {
    try {
      const serpResults = await scraper.fetchResults(keyword, start);

      // Check if the target website is present in the search results
      const match = serpResults.find((entry) => entry.url.includes(website));

      if (match) {
        logger.debug(`[DEBUG] Found match for ${keyword}! Rank: ${match.rank}, URL: ${match.url}`);
        return {
          keyword,
          rank: match.rank,
          url: match.url,
        };
      } else {
        return {
          keyword,
          rank: null,
          url: null,
        };
      }
    } catch (error) {
      logger.error(`Error checking keyword "${keyword}":`, error);
      return {
        keyword,
        rank: null,
        url: null,
      };
    }
  }
}

export const keywordRankingService = new KeywordRankingService();
