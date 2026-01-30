import express from 'express';

import keywordRankingRoutes from './routes/keywordRanking.routes';
import { errorHandler } from './middleware/errorHandler.middleware';

const app = express();

app.use(express.json());
app.use('/keyword-ranking', keywordRankingRoutes);

app.use(errorHandler);

export default app;
