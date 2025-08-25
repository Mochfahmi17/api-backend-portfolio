import { NextFunction, Request, Response } from "express";
import createError from "http-errors";
import { ZodType } from "zod";

const validate = (schema: ZodType) => (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      return result.error.issues.map((e) => next(createError(400, e.message)));
    }

    req.body = result.data;
    next();
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Terjadi kesalahan saat validasi" });
  }
};

export default validate;
