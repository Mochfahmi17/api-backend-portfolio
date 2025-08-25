import { NextFunction, Request, Response } from "express";
import createError from "http-errors";
import { MulterFiles } from "../types";
import { allUser, getUserById, update } from "../services/userService";
import destroyFromCloudinary from "../utils/destroyFromCloudinary";
import uploadToCloudinary from "../utils/uploadToCloudinary";

/**
 * Get all users from the database.
 *
 * @route GET /api/user
 * @access Public
 * @returns {200 OK} If users are found or no users exist
 * @returns {500 Internal Server Error} On unexpected error
 */
export const user = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await allUser();

    return res.status(200).json({
      success: true,
      error: false,
      data: user,
    });
  } catch (error) {
    console.error(error);
    return next(createError(500, "Something went wrong!"));
  }
};

/**
 * Get detailed information about a specific user by ID.
 *
 * @route GET /api/user/:id
 * @access Public
 * @param {string} id - The ID of the user to retrieve (from URL params)
 * @returns {200 OK} On success, returns the user data
 * @returns {404 Not Found} If the user with the given ID does not exist
 * @returns {500 Internal Server Error} On unexpected error
 */
export const getDetailUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    const user = await getUserById(id);
    if (!user) {
      return next(createError(404, "User not found!"));
    }

    return res.status(200).json({
      success: true,
      error: false,
      message: "Successfully to get user!",
      data: user,
    });
  } catch (error) {
    console.error(error);
    return next(createError(500, "Something went wrong!"));
  }
};

/**
 * Edit user profile including optional profile image and CV.
 *
 * @route PUT /api/user/edit
 * @access Private (requires authentication)
 * @middleware authenticate, upload.fields([{ name: 'profile' }, { name: 'cv' }]), validate(...)
 * @param {string} name - The updated name of the user
 * @param {Express.Multer.File} [files.profile] - Optional profile image (jpg, jpeg, png, webp, svg) max 2MB
 * @param {Express.Multer.File} [files.cv] - Optional CV file (PDF) max 2MB
 * @returns {200 OK} On successful update with updated user data
 * @returns {400 Bad Request} If profile or CV file is invalid
 * @returns {401 Unauthorized} If user is not authenticated
 * @returns {404 Not Found} If user is not found
 * @returns {500 Internal Server Error} On unexpected error
 */
export const editProfile = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name } = req.body;
    const userId = req.user?.userId;
    const files = req.files as MulterFiles;

    if (!userId) {
      return next(createError(401, "Unauthorized"));
    }

    const user = await getUserById(userId);
    if (!user) {
      return next(createError(404, "User not found!"));
    }

    const allowMimePdf = ["application/pdf"];
    const allowedMime = ["image/jpg", "image/jpeg", "image/png", "image/webp"];
    const maxSize = 2 * 1024 * 1024;

    let profileUrl = user.profileUrl;
    let profileId = user.profile_public_id;
    let cvUrl = user.myCVUrl;
    let cvId = user.myCV_public_id;

    // Handle profile image
    const profileFile = files.profile?.[0];
    if (profileFile) {
      if (!allowedMime.includes(profileFile.mimetype) && profileFile.size > maxSize) {
        return next(createError(400, "Invalid profile image file! Must be JPG, JPEG, PNG, or WEBP under 2MB."));
      }

      if (profileId) {
        await destroyFromCloudinary(profileId);
      }

      const uploadResult = await uploadToCloudinary(profileFile, "profile");
      profileUrl = uploadResult.secure_url;
      profileId = uploadResult.public_id;
    }

    // Handle CV File
    const cvFile = files.cv?.[0];
    if (cvFile) {
      if (!allowMimePdf.includes(cvFile.mimetype) && cvFile.size > maxSize) {
        return next(createError(400, "Invalid file! Must be PDF under 2MB."));
      }

      if (cvId) {
        await destroyFromCloudinary(cvId);
      }

      const uploadResult = await uploadToCloudinary(cvFile, "my_CV");
      cvUrl = uploadResult.secure_url;
      cvId = uploadResult.public_id;
    }

    const updateData = {
      name: name ?? user.name,
      profileUrl,
      profileId,
      cvUrl,
      cvId,
    };
    const updatedUser = await update(user.id, updateData.name, updateData.profileUrl, updateData.profileId, updateData.cvUrl, updateData.cvId);

    return res.status(200).json({
      success: true,
      error: false,
      message: "Update user successfully!",
      data: updatedUser,
    });
  } catch (error) {
    console.error(error);
    return next(createError(500, "Something went wrong!"));
  }
};
