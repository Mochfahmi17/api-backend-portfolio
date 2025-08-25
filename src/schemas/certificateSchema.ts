import { object, string } from "zod";

export const certificateSchema = object({
  title: string().min(1, "Title is required"),
});
export const certificateEditSchema = object({
  title: string().min(1, "Title is required").optional(),
});
