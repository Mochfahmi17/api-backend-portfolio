import db from "../lib/db";

export const allUser = async () => {
  try {
    const user = await db.user.findMany();

    return user;
  } catch (error) {
    throw error;
  }
};

export const getUserById = async (id: string) => {
  try {
    const user = await db.user.findUnique({ where: { id } });
    return user;
  } catch (error) {
    throw error;
  }
};

export const update = async (id: string, name: string, profileUrl: string | null, profile_public_id: string | null, myCVUrl: string | null, myCV_public_id: string | null) => {
  try {
    const updatedUser = await db.user.update({ where: { id }, data: { name, profileUrl, profile_public_id, myCVUrl, myCV_public_id } });
    return updatedUser;
  } catch (error) {
    throw error;
  }
};
