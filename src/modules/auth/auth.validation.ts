import { z } from "zod";

// Register Validation
export const registerSchema = z.object({
  name: z
    .string()
    .min(2, "Name must contain at least 2 characters")
    .max(100),

  email: z
    .string()
    .email("Invalid email address")
    .transform((value) =>
      value.toLowerCase().trim()
    ),

  password: z
    .string()
    .min(8, "Password must contain at least 8 characters")
    .max(100),

  organizationName: z
    .string()
    .min(2, "Organization name is required")
    .max(100),
});

// Login Validation
export const loginSchema = z.object({
  email: z
    .string()
    .email("Invalid email address")
    .transform((value) =>
      value.toLowerCase().trim()
    ),

  password: z
    .string()
    .min(1, "Password is required"),
});

// Refresh Validation
export const refreshSchema = z.object({
  refreshToken: z
    .string()
    .min(1, "Refresh token is required"),
});

// Logout Validation
export const logoutSchema = z.object({
  refreshToken: z
    .string()
    .min(1, "Refresh token is required"),
});