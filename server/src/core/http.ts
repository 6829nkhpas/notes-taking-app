import { Response } from 'express';

export function ok<T>(res: Response, data: T, status: number = 200) {
  return res.status(status).json({
    success: true,
    data
  });
}

export function created<T>(res: Response, data: T) {
  return ok(res, data, 201);
}

export function noContent(res: Response) {
  return res.status(204).send();
}
