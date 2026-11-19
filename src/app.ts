import { Hono } from 'hono';
import { html } from 'hono/html';
import { getPath } from 'hono/utils/url';

import { config } from './config/config';
import { RankingProviderError } from './controllers/keywordRanking.controller';
import keywordRankingRoutes from './routes/keywordRanking.routes';
import type { AppEnv } from './types/app.types';
import { logger } from './utils';
import { renderTracker } from './web/tracker';

export const app = new Hono<AppEnv>({
  getPath(request) {
    const path = getPath(request);
    return /^\/keyword-ranking\/?$/i.test(path) ? '/keyword-ranking' : path;
  },
});

app.onError((error, c) => {
  if (error instanceof RankingProviderError) {
    const cause = error.cause instanceof Error ? error.cause.message : error.message;
    logger.error(`Keyword Ranking Controller Error: ${cause}`);
    return c.json({ error: 'Internal Server Error' }, 500);
  }

  logger.error(error.message);
  if (config.isDevelopment && error.stack) {
    logger.debug(error.stack);
  }
  return c.json(
    {
      error: 'Internal Server Error',
      message: config.isDevelopment ? error.message : undefined,
    },
    500
  );
});

app.route('/', keywordRankingRoutes);
app.get('/', (c) => c.html(html`<!doctype html>${renderTracker()}`));

export default app;
