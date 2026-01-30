import type { Request, Response } from 'express';
import { z } from 'zod';

import { keywordRankingService } from '../services/keywordRankingService';
import { logger } from '../utils/logger';

// Schema validasi input menggunakan Zod
export const keywordRankingSchema = z.object({
  body: z.object({
    website: z.string().min(1, 'Website is required'), // Website wajib diisi
    keywords: z.array(z.string()).min(1, 'At least one keyword is required'), // Minimal 1 keyword
    page: z.coerce.number().int().min(1).default(1), // Halaman pencarian Google, default 1
    scraper: z.enum(['scrapingRobot', 'puppeteer', 'serperDev']).default('scrapingRobot'), // Pilihan scraper
  }),
});

export class KeywordRankingController {
  /**
   * Mengambil ranking keyword untuk website tertentu.
   * Method ini akan memanggil service untuk melakukan scraping.
   */
  public async getRankings(req: Request, res: Response): Promise<void> {
    try {
      // Data sudah divalidasi oleh middleware, jadi aman langsung diambil
      const { website, keywords, page, scraper } = req.body;

      const results = await keywordRankingService.getKeywordRankings(
        website,
        keywords,
        page,
        scraper
      );

      // Kembalikan response JSON ke user
      res.json({
        website,
        page,
        totalFound: results.length,
        rankings: results,
      });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      logger.error(`Keyword Ranking Controller Error: ${message}`);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }
}

export const keywordRankingController = new KeywordRankingController();
