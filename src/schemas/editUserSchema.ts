import { object, string } from "zod";

export const editUserSchema = object({
  name: string().min(1, "Name is required").optional(),
});
