import { object, string } from "zod";

export const skillSchema = object({
  name: string().min(1, "Name is required"),
  levelId: string().min(1, "Skill is required"),
});

export const skillEditSchema = object({
  name: string().min(1, "Name is required").optional(),
  levelId: string().min(1, "Skill is required").optional(),
});
