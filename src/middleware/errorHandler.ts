import { NextFunction, Request, Response } from "express";
import { HttpError } from "http-errors";

export const errorHandler = (err: HttpError, req: Request, res: Response, next: NextFunction) => {
  const statusCode = err.statusCode || err.status || 500;

  return res.status(statusCode).json({ error: true, success: false, message: err.message });
};
