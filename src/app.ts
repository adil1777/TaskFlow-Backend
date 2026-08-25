import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import statusCodes from './utils/statusCodes';
import routes from './routes';
import { errorMiddleware } from './middlewares/error.middleware';

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());

//route
app.use('/api/v1', routes);

app.get('/health', (_req, res) => {
  res.status(statusCodes.OK).json({
    success: true,
    message: 'TaskFlow API is running',
  });
});

app.use(errorMiddleware);

export default app;
