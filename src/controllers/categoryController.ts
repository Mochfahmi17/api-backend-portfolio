import { NextFunction, Request, Response } from "express";
import { allCategories, destroy, getCategoryById, store, update } from "../services/categoryService";
import createError from "http-errors";

/**
 * Get all categories from the database.
 *
 * @route GET /api/categories
 * @returns {200 OK} List of categories
 * @returns {200 OK} If no categories are found (empty array)
 * @returns {500 Internal Server Error} If something goes wrong
 */
export const getAllCategories = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const categories = await allCategories();

    return res.status(200).json({
      success: true,
      error: false,
      data: categories,
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
 * Create a new category.
 *
 * @route POST /api/categories/create
 * @param {string} name - Category name from request body
 * @returns {201 Created} Category created successfully
 * @returns {500 Internal Server Error} If something goes wrong
 */
export const createCategory = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name } = req.body;

    const category = await store(name);

    return res.status(201).json({
      success: true,
      error: false,
      data: category,
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
 * Edit an existing category by ID.
 *
 * @route PUT /api/categories/edit/:id
 * @param {string} id - Category ID from route params
 * @param {string} name - Updated category name from request body (optional)
 * @returns {200 OK} Category updated successfully
 * @returns {400 Bad Request} If category not found
 * @returns {500 Internal Server Error} If something goes wrong
 */
export const editCategory = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { name } = req.body;

    const category = await getCategoryById(id);

    if (!category) {
      return next(createError(400, "Category not found!"));
    }

    const updateData = {
      name: name ?? category.name,
    };

    const updatedCategory = await update(category.id, updateData.name);

    return res.status(200).json({
      success: true,
      error: false,
      message: "Update category successfully!",
      data: updatedCategory,
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
 * Delete a category by ID.
 *
 * @route DELETE /api/categories/delete/:id
 * @param {string} id - Category ID from route params
 * @returns {200 OK} Category deleted successfully
 * @returns {404 Not Found} If category does not exist
 * @returns {500 Internal Server Error} If something goes wrong
 */
export const deleteCategory = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    const category = await getCategoryById(id);
    if (!category) {
      return next(createError(404, "Category not found!"));
    }

    await destroy(category.id);

    return res.status(200).json({
      success: true,
      error: false,
      message: "Deleted category successfully!",
    });
  } catch (error) {
    console.error(error);
    if (error instanceof Error) {
      return next(createError(500, "Something went wrong!"));
    }

    throw error;
  }
};
