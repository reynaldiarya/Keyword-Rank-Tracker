import dotenv from 'dotenv';

import { logger } from '../utils/logger';
import type { SearchScraper } from '../types/ScraperInterface';
import { ScrapingRobotScraper } from './scrapers/ScrapingRobotScraper';
import { PuppeteerScraper } from './scrapers/PuppeteerScraper';
import { SerperDevScraper } from './scrapers/SerperDevScraper';

dotenv.config();

export interface RankingResult {
  keyword: string;
  rank: number | null;
  url: string | null;
}

export type ScraperType = 'scrapingRobot' | 'puppeteer' | 'serperDev';

export class KeywordRankingService {
  private readonly BATCH_SIZE = 1; // Jumlah keyword yang diproses sekaligus (paralel)

  public async getKeywordRankings(
    website: string,
    keywords: string[],
    page: number = 1,
    scraperType: ScraperType = 'scrapingRobot'
  ): Promise<RankingResult[]> {
    const start = (page - 1) * 10;
    const results: RankingResult[] = [];

    // Pilih jenis Scraper sesuai request
    let scraper: SearchScraper;
    if (scraperType === 'puppeteer') {
      scraper = new PuppeteerScraper();
    } else if (scraperType === 'serperDev') {
      const apiKey = process.env.SERPER_DEV_API_KEY || '';
      scraper = new SerperDevScraper(apiKey);
    } else {
      const apiKey = process.env.SCRAPING_ROBOT_API_KEY || '';
      scraper = new ScrapingRobotScraper(apiKey);
    }

    // Initialize Scraper (Penting untuk Puppeteer agar buka browser 1x saja)
    if (scraper.initialize) {
      await scraper.initialize();
    }

    try {
      // Proses keyword dalam batch (kelompok) agar tidak terlalu berat
      for (let i = 0; i < keywords.length; i += this.BATCH_SIZE) {
        const batch = keywords.slice(i, i + this.BATCH_SIZE);

        // Proses batch secara concurrent (bersamaan)
        const batchPromises = batch.map((keyword) =>
          this.checkKeyword(website, keyword, start, scraper)
        );
        const batchResults = await Promise.all(batchPromises);
        results.push(...batchResults);
      }
    } finally {
      // Tutup Scraper (Tutup browser Puppeteer) setelah semua selesai
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

      // Cari apakah website kita ada di hasil pencarian
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
