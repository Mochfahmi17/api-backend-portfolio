import { NextFunction, Request, Response } from "express";
import { allProjects, destroy, getProjectBySlug, store, update } from "../services/projectsServices";
import createError from "http-errors";
import uploadToCloudinary from "../utils/uploadToCloudinary";
import generateUniqueSlug from "../utils/generateUniqueSlug";
import destroyFromCloudinary from "../utils/destroyFromCloudinary";

/**
 * Get all projects from the database.
 *
 * @route GET /api/projects
 * @returns {200 OK} Returns list of projects
 * @returns {500 Internal Server Error} On unexpected error
 */
export const getAllProject = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;
    const category = typeof req.query.category === "string" && req.query.category.trim() !== "" ? req.query.category : undefined;

    const { projects, totalProjects } = await allProjects(skip, limit, category);

    const totalPages = Math.ceil(totalProjects / limit);

    return res.status(200).json({
      success: true,
      error: false,
      page,
      limit,
      totalPages,
      data: projects,
    });
  } catch (error) {
    console.error(error);
    if (error instanceof Error) {
      return next(createError(500, "Something went wrong!"));
    }

    throw error;
  }
};

/**
 * Get a single project by its slug.
 *
 * @route GET /api/projects/:slug
 * @param {string} slug - Slug of the project
 * @returns {200 OK} Returns the project details
 * @returns {404 Not Found} If project not found
 * @returns {500 Internal Server Error} On unexpected error
 */
export const getDetailProject = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { slug } = req.params;

    const project = await getProjectBySlug(slug.toLowerCase());

    if (!project) {
      next(createError(404, "Project not found!"));
    }

    return res.status(200).json({
      success: true,
      error: false,
      message: "Successfully to get project!",
      data: project,
    });
  } catch (error) {
    console.error(error);
    if (error instanceof Error) {
      return next(createError(500, "Something went wrong!"));
    }

    throw error;
  }
};

/**
 * Create a new project with image and skill associations.
 *
 * @route POST /api/projects/create
 * @param {string} title - Project title
 * @param {string} description - Project description
 * @param {string} categoryProjectId - Project category ID
 * @param {string[]} skillId - Associated skill IDs
 * @param {Express.Multer.File} req.file - Uploaded image
 * @returns {201 Created} On successful creation
 * @returns {400 Bad Request} If image is invalid or missing
 * @returns {500 Internal Server Error} On unexpected error
 */
export const createProject = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { title, description, categoryProjectId, skillId, linkDemo, linkRepository } = req.body;
    const image = req.file;
    const allowedMime = ["image/jpg", "image/jpeg", "image/png", "image/webp"];
    const maxSize = 2 * 1024 * 1024;

    if (!image) return next(createError(400, "Image is required!"));
    if (!allowedMime.includes(image.mimetype) || image.size > maxSize) return next(createError(400, "Invalid image file! Must be JPG, JPEG, PNG, or WEBP under 2MB."));

    const unqiueSlug = await generateUniqueSlug(title);

    const { secure_url, public_id } = await uploadToCloudinary(image, "project");

    const newProject = await store(title, unqiueSlug, description, categoryProjectId, secure_url, public_id, skillId, linkDemo, linkRepository);

    return res.status(201).json({
      success: true,
      error: false,
      message: "Successfully to create project!",
      data: newProject,
    });
  } catch (error) {
    console.error(error);
    if (error instanceof Error) {
      return next(createError(500, "Something went wrong!"));
    }

    throw error;
  }
};

/**
 * Edit an existing project by slug. Optionally updates image and slug.
 *
 * @route PUT /api/projects/edit/:slug
 * @param {string} slug - Existing slug of the project
 * @param {string} [title] - New title (optional)
 * @param {string} [description] - New description (optional)
 * @param {string} [categoryProjectId] - New category ID (optional)
 * @param {string[]} [skillId] - Updated skills (optional)
 * @param {Express.Multer.File} [req.file] - New image (optional)
 * @returns {200 OK} On successful update
 * @returns {400 Bad Request} If new image is invalid
 * @returns {404 Not Found} If project not found
 * @returns {500 Internal Server Error} On unexpected error
 */
