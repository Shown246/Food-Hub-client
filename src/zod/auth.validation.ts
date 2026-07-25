import {z} from "zod";

export const loginZodSchema = z.object({
  email: z.email("Invalid email address"),
  password: z.string()
    .min(1, "Password is required")
    .min(8, "Password must be at least 8 characters long")
});

export type IloginPayload = z.infer<typeof loginZodSchema>;