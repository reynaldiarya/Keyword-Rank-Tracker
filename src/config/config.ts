import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const envSchema = z.object({
  PORT: z
    .string()
    .default('3003')
    .transform((val) => parseInt(val, 10)),
  SCRAPING_ROBOT_API_KEY: z.string().optional(),
  SERPER_DEV_API_KEY: z.string().optional(),
});

const env = envSchema.safeParse(process.env);

if (!env.success) {
  console.error('❌ Invalid environment variables:', env.error.format());
  process.exit(1);
}

export const config = {
  port: env.data.PORT,
};
