import { z } from "zod";

const CategorySchema = z.object({
  body: z.object({
    name: z.string(),
    description: z.string().optional(),
    details: z.array(z.string()).optional(),
    isActive: z.boolean().optional(),
  }),
});

const UpdateCategorySchema = z.object({
  body: z.object({
    name: z.string().optional(),
    description: z.string().optional(),
    details: z.array(z.string()).optional(),
    isActive: z.boolean().optional(),
  }),
});
export const CategoryValidation = {
  CategorySchema,
  UpdateCategorySchema,
};
