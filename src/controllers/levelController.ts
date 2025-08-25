import { NextFunction, Request, Response } from "express";
import createError from "http-errors";
import { allLevels } from "../services/levelServices";

/**
 * Get all levels from the database.
 *
 * @route GET /api/levels
 * @returns {200 OK} List of levels
 * @returns {200 OK} If no levels are found (empty array)
 * @returns {500 Internal Server Error} If something goes wrong
 */
export const getAllLevels = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const levels = await allLevels();

    return res.status(200).json({ success: true, error: false, data: levels });
  } catch (error) {
    console.error(error);
    if (error instanceof Error) {
      return next(createError(500, "Something went wrong!"));
    }

    throw error;
  }
};
