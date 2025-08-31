import { CookieOptions, NextFunction, Request, Response } from "express";
import bcryptjs from "bcryptjs";
import { generateToken } from "../utils/generateToken";
import createError from "http-errors";
import { getUserByEmail } from "../services/authServices";

/**
 * Authenticate user and set access token in HTTP-only cookie.
 *
 * @route POST /api/auth/login
 * @param {string} email - User's email address
 * @param {string} password - User's password
 * @returns {200 OK} If login is successful, returns access token and sets cookie
 * @returns {401 Unauthorized} If email or password is invalid
 * @returns {500 Internal Server Error} If an unexpected error occurs
 *
 * @example Request body:
 * {
 *   "email": "user@example.com",
 *   "password": "secret123"
 * }
 *
 * @example Success response:
 * {
 *   "success": true,
 *   "error": false,
 *   "message": "Login Successfully!",
 *   "accessToken": "eyJhbGciOiJIUzI1NiIsIn..."
 * }
 */
export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password } = req.body;

    const user = await getUserByEmail(email);
    if (!user) {
      return next(createError(401, "Invalid email or password."));
    }

    const isPasswordMatch = await bcryptjs.compare(password, user.password);
    if (!isPasswordMatch) {
      return next(createError(401, "Invalid email or password."));
    }

    const accessToken = generateToken(user.id);

    const cookieOption: CookieOptions = {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      maxAge: 5 * 60 * 60 * 1000,
    };
    res.cookie("accessToken", accessToken, cookieOption);

    return res.status(200).json({
      success: true,
      error: false,
      message: "Login Successfully!",
      accessToken,
    });
  } catch (error) {
    console.error(error);
    return next(createError(500, "Something went wrong!"));
  }
};

/**
 * Check if the user is authenticated.
 *
 * This route is protected by the `authenticate` middleware, which validates the JWT token
 * from the request (via HTTP-only cookie or Authorization header).
 *
 * If the token is valid and the user ID is available in `req.user`, the user is considered authenticated.
 * Otherwise, the request is rejected with a 401 Unauthorized error.
 *
 * @route GET /api/auth/is-auth
 * @access Protected (requires valid JWT token)
 *
 * @returns {200 OK} If the user is authenticated, returns success status and user ID.
 * @returns {401 Unauthorized} If the user is not authenticated or token is missing/invalid.
 * @returns {500 Internal Server Error} If an unexpected error occurs.
 *
 * @example Success response:
 * {
 *   "success": true,
 *   "error": false,
 *   "message": "User is already authenticated!",
 *   "user": "user-id-12345"
 * }
 */
export const isAuthenticated = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      return next(createError(401, "Unauthorized."));
    }

    return res.status(200).json({
      success: true,
      error: false,
      message: "User is already authenticated!",
      user: userId,
    });
  } catch (error) {
    console.error(error);
    return next(createError(500, "Something went wrong!"));
  }
};

/**
 * Logs out the user by clearing the accessToken cookie.
 *
 * @route POST /api/auth/logout
 * @returns {200 OK} Logout successful
 */
export const logout = (req: Request, res: Response, next: NextFunction) => {
  try {
    const cookieOption: CookieOptions = {
      httpOnly: true,
      secure: true,
      sameSite: "none",
    };
    res.clearCookie("accessToken", cookieOption);

    return res.status(200).json({
      success: true,
      error: false,
      message: "Logout successfully!",
    });
  } catch (error) {
    console.error(error);
    next(createError(500, "Logout failed. Please try again."));
  }
};
