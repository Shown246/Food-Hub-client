import { z } from "zod";

export const passwordSchema = z
  .string()
  .min(1, "Password is required")
  .min(8, "Password must be at least 8 characters long")
  .max(128, "Password must be at most 128 characters long")
  .refine((val) => /[A-Z]/.test(val), { message: "Password must contain at least one uppercase letter" })
  .refine((val) => /[a-z]/.test(val), { message: "Password must contain at least one lowercase letter" })
  .refine((val) => /[0-9]/.test(val), { message: "Password must contain at least one number" });

export const loginZodSchema = z.object({
  email: z.email("Invalid email address"),
  password: z.string()
    .min(1, "Password is required")
    .min(8, "Password must be at least 8 characters long")
});

export type IloginPayload = z.infer<typeof loginZodSchema>;

export const customerSignupZodSchema = z.object({
  fullName: z.string().min(1, "Full name is required").max(100, "Full name is too long"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(1, "Phone number is required"),
  password: passwordSchema,
  confirmPassword: z.string().min(1, "Please confirm your password"),
  role: z.literal("CUSTOMER"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

export type ICustomerSignupInput = z.infer<typeof customerSignupZodSchema>;

export const providerSignupZodSchema = z.object({
  fullName: z.string().min(1, "Full name is required").max(100, "Full name is too long"),
  email: z.email("Invalid email address"),
  phone: z.string().min(1, "Phone number is required"),
  password: passwordSchema,
  confirmPassword: z.string().min(1, "Please confirm your password"),
  role: z.literal("PROVIDER"),
  providerName: z.string().min(1, "Provider/Restaurant name is required"),
  providerDescription: z.string().min(1, "Provider description is required"),
  providerAddress: z.string().min(1, "Provider address is required"),
  providerPhone: z.string().min(1, "Provider phone is required"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

export type IProviderSignupInput = z.infer<typeof providerSignupZodSchema>;

export const signupZodSchema = z.discriminatedUnion("role", [
  customerSignupZodSchema,
  providerSignupZodSchema,
]);

export type ISignupInput = z.infer<typeof signupZodSchema>;

export interface ICustomerSignupApiPayload {
  fullName: string;
  email: string;
  phone: string;
  password: string;
  role: "CUSTOMER";
}

export interface IProviderSignupApiPayload {
  fullName: string;
  email: string;
  phone: string;
  password: string;
  role: "PROVIDER";
  providerName: string;
  providerDescription: string;
  providerAddress: string;
  providerPhone: string;
}

export type ISignupApiPayload = ICustomerSignupApiPayload | IProviderSignupApiPayload;