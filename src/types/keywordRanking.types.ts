import type { RankingResult } from '../services/keywordRanking.service';

export const INCOMPLETE_RANKINGS_HEADER = 'X-Ranking-Incomplete';

export interface KeywordRankingResponse {
  website: string;
  page: number;
  totalFound: number;
  rankings: RankingResult[];
}
