import { email, object, string } from "zod";

export const contactSchema = object({
  name: string().min(1, "Name is required"),
  email: email("Invalid email address"),
  message: string().min(10, "Message must be at least 10 characters"),
});
