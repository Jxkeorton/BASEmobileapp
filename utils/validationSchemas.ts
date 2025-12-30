import { z } from "zod";

/**
 * Validation Schemas for Forms
 * Using Zod for runtime type-safe validation with react-hook-form
 */

// ============================================================================
// Authentication Schemas
// ============================================================================

/**
 * Login Form Schema
 */
export const loginSchema = z.object({
  email: z
    .string()
    .min(1, "Email is required")
    .email("Please enter a valid email address")
    .trim()
    .toLowerCase(),
  password: z.string().min(1, "Password is required"),
});

export type LoginFormData = z.infer<typeof loginSchema>;

/**
 * Registration Form Schema
 */
export const registerSchema = z.object({
  name: z
    .string()
    .min(1, "Name is required")
    .max(100, "Name must be less than 100 characters")
    .trim(),
  email: z
    .string()
    .min(1, "Email is required")
    .email("Please enter a valid email address")
    .trim()
    .toLowerCase(),
  password: z
    .string()
    .min(6, "Password must be at least 6 characters")
    .max(100, "Password must be less than 100 characters"),
  termsAccepted: z
    .boolean()
    .refine((val) => val === true, "You must accept the terms and conditions"),
});

export type RegisterFormData = z.infer<typeof registerSchema>;

/**
 * Reset Password Form Schema
 */
export const resetPasswordSchema = z.object({
  email: z
    .string()
    .min(1, "Email is required")
    .email("Please enter a valid email address")
    .trim()
    .toLowerCase(),
});

export type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;

/**
 * Reset Password Confirmation Form Schema
 */
export const resetPasswordConfirmSchema = z
  .object({
    newPassword: z
      .string()
      .min(6, "Password must be at least 6 characters")
      .max(100, "Password must be less than 100 characters"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export type ResetPasswordConfirmFormData = z.infer<
  typeof resetPasswordConfirmSchema
>;

// ============================================================================
// Profile Schemas
// ============================================================================

/**
 * Edit Profile Form Schema
 */
export const editProfileSchema = z.object({
  name: z
    .string()
    .min(1, "Name is required")
    .max(100, "Name must be less than 100 characters")
    .trim(),
  email: z
    .string()
    .email("Please enter a valid email address")
    .trim()
    .toLowerCase(),
  username: z
    .string()
    .min(3, "Username must be at least 3 characters")
    .max(30, "Username must be less than 30 characters")
    .regex(
      /^[a-zA-Z0-9_-]+$/,
      "Username can only contain letters, numbers, underscores, and hyphens",
    )
    .trim()
    .optional()
    .or(z.literal("")),
  jump_number: z
    .string()
    .regex(/^\d+$/, "Jump number must be a valid number")
    .transform((val) => parseInt(val, 10))
    .pipe(z.number().min(0, "Jump number cannot be negative"))
    .or(z.number().min(0)),
});

export type EditProfileFormData = z.infer<typeof editProfileSchema>;

// ============================================================================
// Location Submission Schemas
// ============================================================================

/**
 * Cliff aspect validation
 */
const cliffAspectValues = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"] as const;

/**
 * Submit Location Form Schema
 */
export const submitLocationSchema = z.object({
  exitName: z
    .string()
    .min(1, "Exit name is required")
    .max(200, "Exit name must be less than 200 characters")
    .trim(),
  country: z
    .string()
    .max(100, "Country name must be less than 100 characters")
    .trim()
    .optional(),
  coordinates: z
    .string()
    .min(1, "Coordinates are required")
    .refine(
      (val) => {
        const coords = val.replace(/[^\d.,-]/g, "").split(",");
        if (coords.length !== 2) return false;
        const lat = coords[0] ? parseFloat(coords[0].trim()) : NaN;
        const lng = coords[1] ? parseFloat(coords[1].trim()) : NaN;
        return (
          !isNaN(lat) &&
          !isNaN(lng) &&
          lat >= -90 &&
          lat <= 90 &&
          lng >= -180 &&
          lng <= 180
        );
      },
      {
        message:
          "Invalid coordinates. Use format: latitude, longitude (e.g., 60.140582, -2.111822)",
      },
    ),
  rockDrop: z
    .string()
    .min(1, "Rock drop is required")
    .regex(/^\d+(\.\d+)?$/, "Rock drop must be a valid number"),
  total: z
    .string()
    .regex(/^\d+(\.\d+)?$/, "Total height must be a valid number")
    .optional()
    .or(z.literal("")),
  cliffAspect: z
    .enum(cliffAspectValues, {
      message: "Cliff aspect must be one of: N, NE, E, SE, S, SW, W, NW",
    })
    .optional()
    .or(z.literal("")),
  anchor: z
    .string()
    .max(500, "Anchor info must be less than 500 characters")
    .optional(),
  access: z
    .string()
    .max(1000, "Access info must be less than 1000 characters")
    .optional(),
  notes: z
    .string()
    .max(1000, "Notes must be less than 1000 characters")
    .optional(),
  openedBy: z
    .string()
    .max(100, "Opened by must be less than 100 characters")
    .optional(),
  openedDate: z.string().optional(),
  videoLink: z
    .string()
    .url("Video link must be a valid URL")
    .optional()
    .or(z.literal("")),
  selectedUnit: z.enum(["Meters", "Feet"]),
});

export type SubmitLocationFormData = z.infer<typeof submitLocationSchema>;

/**
 * Submit Details Modal Schema (similar to location but for updates)
 */
export const submitDetailsSchema = z.object({
  newLocationName: z
    .string()
    .max(200, "Location name must be less than 200 characters")
    .trim()
    .optional(),
  exitType: z
    .string()
    .max(50, "Exit type must be less than 50 characters")
    .optional(),
  rockDropHeight: z
    .string()
    .regex(/^\d+(\.\d+)?$/, "Rock drop must be a valid number")
    .optional()
    .or(z.literal("")),
  totalHeight: z
    .string()
    .regex(/^\d+(\.\d+)?$/, "Total height must be a valid number")
    .optional()
    .or(z.literal("")),
  cliffAspect: z
    .enum(cliffAspectValues, {
      message: "Cliff aspect must be one of: N, NE, E, SE, S, SW, W, NW",
    })
    .optional()
    .or(z.literal("")),
  anchorInfo: z
    .string()
    .max(500, "Anchor info must be less than 500 characters")
    .optional(),
  accessInfo: z
    .string()
    .max(1000, "Access info must be less than 1000 characters")
    .optional(),
  notes: z
    .string()
    .max(1000, "Notes must be less than 1000 characters")
    .optional(),
  openedByName: z
    .string()
    .max(100, "Opened by must be less than 100 characters")
    .optional(),
  openedDate: z.string().optional(),
});

export type SubmitDetailsFormData = z.infer<typeof submitDetailsSchema>;

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Parse coordinates string to object
 */
export const parseCoordinates = (coordsString: string) => {
  if (!coordsString) return null;

  const coords = coordsString.replace(/[^\d.,-]/g, "").split(",");
  if (coords.length !== 2) return null;

  const lat = coords[0] ? parseFloat(coords[0].trim()) : NaN;
  const lng = coords[1] ? parseFloat(coords[1].trim()) : NaN;

  if (isNaN(lat) || isNaN(lng)) return null;
  if (lat < -90 || lat > 90 || lng < -180 || lng > 180) return null;

  return { latitude: lat, longitude: lng };
};
