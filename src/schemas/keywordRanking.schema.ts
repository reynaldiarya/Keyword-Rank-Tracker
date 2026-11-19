import { z } from 'zod';

/**
 * Input validation schema for keyword ranking requests.
 * Ensures the incoming client request data conforms to the expected structure.
 */
export const keywordRankingSchema = z.object({
  body: z.object({
    website: z.string().min(1, 'Website is required'), // The target website URL to track
    keywords: z.array(z.string()).min(1, 'At least one keyword is required'), // Array of keywords to search for
    page: z.coerce.number().int().min(1).default(1), // Google search results page to scan (defaults to 1)
    scraper: z.enum(['scrapingRobot', 'puppeteer', 'serperDev']).default('scrapingRobot'), // Choice of scraper service/method
  }),
});

export type KeywordRankingInput = z.infer<typeof keywordRankingSchema>;
