import type { Handler } from 'hono';

import type { KeywordRankingInput } from '../schemas';
import { keywordRankingService } from '../services/keywordRanking.service';
import type { AppEnv } from '../types/app.types';
import { INCOMPLETE_RANKINGS_HEADER } from '../types/keywordRanking.types';
import type { KeywordRankingResponse } from '../types/keywordRanking.types';

export class RankingProviderError extends Error {}

export const getRankings: Handler<AppEnv, string, { out: { json: KeywordRankingInput } }> = async (
  c
) => {
  const { website, keywords, page, scraper } = c.req.valid('json').body;
  const rankings = await keywordRankingService
    .getKeywordRankings(website, keywords, page, scraper, () => {
      c.header(INCOMPLETE_RANKINGS_HEADER, 'true');
    })
    .catch((cause: unknown) => {
      throw new RankingProviderError('Keyword ranking provider failed', { cause });
    });

  return c.json<KeywordRankingResponse>({
    website,
    page,
    totalFound: rankings.length,
    rankings,
  });
};
