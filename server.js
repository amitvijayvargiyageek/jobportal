import { dirname } from 'path';
import { fileURLToPath } from 'url';
import path from 'path';
import cloudinary from 'cloudinary';
import 'express-async-errors';
import * as dotenv from 'dotenv';
import express from 'express';
import morgan from 'morgan';
import mongoose from 'mongoose';
import cookieParser from 'cookie-parser';
import jobRouter from './routes/jobRouter.js';
import authRouter from './routes/authRouter.js';
import userRouter from './routes/userRouter.js';
import errorHandlerMiddleware from './middleware/errorMiddleware.js';
import { authenticateUser } from './middleware/authMiddleware.js';

dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_API_KEY,
  api_secret: process.env.CLOUD_API_SECRET,
});

const app = express();

app.use(express.json());
if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
}

const port = process.env.PORT || 5100;

app.get('/api/v1/test', (req, res) => {
  res.json({ msg: 'test route' });
});

const __dirname = dirname(fileURLToPath(import.meta.url));

app.use(express.static(path.resolve(__dirname, './public')));

app.use(cookieParser());
app.use(errorHandlerMiddleware);

app.use('/api/v1/auth', authRouter);
app.use('/api/v1/jobs', authenticateUser, jobRouter);
app.use('/api/v1/users', authenticateUser, userRouter);

app.get('*', (req, res) => {
  res.sendFile(path.resolve(__dirname, './public', 'index.html'));
});

try {
  await mongoose.connect(process.env.MONGO_URL);
  app.listen(port, () => {
    console.log(`Server is listening to port ${port}`);
  });
} catch (error) {
  console.log(error);
  process.exit(1);
}