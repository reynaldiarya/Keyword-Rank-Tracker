import { Router } from 'express';

import { keywordRankingController } from '../controllers/keywordRanking.controller';
import { keywordRankingSchema } from '../schemas/keywordRanking.schema';
import { validateRequest } from '../middleware/validateRequest.middleware';

const router = Router();

router.get('/', validateRequest(keywordRankingSchema), (req, res) =>
  keywordRankingController.getRankings(req, res)
);

export default router;
