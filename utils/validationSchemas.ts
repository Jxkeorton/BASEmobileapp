import * as yup from "yup";

/**
 * Validation Schemas for Forms
 * Using Yup for runtime type-safe validation with react-hook-form
 */

// ============================================================================
// Authentication Schemas
// ============================================================================

/**
 * Login Form Schema
 */
export const loginSchema = yup.object({
  email: yup
    .string()
    .email("Please enter a valid email address")
    .trim()
    .lowercase()
    .required("Email is required"),
  password: yup.string().required("Password is required"),
});

export type LoginFormData = yup.InferType<typeof loginSchema>;

/**
 * Registration Form Schema
 */
export const registerSchema = yup.object({
  name: yup
    .string()
    .required("Name is required")
    .max(100, "Name must be less than 100 characters")
    .trim(),
  email: yup
    .string()
    .email("Please enter a valid email address")
    .trim()
    .lowercase()
    .required("Email is required"),
  password: yup
    .string()
    .required("Password is required")
    .min(6, "Password must be at least 6 characters")
    .max(100, "Password must be less than 100 characters"),
  termsAccepted: yup
    .boolean()
    .oneOf([true], "You must accept the terms and conditions")
    .required(),
});

export type RegisterFormData = yup.InferType<typeof registerSchema>;

/**
 * Reset Password Form Schema
 */
export const resetPasswordSchema = yup.object({
  email: yup
    .string()
    .email("Please enter a valid email address")
    .trim()
    .lowercase()
    .required("Email is required"),
});

export type ResetPasswordFormData = yup.InferType<typeof resetPasswordSchema>;

/**
 * Reset Password Confirmation Form Schema
 */
export const resetPasswordConfirmSchema = yup.object({
  newPassword: yup
    .string()
    .required("Password is required")
    .min(6, "Password must be at least 6 characters")
    .max(100, "Password must be less than 100 characters"),
  confirmPassword: yup
    .string()
    .required("Please confirm your password")
    .oneOf([yup.ref("newPassword")], "Passwords do not match"),
});

export type ResetPasswordConfirmFormData = yup.InferType<
  typeof resetPasswordConfirmSchema
>;

// ============================================================================
// Profile Schemas
// ============================================================================

/**
 * Edit Profile Form Schema
 */
export const editProfileSchema = yup.object({
  name: yup
    .string()
    .required("Name is required")
    .max(100, "Name must be less than 100 characters")
    .trim(),
  email: yup
    .string()
    .email("Please enter a valid email address")
    .trim()
    .lowercase()
    .required("Email is required"),
  username: yup
    .string()
    .min(3, "Username must be at least 3 characters")
    .max(30, "Username must be less than 30 characters")
    .matches(
      /^[a-zA-Z0-9_-]+$/,
      "Username can only contain letters, numbers, underscores, and hyphens",
    )
    .trim()
    .notRequired(),
  jump_number: yup
    .number()
    .transform((value, originalValue) => {
      // Handle empty string or undefined
      if (originalValue === "" || originalValue === undefined) return undefined;
      // Transform string to number
      return typeof originalValue === "string"
        ? parseInt(originalValue, 10)
        : value;
    })
    .min(0, "Jump number cannot be negative")
    .notRequired(),
});

// Explicitly define the type with proper optional fields
// Note: jump_number is string in the form (TextInput), but Yup transform converts it to number
export type EditProfileFormData = {
  name: string;
  email: string;
  username?: string;
  jump_number?: string | number;
};
// // ============================================================================
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
export const submitLocationSchema = yup.object({
  exitName: yup
    .string()
    .required("Exit name is required")
    .max(200, "Exit name must be less than 200 characters")
    .trim(),
  country: yup
    .string()
    .max(100, "Country name must be less than 100 characters")
    .trim()
    .notRequired(),
  coordinates: yup
    .string()
    .required("Coordinates are required")
    .test(
      "is-valid-coordinates",
      "Invalid coordinates. Use format: latitude, longitude (e.g., 60.140582, -2.111822)",
      (val) => {
        if (!val) return false;
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
    ),
  rockDrop: yup
    .string()
    .required("Rock drop is required")
    .matches(/^\d+(\.\d+)?$/, "Rock drop must be a valid number"),
  total: yup
    .string()
    .matches(/^\d+(\.\d+)?$/, "Total height must be a valid number")
    .notRequired(),
  cliffAspect: yup
    .string()
    .oneOf(
      [...cliffAspectValues, ""],
      "Cliff aspect must be one of: N, NE, E, SE, S, SW, W, NW",
    )
    .notRequired(),
  anchor: yup
    .string()
    .max(500, "Anchor info must be less than 500 characters")
    .notRequired(),
  access: yup
    .string()
    .max(1000, "Access info must be less than 1000 characters")
    .notRequired(),
  notes: yup
    .string()
    .max(1000, "Notes must be less than 1000 characters")
    .notRequired(),
  openedBy: yup
    .string()
    .max(100, "Opened by must be less than 100 characters")
    .notRequired(),
  openedDate: yup.string().notRequired(),
  videoLink: yup.string().url("Video link must be a valid URL").notRequired(),
  selectedUnit: yup
    .string()
    .oneOf(["Meters", "Feet"])
    .required("Unit selection is required"),
});

export type SubmitLocationFormData = yup.InferType<typeof submitLocationSchema>;
/**
 * Submit Details Modal Schema (similar to location but for updates)
 */
export const submitDetailsSchema = yup.object({
  newLocationName: yup
    .string()
    .max(200, "Location name must be less than 200 characters")
    .trim()
    .notRequired(),
  exitType: yup
    .string()
    .max(50, "Exit type must be less than 50 characters")
    .notRequired(),
  rockDropHeight: yup
    .string()
    .matches(/^\d+(\.\d+)?$/, "Rock drop must be a valid number")
    .notRequired(),
  totalHeight: yup
    .string()
    .matches(/^\d+(\.\d+)?$/, "Total height must be a valid number")
    .notRequired(),
  cliffAspect: yup
    .string()
    .oneOf(
      [...cliffAspectValues, ""],
      "Cliff aspect must be one of: N, NE, E, SE, S, SW, W, NW",
    )
    .notRequired(),
  anchorInfo: yup
    .string()
    .max(500, "Anchor info must be less than 500 characters")
    .notRequired(),
  accessInfo: yup
    .string()
    .max(1000, "Access info must be less than 1000 characters")
    .notRequired(),
  notes: yup
    .string()
    .max(1000, "Notes must be less than 1000 characters")
    .notRequired(),
  openedByName: yup
    .string()
    .max(100, "Opened by must be less than 100 characters")
    .notRequired(),
  openedDate: yup.string().notRequired(),
});

export type SubmitDetailsFormData = yup.InferType<typeof submitDetailsSchema>;

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
