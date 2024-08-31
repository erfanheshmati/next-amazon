import * as z from "zod";

// USER
export const signInFormSchema = z.object({
  email: z.string().email().min(3, "Email must be at least 3 characters"),
  password: z.string().min(4, "Password must be at least 4 characters"),
});
