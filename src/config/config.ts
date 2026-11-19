import { z } from 'zod';

const envSchema = z.object({
  PORT: z
    .string()
    .default('3000')
    .transform((val) => parseInt(val, 10)),
  SCRAPING_ROBOT_API_KEY: z.string().optional(),
  SERPER_DEV_API_KEY: z.string().optional(),
});

const environment = globalThis.process?.env ?? {};
const env = envSchema.parse(environment);

export const config = {
  port: env.PORT,
  isDevelopment: environment.NODE_ENV === 'development',
  scrapingRobotApiKey: env.SCRAPING_ROBOT_API_KEY || '',
  serperDevApiKey: env.SERPER_DEV_API_KEY || '',
};
