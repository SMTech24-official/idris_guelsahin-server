import prisma from "../../../shared/prisma";
import QueryBuilder from "../../../helpars/queryBuilder";
import ApiError from "../../../errors/ApiErrors";
import httpStatus from "http-status";
import stripe from "../../../helpars/stripe";
import { TPlan } from "./Plan.interface";
import { PlanDuration } from "@prisma/client";

const createPlan = async (data: TPlan) => {
  // 1) Create Product in Stripe
  const product = await stripe.products.create({ name: data.name });

  // 2) Create Price in Stripe (recurring)
  const priceObj = await stripe.prices.create({
    unit_amount: Math.round(data.price * 100),
    currency: data.currency || "usd",
    recurring: {
      interval:
        data.duration === PlanDuration.WEEKLY
          ? "week"
          : data.duration === PlanDuration.MONTHLY
          ? "month"
          : "year",
    },
    product: product.id,
  });

  try {
    // 3) Save in DB
    const plan = await prisma.plan.create({
      data: {
        name: data.name,
        price: data.price,
        currency: data.currency || "usd",
        duration: data.duration,
        colorTheme: data.colorTheme,
        description: data.description,
        features: data.features,
        stripePriceId: priceObj.id,
        stripeProductId: product.id,
      },
    });

    return plan;
  } catch (error) {
    await stripe.prices
      .update(priceObj.id, { active: false })
      .catch(() => null);
    await stripe.products.del(product.id).catch(() => null);
    throw error;
  }
};

const getAllPlans = async (query: Record<string, any>) => {
  const queryBuilder = new QueryBuilder(prisma.plan, query);
  const plans = await queryBuilder
    .search([""])
    .filter()
    .sort()
    .paginate()
    .fields()
    .execute();

  const meta = await queryBuilder.countTotal();
  return { meta, data: plans };
};

const getSinglePlan = async (id: string) => {
  const result = await prisma.plan.findUnique({ where: { id } });
  if (!result) {
    throw new ApiError(httpStatus.NOT_FOUND, "Plan not found..!!");
  }
  return result;
};

const updatePlan = async (id: string, data: TPlan) => {
  const existingPlan = await prisma.plan.findUnique({ where: { id } });
  if (!existingPlan) {
    throw new ApiError(httpStatus.NOT_FOUND, "Plan not found..!!");
  }
  let updatedStripeProductId = existingPlan.stripeProductId;
  let updatedStripePriceId = existingPlan.stripePriceId;

  // If price-related fields change, create new price in Stripe
  const priceChanged =
    (data.price !== undefined && data.price !== existingPlan.price) ||
    (data.currency !== undefined && data.currency !== existingPlan.currency) ||
    (data.duration !== undefined && data.duration !== existingPlan.duration);

  if (priceChanged) {
    // Deactivate old price
    if (existingPlan.stripePriceId) {
      const re = await stripe.prices.update(existingPlan.stripePriceId, {
        active: false,
      });
    }

    // Create new price (Stripe doesn't allow price updates)
    const newPrice = await stripe.prices.create({
      unit_amount: Math.round((data.price ?? existingPlan.price) * 100),
      currency: data.currency ?? existingPlan.currency,
      recurring: {
        interval:
          (data.duration ?? existingPlan.duration) === PlanDuration.WEEKLY
            ? "week"
            : (data.duration ?? existingPlan.duration) === PlanDuration.MONTHLY
            ? "month"
            : "year",
      },
      product: existingPlan.stripeProductId!,
    });

    updatedStripePriceId = newPrice.id;
  }

  // Update product name in Stripe if changed
  if (
    data.name &&
    data.name !== existingPlan.name &&
    existingPlan.stripeProductId
  ) {
    await stripe.products
      .update(existingPlan.stripeProductId, {
        name: data.name,
      })
      .catch(() => null);
  }

  // Update in database
  const updatedPlan = await prisma.plan.update({
    where: { id },
    data: {
      ...data,
      stripePriceId: updatedStripePriceId,
      stripeProductId: updatedStripeProductId,
    },
  });

  return updatedPlan;
};

const deletePlan = async (id: string) => {
  const existingPlan = await prisma.plan.findUnique({ where: { id } });
  if (!existingPlan) {
    throw new ApiError(httpStatus.NOT_FOUND, "Plan not found..!!");
  }

  // Archive price
  if (existingPlan.stripePriceId) {
    await stripe.prices.update(existingPlan.stripePriceId, { active: false });
  }

  // delete product
  if (existingPlan.stripeProductId) {
    await stripe.products.del(existingPlan.stripeProductId);
  }

  // Delete from DB
  await prisma.plan.delete({ where: { id } });

  return null;
};

export const planService = {
  createPlan,
  getAllPlans,
  getSinglePlan,
  updatePlan,
  deletePlan,
};
