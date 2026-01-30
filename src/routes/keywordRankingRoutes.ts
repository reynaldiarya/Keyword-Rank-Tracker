import { Router } from 'express';

import {
  keywordRankingController,
  keywordRankingSchema,
} from '../controllers/keywordRankingController';
import { validateRequest } from '../middleware/validateRequest';

const router = Router();

router.get('/', validateRequest(keywordRankingSchema), (req, res) =>
  keywordRankingController.getRankings(req, res)
);

export default router;
