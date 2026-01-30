import express from 'express';

import keywordRankingRoutes from './routes/keywordRankingRoutes';
import { errorHandler } from './middleware/errorHandler';

const app = express();

app.use(express.json());
app.use('/keyword-ranking', keywordRankingRoutes);

app.use(errorHandler);

export default app;
