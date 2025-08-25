import { Prisma } from "@prisma/client";
import db from "../lib/db";

export const allProjects = async (skip: number, take: number, categoryName?: string) => {
  try {
    const whereClause: Prisma.ProjectWhereInput = categoryName ? { categoryProject: { name: categoryName } } : {};
    const projects = await db.project.findMany({ skip, take, where: whereClause, include: { categoryProject: true, skills: true }, orderBy: { createdAt: "desc" } });
    const totalProjects = await db.project.count();

    return { projects, totalProjects };
  } catch (error) {
    throw error;
  }
};

export const getProjectBySlug = async (slug: string) => {
  try {
    const project = await db.project.findUnique({ where: { slug }, include: { categoryProject: true, skills: true } });

    return project;
  } catch (error) {
    throw error;
  }
};

export const store = async (title: string, slug: string, description: string, categoryProjectId: string, imageUrl: string, publicId: string, skillId: string[], linkDemo: string, linkRepository: string) => {
  try {
    const project = await db.project.create({
      data: {
        title,
        slug,
        description,
        categoryProjectId,
        imageUrl,
        image_pubic_id: publicId,
        skills: {
          connect: skillId.map((id) => {
            return { id };
          }),
        },
        linkDemo,
        linkRepository,
      },
      include: {
        skills: true,
        categoryProject: true,
      },
    });

    return project;
  } catch (error) {
    throw error;
  }
};

export const update = async (title: string, oldSlug: string, slug: string, description: string, categoryProjectId: string, imageUrl: string, imageId: string, skillId: string[], linkDemo: string, linkRepository: string) => {
  try {
    const updatedProject = await db.project.update({
      where: { slug: oldSlug },
      data: {
        title,
        slug,
        description,
        categoryProjectId,
        imageUrl,
        image_pubic_id: imageId,
        skills: {
          set: skillId.map((id: string) => ({ id })),
        },
        linkDemo,
        linkRepository,
      },
      include: { categoryProject: true, skills: true },
    });

    return updatedProject;
  } catch (error) {
    throw error;
  }
};

export const destroy = async (slug: string) => {
  try {
    await db.project.update({ where: { slug }, data: { skills: { set: [] } } });

    const project = await db.project.delete({ where: { slug } });
    return project;
  } catch (error) {
    throw error;
  }
};
