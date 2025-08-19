import { ZodError } from "zod";

// DO NOT CHANGE - shared type from API
export type ErrorResponse = {
  success: false;
  error: string;
  details?: ZodError["issues"] | string;
};
