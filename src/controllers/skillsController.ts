import { NextFunction, Request, Response } from "express";
import createError from "http-errors";
import { allSkills, destroy, getSkillById, store, update } from "../services/skillsServices";
import uploadToCloudinary from "../utils/uploadToCloudinary";
import destroyFromCloudinary from "../utils/destroyFromCloudinary";

/**
 * Get all skills from the database.
 *
 * @route GET /api/skills
 * @returns {200 OK} List of skills
 * @returns {404 Not Found} If no skills are found
 * @returns {500 Internal Server Error} If something goes wrong
 */
export const getAllSkills = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const skills = await allSkills();

    return res.status(200).json({
      success: true,
      error: false,
      data: skills,
    });
  } catch (error) {
    console.error(error);
    return next(createError(500, "Something went wrong!"));
  }
};

/**
 * Get detail of a skill by ID.
 *
 * @route GET /api/skills/:id
 * @param {string} id - Skill ID from route params
 * @returns {200 OK} Skill retrieved successfully
 * @returns {404 Not Found} If skill does not exist
 * @returns {500 Internal Server Error} If something goes wrong
 */
export const getDetailSkill = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    const skill = await getSkillById(id);
    if (!skill) {
      return next(createError(404, "Skill not found!"));
    }

    return res.status(200).json({
      success: true,
      error: false,
      message: "Successfully to get skill!",
      data: skill,
    });
  } catch (error) {
    console.error(error);
    return next(createError(500, "Something went wrong!"));
  }
};

/**
 * Add a new skill with image upload to Cloudinary.
 *
 * @route POST /api/skills/create
 * @param {string} name - Skill name
 * @param {string} levelId - Associated level ID
 * @param {Express.Multer.File} req.file - Uploaded icon image
 * @returns {201 Created} Skill added successfully
 * @returns {400 Bad Request} If image is invalid or missing
 * @returns {500 Internal Server Error} If something goes wrong
 */
export const addNewSkill = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, levelId } = req.body;
    const iconImage = req.file;

    const allowedMime = ["image/jpg", "image/jpeg", "image/png", "image/svg+xml", "image/webp"];
    const maxSize = 2 * 1024 * 1024;

    if (!iconImage) return next(createError(400, "Icon is required!"));
    if (!allowedMime.includes(iconImage.mimetype) || iconImage.size > maxSize) {
      return next(createError(400, "Invalid icon image file! Must be JPG, JPEG, PNG, or WEBP under 2MB."));
    }

    const { secure_url, public_id } = await uploadToCloudinary(iconImage, "skill");

    const newSkill = await store(name, levelId, secure_url, public_id);

    return res.status(201).json({
      success: true,
      error: false,
      message: "Successfully add new skills!",
      data: newSkill,
    });
  } catch (error) {
    console.error(error);
    return next(createError(500, "Something went wrong!"));
  }
};

/**
 * Edit an existing skill by ID, optionally updating the icon image.
 *
 * @route PUT /api/skills/edit/:id
 * @param {string} id - Skill ID from route params
 * @param {string} name - Updated name (optional)
 * @param {string} levelId - Updated level ID (optional)
 * @param {Express.Multer.File} req.file - New icon image (optional)
 * @returns {200 OK} Skill updated successfully
 * @returns {400 Bad Request} If image is invalid
 * @returns {404 Not Found} If skill does not exist
 * @returns {500 Internal Server Error} If something goes wrong
 */
export const editSkill = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, levelId } = req.body;
    const { id } = req.params;
    const iconImage = req.file;

    const allowedMime = ["image/jpg", "image/jpeg", "image/png", "image/svg+xml", "image/webp"];
    const maxSize = 2 * 1024 * 1024;

    const skill = await getSkillById(id);
    if (!skill) {
      return next(createError(404, "Skill not found!"));
    }

    let iconUrl = skill.iconUrl;
    let iconId = skill.icon_public_id;
    if (iconImage) {
      if (!allowedMime.includes(iconImage.mimetype) || iconImage.size > maxSize) {
        return next(createError(400, "Invalid icon image file! Must be JPG, JPEG, PNG, or WEBP under 2MB."));
      }

      if (iconId) {
        await destroyFromCloudinary(iconId);
      }

      const uploadResult = await uploadToCloudinary(iconImage, "skill");
      iconUrl = uploadResult.secure_url;
      iconId = uploadResult.public_id;
    }

    const updateData = {
      name: name ?? skill.name,
      levelId: levelId ?? skill.levelId,
      iconUrl,
      iconId,
    };

    const updatedSkill = await update(skill.id, updateData.name, updateData.levelId, updateData.iconUrl, updateData.iconId);

    return res.status(200).json({
      success: true,
      error: false,
      message: "Update skill successfully!.",
      data: updatedSkill,
    });
  } catch (error) {
    console.error(error);
    next(createError(500, "Something went wrong!"));
  }
};

/**
 * Delete a skill by ID, including its icon from Cloudinary.
 *
 * @route DELETE /api/skills/delete/:id
 * @param {string} id - Skill ID from route params
 * @returns {200 OK} Skill deleted successfully
 * @returns {404 Not Found} If the skill does not exist
 * @returns {500 Internal Server Error} If something goes wrong
 */
export const deleteSkill = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    const skill = await getSkillById(id);

    if (!skill) {
      return next(createError(404, "Skill not found!"));
    }

    await destroyFromCloudinary(skill.icon_public_id);
    await destroy(skill.id);

    return res.status(200).json({
      success: true,
      error: false,
      message: "Deleted skill successfully!",
    });
  } catch (error) {
    console.error(error);
    next(createError(500, "Something went wrong!"));
  }
};