export const editProject = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Mengambil data dari request body dan parameter URL
    const { title, description, categoryProjectId, skillId, linkDemo, linkRepository } = req.body;
    const { slug } = req.params;
    const image = req.file;

    // Tipe file gambar yang diizinkan (jpg, jpeg, png dan webp) & ukuran maksimum (2MB)
    const allowedMime = ["image/jpg", "image/jpeg", "image/png", "image/webp"];
    const maxSize = 2 * 1024 * 1024;

    // Cek apakah project dengan slug yang diberikan ada
    const project = await getProjectBySlug(slug.toLowerCase());
    if (!project) {
      return next(createError(404, "Project not found!"));
    }

    // Generate slug baru hanya jika judul (title) berubah dari judul sebelumnya
    let newSlug = project.slug;
    if (title && title !== project.title) {
      newSlug = await generateUniqueSlug(title);
    }

    // Gunakan data gambar lama sebagai default
    let imageUrl = project.imageUrl;
    let imageId = project.image_pubic_id;

    // Jika ada file gambar baru dikirim
    if (image) {
      // Validasi format dan ukuran file gambar
      if (!allowedMime.includes(image.mimetype) || image.size > maxSize) {
        return next(createError(400, "Invalid image file! Must be JPG, JPEG, PNG, or WEBP under 2MB."));
      }

      // Hapus gambar lama dari Cloudinary jika ada
      if (imageId) await destroyFromCloudinary(imageId);

      // Upload gambar baru ke Cloudinary
      const uploadResult = await uploadToCloudinary(image, "project");
      imageUrl = uploadResult.secure_url;
      imageId = uploadResult.public_id;
    }

    // Buat data yang akan diupdate, gunakan nilai lama jika data baru tidak diberikan
    const updateData = {
      title: title ?? project.title,
      slug: newSlug,
      description: description ?? project.description,
      categoryProjectId: categoryProjectId ?? project.categoryProjectId,
      imageUrl,
      imageId,
      skillId: skillId ?? project.skills.map((skill) => skill.id),
      linkDemo: linkDemo ?? project.linkDemo,
      linkRepository: linkRepository ?? project.linkRepository,
    };

    // Proses update project di database
    const updatedProject = await update(
      updateData.title,
      project.slug,
      updateData.slug,
      updateData.description,
      updateData.categoryProjectId,
      updateData.imageUrl,
      updateData.imageId,
      updateData.skillId,
      updateData.linkDemo,
      updateData.linkRepository
    );

    // Kirim response berhasil ke client
    return res.status(200).json({
      success: true,
      error: false,
      message: "Update project successfully!.",
      data: updatedProject,
    });
  } catch (error) {
    // Tampilkan error di console dan kirim response error ke middleware error handler
    console.error(error);
    return next(createError(500, "Something went wrong!"));
  }
};

/**
 * Delete a project by its slug.
 *
 * This will remove the project from the database and also delete the associated image from Cloudinary.
 * It will first check if the project exists, then delete the image and the project.
 *
 * @route DELETE /api/projects/delete/:slug
 * @param {string} slug - Slug of the project to delete
 * @returns {200 OK} If deletion is successful
 * @returns {404 Not Found} If the project is not found
 * @returns {500 Internal Server Error} If an unexpected error occurs
 */
export const deleteProject = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { slug } = req.params;

    const project = await getProjectBySlug(slug);
    if (!project) {
      return next(createError(404, "Project not found!"));
    }

    await destroyFromCloudinary(project.image_pubic_id);
    await destroy(project.slug);

    return res.status(200).json({
      success: true,
      error: false,
      message: "Deleted project successfully!",
    });
  } catch (error) {
    console.error(error);
    return next(createError(500, "Something went wrong!"));
  }
};
