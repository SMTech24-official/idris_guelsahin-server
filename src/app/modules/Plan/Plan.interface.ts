import { PlanDuration } from "@prisma/client";

export type TPlan = {
  readonly id: string;
  name: string;
  price: number;
  currency: string;
  duration: PlanDuration;
  colorTheme: string;
  description: string;
  features: string[];
  stripePriceId?: string;
  stripeProductId?: string;
  isActive: boolean;
};
