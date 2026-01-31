import { Router } from 'express';

import { keywordRankingController } from '../controllers';
import { keywordRankingSchema } from '../schemas';
import { validateRequest } from '../middleware';

const router = Router();

router.get('/', validateRequest(keywordRankingSchema), (req, res) =>
  keywordRankingController.getRankings(req, res)
);

export default router;
