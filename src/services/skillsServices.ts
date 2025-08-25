import db from "../lib/db";

export const allSkills = async () => {
  try {
    const skills = await db.skill.findMany({ include: { experienceLevel: true }, orderBy: { name: "asc" } });
    return skills;
  } catch (error) {
    throw error;
  }
};

export const getSkillById = async (id: string) => {
  try {
    const skill = await db.skill.findUnique({ where: { id } });
    return skill;
  } catch (error) {
    throw error;
  }
};

export const store = async (name: string, levelId: string, iconUrl: string, iconPublicId: string) => {
  try {
    const skill = await db.skill.create({
      data: {
        name,
        levelId,
        iconUrl,
        icon_public_id: iconPublicId,
      },
      include: { experienceLevel: true },
    });

    return skill;
  } catch (error) {
    throw error;
  }
};

export const update = async (id: string, name: string, levelId: string, iconUrl: string, icon_public_id: string) => {
  try {
    const updatedSkill = await db.skill.update({ where: { id }, data: { name, levelId, iconUrl, icon_public_id } });

    return updatedSkill;
  } catch (error) {
    throw error;
  }
};

export const destroy = async (id: string) => {
  try {
    const deletedSkill = await db.skill.delete({ where: { id } });
    return deletedSkill;
  } catch (error) {
    throw error;
  }
};
