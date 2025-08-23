import prisma from "../../../shared/prisma";
import QueryBuilder from "../../../helpars/queryBuilder";
import ApiError from "../../../errors/ApiErrors";
import httpStatus from "http-status";
import stripe from "../../../helpars/stripe";
import Stripe from "stripe";
import { TSubscription } from "./Subscription.interface";
import { SubscriptionService } from "./subscription.utils";

const createSubscription = async (data: TSubscription) => {
  const { userId, planId } = data;
  if (!userId || !planId) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      "userId and planId are required"
    );
  }

  const user = await prisma.user.findUnique({ where: { id: userId } });
  const plan = await prisma.plan.findUnique({ where: { id: planId } });
  if (!user || !plan) {
    throw new ApiError(httpStatus.NOT_FOUND, "User or plan not found");
  }
  if (!plan.stripePriceId) {
    throw new ApiError(httpStatus.NOT_FOUND, "plan missing stripePriceId");
  }

  // 1) Create Stripe customer if user doesn't have one
  let stripeCustomerId = user.stripeCustomerId;
  if (!stripeCustomerId) {
    const customer = await stripe.customers.create({
      email: user.email,
      metadata: { userId: user.id },
    });
    stripeCustomerId = customer.id;
    await prisma.user.update({
      where: { id: user.id },
      data: { stripeCustomerId },
    });
  }

  // 2) Create subscription with default_incomplete so Stripe generates a PaymentIntent
  //    and we can return that client_secret to the client to confirm the payment.
  const subscription = await stripe.subscriptions.create({
    customer: stripeCustomerId,
    items: [{ price: plan.stripePriceId }],
    payment_behavior: "default_incomplete",
    expand: ["latest_invoice.payment_intent"],
    metadata: { userId: user.id, planId: plan.id }
  });

  const paymentIntent = (subscription.latest_invoice as any)?.payment_intent;

  const clientSecret = paymentIntent?.client_secret;
  console.log(clientSecret, 'clientSecret');

  // 3) Save subscription in DB (status will be incomplete until payment confirmed)
  await prisma.subscription.create({
    data: {
      userId: user.id,
      planId: plan.id,
      stripeSubscriptionId: subscription.id,
      status: subscription.status,
    },
  });

  return { clientSecret, subscriptionId: subscription.id };
};

const getAllSubscriptions = async (query: Record<string, any>) => {
  const queryBuilder = new QueryBuilder(prisma.subscription, query);
  const subscriptions = await queryBuilder
    .search([""])
    .filter()
    .sort()
    .paginate()
    .fields()
    .include({
      user: {
        select: {
          id: true,
          fullName: true,
          email: true,
          profileImage: true,
          coverImage: true,
        },
      },
      plan: {
        select: {
          id: true,
          name: true,
          price: true,
          duration: true,
          stripePriceId: true,
        },
      },
    })
    .execute();

  const meta = await queryBuilder.countTotal();
  return { meta, data: subscriptions };
};

const getMySubscriptions = async (userId: string) => {
  const subscriptionService = new SubscriptionService();

  const subscription = await subscriptionService.getUserCurrentSubscription(
    userId
  );
  

  // Get current ads count
  const currentAdsCount = await prisma.product.count({
    where: {
      userId: userId,
      status: "ACCEPTED",
    },
  });

  return {
    ...subscription,
    currentAdsCount,
  };
};

const getSingleSubscription = async (id: string) => {
  const result = await prisma.subscription.findUnique({
    where: { id },
    include: {
      user: {
        select: {
          id: true,
          fullName: true,
          email: true,
          profileImage: true,
          coverImage: true,
        },
      },
      plan: {
        select: {
          id: true,
          name: true,
          price: true,
          duration: true,
          stripePriceId: true,
        },
      },
    },
  });
  if (!result) {
    throw new ApiError(httpStatus.NOT_FOUND, "Subscription not found..!!");
  }

  return result;
};

const updateSubscription = async (id: string, data: any) => {
  const existingSubscription = await prisma.subscription.findUnique({
    where: { id },
  });
  if (!existingSubscription) {
    throw new ApiError(httpStatus.NOT_FOUND, "Subscription not found..!!");
  }
  const result = await prisma.subscription.update({ where: { id }, data });
  return result;
};

const deleteSubscription = async (id: string) => {
  const existingSubscription = await prisma.subscription.findUnique({
    where: { id },
  });
  if (!existingSubscription) {
    throw new ApiError(httpStatus.NOT_FOUND, "Subscription not found..!!");
  }
  const result = await prisma.subscription.delete({ where: { id } });
  return null;
};

const stripeWebhookHandler = async (event: Stripe.Event) => {
  try {
    switch (event.type) {
      case "invoice.payment_succeeded": {
        console.log("cal payment succeeded");
        const invoice = event.data.object as Stripe.Invoice & {
          parent?: {
            subscription_details?: {
              subscription?: string;
              metadata?: { userId?: string; planId?: string };
            };
          };
        };

        const stripeSubscriptionId =
          invoice.parent?.subscription_details?.subscription;
        console.log(stripeSubscriptionId, "stripeSubscriptionId");

        // Retrieve subscription to know current_period_end & status
        const sub = await stripe.subscriptions.retrieve(stripeSubscriptionId!);
        console.log(sub, "ee");
        await prisma.subscription.updateMany({
          where: { stripeSubscriptionId },
          data: {
            status: sub.status,
            currentPeriodEnd: sub.current_period_end
              ? new Date(sub.current_period_end * 1000)
              : undefined,
          },
        });
        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object;
        const stripeSubscriptionId = invoice.subscription as string;
        await prisma.subscription.updateMany({
          where: { stripeSubscriptionId },
          data: { status: "past_due" },
        });
        break;
      }

      case "customer.subscription.updated":
      case "customer.subscription.deleted": {
        const subObj = event.data.object;
        const stripeSubscriptionId = subObj.id as string;
        await prisma.subscription.updateMany({
          where: { stripeSubscriptionId },
          data: {
            status: subObj.status,
            currentPeriodEnd: subObj.current_period_end
              ? new Date(subObj.current_period_end * 1000)
              : undefined,
          },
        });
        break;
      }

      default:
        // handle other events if needed
        break;
    }
    return { received: true };
  } catch (err) {
    console.error("Webhook handler error:", err);
  }
};

export const subscriptionService = {
  createSubscription,
  getAllSubscriptions,
  getMySubscriptions,
  getSingleSubscription,
  updateSubscription,
  deleteSubscription,
  stripeWebhookHandler,
};
