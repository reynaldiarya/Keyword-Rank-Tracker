import type { Request, Response } from 'express';

import { keywordRankingService } from '../services';
import { logger } from '../utils';

export class KeywordRankingController {
  /**
   * Retrieves keyword rankings for a specific website.
   * This method invokes the ranking service to perform the scraping.
   */
  public async getRankings(req: Request, res: Response): Promise<void> {
    try {
      // Data has been validated by the middleware, so it is safe to extract directly
      const { website, keywords, page, scraper } = req.body;

      const results = await keywordRankingService.getKeywordRankings(
        website,
        keywords,
        page,
        scraper
      );

      // Return the JSON response to the user
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
