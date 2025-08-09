import { z } from "zod";

const ProductSchema = z.object({
  body: z.object({
    categoryId: z.string(),
    name: z.string(),
    location: z.string(),
    details: z.object({
      purchasePrice: z.number().optional(),
    }),
    description: z.string(),
    websiteUrl: z.string(),
    instragramUrl: z.string(),
    facebookUrl: z.string(),
    image: z.string().optional(),
  }),
});

const UpdateProductSchema = z.object({
  body: z.object({
    categoryId: z.string().optional(),
    name: z.string().optional(),
    location: z.string().optional(),
    purchasePrice: z.number().optional(),
    companyAssests: z.string().optional(),
    description: z.string().optional(),
    websiteUrl: z.string().optional(),
    instragramUrl: z.string().optional(),
    facebookUrl: z.string().optional(),
    image: z.string().optional(),
  }),
});

export const ProductValidation = {
  ProductSchema,
  UpdateProductSchema,
};
