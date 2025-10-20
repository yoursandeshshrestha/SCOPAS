import { z } from "zod";

/**
 * Common validation schemas for reusability
 */

export const paginationQuerySchema = z.object({
  page: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val, 10) : 1))
    .refine((val) => val > 0, { message: "Page must be greater than 0" }),
  limit: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val, 10) : 10))
    .refine((val) => val > 0 && val <= 100, {
      message: "Limit must be between 1 and 100",
    }),
});

export const searchQuerySchema = z.object({
  search: z.string().min(1).optional(),
});

export const idParamSchema = z.object({
  id: z.string().min(1, "ID is required"),
});

export const letterQuerySchema = z.object({
  letter: z
    .string()
    .length(1, "Letter must be a single character")
    .regex(/^[a-zA-Z]$/, "Letter must be alphabetic")
    .optional(),
});

/**
 * Combined schemas for common use cases
 */
export const paginatedSearchQuerySchema = paginationQuerySchema.merge(
  searchQuerySchema
);

export const storeQuerySchema = paginationQuerySchema
  .merge(searchQuerySchema)
  .merge(letterQuerySchema);

