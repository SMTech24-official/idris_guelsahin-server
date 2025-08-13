import { z } from "zod";

 const MessageSchema = z.object({
    body: z.object({
        name: z.string(),
    }),
});

const UpdateMessageSchema = z.object({
    body: z.object({
        name: z.string(),
    }),
});
export const MessageValidation = {
     MessageSchema,
     UpdateMessageSchema
};
