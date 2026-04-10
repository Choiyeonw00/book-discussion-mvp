import { Request, Response, NextFunction } from 'express';
import { authService, TokenPayload } from '../services/auth.service';

export interface AuthRequest extends Request {
  user?: TokenPayload;
}

export const authMiddleware = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({
      error: {
        code: 'INVALID_TOKEN',
        message: '인증 토큰이 필요합니다',
      },
    });
    return;
  }

  const token = authHeader.split(' ')[1];

  try {
    const payload = await authService.validateToken(token);
    req.user = payload;
    next();
  } catch (err: any) {
    const code = err.code || 'INVALID_TOKEN';
    const message = err.message || '유효하지 않은 토큰입니다';
    const statusCode = err.statusCode || 401;

    res.status(statusCode).json({
      error: { code, message },
    });
  }
};

// 선택적 인증: 토큰이 있으면 파싱하고, 없어도 통과
export const optionalAuthMiddleware = async (
  req: AuthRequest,
  _res: Response,
  next: NextFunction,
): Promise<void> => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    try {
      req.user = await authService.validateToken(token);
    } catch {
      // 토큰이 유효하지 않아도 그냥 통과
    }
  }
  next();
};
