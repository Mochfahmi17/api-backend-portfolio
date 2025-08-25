import db from "../lib/db";

export const allCategories = async () => {
  try {
    const categories = await db.categoryProject.findMany();

    return categories;
  } catch (error) {
    throw error;
  }
};

export const getCategoryById = async (id: string) => {
  try {
    const category = await db.categoryProject.findUnique({ where: { id } });

    return category;
  } catch (error) {
    throw error;
  }
};

export const store = async (name: string) => {
  try {
    const category = await db.categoryProject.create({ data: { name } });
    return category;
  } catch (error) {
    throw error;
  }
};

export const update = async (id: string, name: string) => {
  try {
    const category = await db.categoryProject.update({ where: { id }, data: { name } });

    return category;
  } catch (error) {
    throw error;
  }
};

export const destroy = async (id: string) => {
  try {
    const category = await db.categoryProject.delete({ where: { id } });
    return category;
  } catch (error) {
    throw error;
  }
};
