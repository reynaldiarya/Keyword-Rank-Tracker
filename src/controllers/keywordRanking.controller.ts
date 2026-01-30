import type { Request, Response } from 'express';

import { keywordRankingService } from '../services/keywordRanking.service';
import { logger } from '../utils/logger';

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
