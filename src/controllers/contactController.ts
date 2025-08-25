import { NextFunction, Request, Response } from "express";
import createError from "http-errors";
import sendEmail from "../utils/sendEmail";

/**
 * Send a contact message via email.
 *
 * @route POST /api/contact
 * @param {string} name - Sender's name
 * @param {string} email - Sender's email address
 * @param {string} message - The message content (min 10 characters)
 * @returns {200 OK} Message sent successfully
 * @returns {400 Bad Request} If validation fails (e.g., missing fields or invalid input)
 * @returns {500 Internal Server Error} If something goes wrong during email sending
 */
export const contactMe = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, email, message } = req.body;

    await sendEmail(name, email, message);

    return res.status(200).json({
      success: true,
      error: false,
      message: "Message sent successfully!",
    });
  } catch (error) {
    console.error(error);
    return next(createError(500, "Something went wrong!"));
  }
};
