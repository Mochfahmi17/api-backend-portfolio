import { NextFunction, Request, Response } from "express";
import createError from "http-errors";
import verifyToken from "../utils/verifiyToken";
import jwt from "jsonwebtoken";

declare global {
  namespace Express {
    interface Request {
      user?: {
        userId: string;
      };
    }
  }
}

/**
 * Middleware to authenticate incoming requests using a JSON Web Token (JWT).
 *
 * This middleware looks for a JWT in the `Authorization` header (as a Bearer token)
 * or in the `accessToken` cookie. If a valid token is found, it decodes the token
 * and stores the `userId` from the payload into `req.user` for downstream use.
 *
 * If the token is missing invalid, or expired, it forwards an HTTP 401 Unauthorization error.
 * On internal failure, it forwards an HTTP 500 Internal Server Error.
 *
 * @param {Request} req - The Express request object.
 * @param {Response} res - The Express response object.
 * @param {NextFunction} next - callback to pass controll to the next middleware.
 * @returns {void}
 */
const authenticate = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.headers.authorization?.split(" ")[1] || req.cookies.accessToken;
    if (!token) {
      return next(createError(401, "unauthorized."));
    }

    const decode = verifyToken(token, process.env.JWT_SECRET as string) as jwt.JwtPayload;
    if (!decode || !decode.id) {
      next(createError(401, "Invalid or expired token."));
    }

    req.user = { userId: decode.id };
    next();
  } catch (error) {
    let errorMessage = "Something went wrong!";

    if (error instanceof Error) {
      return next(createError(500, error.message || errorMessage));
    }
  }
};

export default authenticate;
