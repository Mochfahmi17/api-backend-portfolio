import { email, object, string } from "zod";

export const loginSchema = object({
  email: email("Invalid email address"),
  password: string().min(1, "Password is required"),
});
