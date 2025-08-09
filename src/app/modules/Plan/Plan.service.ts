import prisma from "../../../shared/prisma";
import QueryBuilder from "../../../helpars/queryBuilder";
import ApiError from "../../../errors/ApiErrors";
import httpStatus from "http-status";
import stripe from "../../../helpars/stripe";
import { TPlan } from "./Plan.interface";

const createPlan = async (data: TPlan) => {

  // 1) Create Product in Stripe
  const product = await stripe.products.create({ name: data.name});

  // 2) Create Price in Stripe (recurring)
  const priceObj = await stripe.prices.create({
    unit_amount: data.price,
    currency: data.currency || "usd",
    recurring: { interval :  "month"},
    product: product.id,
  });

  // 3) Save in DB
  const plan = await prisma.plan.create({
    data: {
      name: data.name,
      price: data.price,
      currency: data.currency || "usd",
      interval: data.interval,
      stripePriceId: priceObj.id,
      features: data.fetures,
    },
  });

  return plan;
};

const getAllPlans = async (query: Record<string, any>) => {
    const queryBuilder = new QueryBuilder(prisma.plan, query);
    const plans = await queryBuilder
        .search([""])
        .filter()
        .sort()
        .paginate()
        .fields()
        .execute()

    const meta = await queryBuilder.countTotal();
    return { meta, data: plans };
};

const getSinglePlan = async (id: string) => {
    const result = await prisma.plan.findUnique({ where: { id } });
    if(!result){
     throw new ApiError(httpStatus.NOT_FOUND, "Plan not found..!!")
    }
    return result;
};

const updatePlan = async (id: string, data: any) => {
    const existingPlan = await prisma.plan.findUnique({ where: { id } });
    if (!existingPlan) {
        throw new ApiError(httpStatus.NOT_FOUND, "Plan not found..!!");
    }
    const result = await prisma.plan.update({ where: { id }, data });
    return result;
};

const deletePlan = async (id: string) => {
 const existingPlan = await prisma.plan.findUnique({ where: { id } });
    if (!existingPlan) {
        throw new ApiError(httpStatus.NOT_FOUND, "Plan not found..!!");
    }
    const result = await prisma.plan.delete({ where: { id } });
    return null;
};

export const planService = {
    createPlan,
    getAllPlans,
    getSinglePlan,
    updatePlan,
    deletePlan,
};
