import { zValidator } from '@hono/zod-validator';
import { Hono } from 'hono';

import { getRankings } from '../controllers/keywordRanking.controller';
import { prepareRankingBody } from '../middleware/rankingBody.middleware';
import { keywordRankingSchema } from '../schemas';
import type { AppEnv } from '../types/app.types';
import { logger } from '../utils';

const validateRanking = zValidator('json', keywordRankingSchema, (result, c) => {
  if (!result.success) {
    const details = result.error.issues.map(({ path, message }) => ({ path, message }));
    logger.warn(`Validation Error: ${JSON.stringify(details)}`);
    return c.json({ error: 'Validation Error', details }, 400);
  }
});

export default new Hono<AppEnv>().on(
  ['GET', 'POST'],
  '/keyword-ranking',
  prepareRankingBody,
  validateRanking,
  getRankings
);
