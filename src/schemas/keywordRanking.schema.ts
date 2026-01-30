import { z } from 'zod';

/**
 * Schema validasi input untuk keyword ranking.
 * Memastikan data dari client sesuai format yang diharapkan.
 */
export const keywordRankingSchema = z.object({
  body: z.object({
    website: z.string().min(1, 'Website is required'), // Website wajib diisi
    keywords: z.array(z.string()).min(1, 'At least one keyword is required'), // Minimal 1 keyword
    page: z.coerce.number().int().min(1).default(1), // Halaman pencarian Google, default 1
    scraper: z.enum(['scrapingRobot', 'puppeteer', 'serperDev']).default('scrapingRobot'), // Pilihan scraper
  }),
});

export type KeywordRankingInput = z.infer<typeof keywordRankingSchema>;
