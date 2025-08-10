import { z } from "zod";

 const SubscriptionSchema = z.object({
    body: z.object({
        planId: z.string(),
    }),
});

const UpdateSubscriptionSchema = z.object({
    body: z.object({
        name: z.string(),
    }),
});
export const SubscriptionValidation = {
     SubscriptionSchema,
     UpdateSubscriptionSchema
};
