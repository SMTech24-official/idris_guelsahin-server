import { z } from "zod";

 const PlanSchema = z.object({
    body: z.object({
        name: z.string(),
    }),
});

const UpdatePlanSchema = z.object({
    body: z.object({
        name: z.string(),
    }),
});
export const PlanValidation = {
     PlanSchema,
     UpdatePlanSchema
};
