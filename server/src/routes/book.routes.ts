import { Router, Response } from 'express';
import { bookSearchService } from '../services/book-search.service';
import { AppError } from '../services/auth.service';
import { authMiddleware, AuthRequest } from '../middleware/auth.middleware';

const router = Router();

// GET /api/books/search?q={query}
router.get('/search', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const query = req.query.q as string;

    if (!query || query.trim().length === 0) {
      res.status(400).json({
        error: {
          code: 'VALIDATION_ERROR',
          message: '검색어를 입력해주세요',
        },
      });
      return;
    }

    const results = await bookSearchService.search(query);
    res.json({ items: results });
  } catch (err) {
    if (err instanceof AppError) {
      res.status(err.statusCode).json({
        error: { code: err.code, message: err.message },
      });
      return;
    }
    res.status(500).json({
      error: { code: 'INTERNAL_ERROR', message: '서버 오류가 발생했습니다' },
    });
  }
});

export default router;
