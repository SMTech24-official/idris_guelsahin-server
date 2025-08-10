import { PlanDuration } from "@prisma/client";
import { z } from "zod";

 const PlanSchema = z.object({
    body: z.object({
        name: z.string(),
        price: z.number(),
        currency: z.string().optional(),
        duration: z.nativeEnum(PlanDuration),
        colorTheme: z.string(),
        description: z.string(),
        features: z.array(z.string()),
    }),
});

const UpdatePlanSchema = z.object({
  body: z.object({
    name: z.string().optional(),
    price: z.number().optional(),
    currency: z.string().optional(),
    duration: z.nativeEnum(PlanDuration).optional(),
    colorTheme: z.string().optional(),
    description: z.string().optional(),
    features: z.array(z.string()).optional(),
  }),
});
export const PlanValidation = {
     PlanSchema,
     UpdatePlanSchema
};
