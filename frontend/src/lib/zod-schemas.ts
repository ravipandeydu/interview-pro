import { z, ZodTypeAny } from "zod";

// Authentication schemas
export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const registerSchema = z
  .object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Invalid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

export const resetPasswordSchema = z.object({
  email: z.string().email("Invalid email address"),
});

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

// User profile schemas
export const userProfileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  bio: z.string().max(500, "Bio must be less than 500 characters").optional(),
  avatar: z.string().url("Invalid avatar URL").optional(),
});

// Chat schemas
export const chatMessageSchema = z.object({
  question: z
    .string()
    .min(1, "Question cannot be empty")
    .max(1000, "Question must be less than 1000 characters"),
});

// API response schemas
export const apiErrorSchema = z.object({
  message: z.string(),
  code: z.string().optional(),
  details: z.any().optional(),
});

// Domain schemas
export const userSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string().email(),
  avatar: z.string().url().optional(),
  bio: z.string().optional(),
  role: z.enum(["USER", "ADMIN", "RECRUITER"]),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const sessionSchema = z.object({
  user: userSchema,
  token: z.string(),
  expiresAt: z.string(),
});

export const chatResponseSchema = z.object({
  id: z.string(),
  question: z.string(),
  answer: z.string(),
  timestamp: z.string(),
  metadata: z.record(z.any()).optional(),
});

export const summarySchema = z.object({
  id: z.string(),
  title: z.string(),
  content: z.string(),
  createdAt: z.string(),
  tags: z.array(z.string()).optional(),
});

// Generic API response wrapper
export const apiResponseSchema = <T extends ZodTypeAny>(dataSchema: T) =>
  z.object({
    status: z.literal("success"),
    message: z.string(),
    data: dataSchema,
  });

export type ApiResponse<T extends ZodTypeAny> = z.infer<
  ReturnType<typeof apiResponseSchema<T>>
>;

// Example API response schemas
export const sessionResponseSchema = apiResponseSchema(sessionSchema);
export type SessionResponse = ApiResponse<typeof sessionSchema>;

export const userResponseSchema = apiResponseSchema(userSchema);
export type UserResponse = ApiResponse<typeof userSchema>;

export const chatApiResponseSchema = apiResponseSchema(chatResponseSchema);
export type ChatApiResponse = ApiResponse<typeof chatResponseSchema>;

export const summariesArraySchema = z.array(summarySchema);
export const summariesResponseSchema = apiResponseSchema(summariesArraySchema);
export type SummariesResponse = ApiResponse<typeof summariesArraySchema>;

// Type exports
export type LoginFormData = z.infer<typeof loginSchema>;
export type RegisterFormData = z.infer<typeof registerSchema>;
export type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;
export type ChangePasswordFormData = z.infer<typeof changePasswordSchema>;
export type UserProfileFormData = z.infer<typeof userProfileSchema>;
export type ChatMessageFormData = z.infer<typeof chatMessageSchema>;
export type User = z.infer<typeof userSchema>;
export type Session = z.infer<typeof sessionSchema>;
export type VerificationResponse = {
  message: string;
  data?: {
    message: string;
  };
};
export type ChatResponse = z.infer<typeof chatResponseSchema>;
export type Summary = z.infer<typeof summarySchema>;
export type ApiError = z.infer<typeof apiErrorSchema>;
