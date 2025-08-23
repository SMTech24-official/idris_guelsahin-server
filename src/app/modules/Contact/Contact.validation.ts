import { z } from "zod";

 const ContactSchema = z.object({
    body: z.object({
        name: z.string(),
    }),
});

const UpdateContactSchema = z.object({
    body: z.object({
        name: z.string(),
    }),
});
export const ContactValidation = {
     ContactSchema,
     UpdateContactSchema
};
