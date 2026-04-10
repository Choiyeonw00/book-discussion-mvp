import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import authRouter from './routes/auth.routes';
import bookRouter from './routes/book.routes';
import groupRouter from './routes/group.routes';
import memoRouter from './routes/memo.routes';
import discussionRouter from './routes/discussion.routes';
import mypageRouter from './routes/mypage.routes';
import { globalErrorHandler } from './middleware/errorHandler';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors({
  origin: ['http://localhost:5173', 'http://127.0.0.1:5173'],
  credentials: true
}));
app.use(express.json());

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' });
});

// 라우터 등록
app.use('/api/auth', authRouter);
app.use('/api/books', bookRouter);
app.use('/api/groups', groupRouter);
app.use('/api', memoRouter);
app.use('/api', discussionRouter);
app.use('/api/me', mypageRouter);

// 글로벌 에러 핸들러 (모든 라우터 뒤에 등록)
app.use(globalErrorHandler);

app.listen(PORT, () => {
  console.log(`Server is running on 127.0.0.1:${PORT}`);
});

export default app;
