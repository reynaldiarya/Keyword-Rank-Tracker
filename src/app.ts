import express, { json } from 'express';

import keywordRankingRoutes from './routes/keywordRanking.routes';
import { errorHandler } from './middleware';

const app = express();

app.use(json());
app.use('/keyword-ranking', keywordRankingRoutes);

app.use(errorHandler);

export default app;
