import { z } from "zod";

 const CategorySchema = z.object({
    body: z.object({
        name: z.string(),
    }),
});

const UpdateCategorySchema = z.object({
    body: z.object({
        name: z.string(),
    }),
});
export const CategoryValidation = {
     CategorySchema,
     UpdateCategorySchema
};
