import { array, cuid, object, preprocess, string } from "zod";

export const projectSchema = object({
  title: string().min(1, "Title is required"),
  description: string().min(10, "Description must be at least 10 characters"),
  categoryProjectId: string().min(1, "Category Project required"),
  skillId: preprocess((val) => {
    // Jika input adalah string, pecah string tersebut
    if (typeof val === "string") {
      return val.split(",").map((item) => item.trim());
    }

    // Jika sudah array (atau tipe lain), biarkan saja
    return val;
  }, array(cuid().nonempty("Skill must not be empty!")).min(1)),
  linkDemo: string().min(1, "Link demo is required.").optional(),
  linkRepository: string().min(1, "Link repository is required.").optional(),
});

export const projectEditSchema = object({
  title: string().min(1, "title is requrired").optional(),
  description: string().min(1, "Description is required").optional(),
  categoryProjectId: string().optional(),
  skillId: preprocess((val) => {
    // Jika input adalah string, pecah string tersebut
    if (typeof val === "string") {
      return val.split(",").map((item) => item.trim());
    }

    // Jika sudah array (atau tipe lain), biarkan saja
    return val;
  }, array(cuid().nonempty("Skill must not be empty!"))).optional(),
  linkDemo: string().min(1, "Link demo is required.").optional(),
  linkRepository: string().min(1, "Link repository is required.").optional(),
});
