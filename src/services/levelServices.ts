import db from "../lib/db";

export const allLevels = async () => {
  try {
    const levels = await db.level.findMany();

    return levels;
  } catch (error) {
    throw error;
  }
};
