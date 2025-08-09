import { Request, Response } from "express";
import catchAsync from "../../../shared/catchAsync";
import sendResponse from "../../../shared/sendResponse";
import httpStatus from "http-status";
import { subscriptionService } from "./Subscription.service";
import stripe from "../../../helpars/stripe";

const createSubscription = catchAsync(async (req: Request, res: Response) => {
    const result = await subscriptionService.createSubscription(req.body);
    sendResponse(res, {
        statusCode: httpStatus.CREATED,
        success: true,
        message: "Subscription created successfully",
        data: result,
    });
});

const getAllSubscriptions = catchAsync(async (req: Request, res: Response) => {
    const results = await subscriptionService.getAllSubscriptions(req.query);
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Subscriptions retrieved successfully",
        meta:results.meta,
        data: results.data,
    });
});

const getSingleSubscription = catchAsync(async (req: Request, res: Response) => {
    const result = await subscriptionService.getSingleSubscription(req.params.id);
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Subscription retrieved successfully",
        data: result,
    });
});

const updateSubscription = catchAsync(async (req: Request, res: Response) => {
    const result = await subscriptionService.updateSubscription(req.params.id, req.body);
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Subscription updated successfully",
        data: result,
    });
});

const deleteSubscription = catchAsync(async (req: Request, res: Response) => {
    const result = await subscriptionService.deleteSubscription(req.params.id);
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Subscription deleted successfully",
        data: result,
    });
});

const webhookHandler = async (req: Request, res: Response) => {
//   const sig = req.headers["stripe-signature"] as string;
//   const rawBody = (req as any).body; // express.raw() ensures req.body is raw Buffer/string
//     let event: any;
//       try {
//         event = stripe.webhooks.constructEvent(
//           rawBody,
//           sig,
//           process.env.STRIPE_WEBHOOK_SECRET!
//         );
//       } catch (err: any) {
//         console.error("Webhook signature verification failed.", err.message);
//         return res.status(400).send(`Webhook Error: ${err.message}`);
//       }

    const result = await subscriptionService.stripeWebhookHandler(req.body);
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Subscription deleted successfully",
      data: result,
    });
};


export const subscriptionController = {
    createSubscription,
    getAllSubscriptions,
    getSingleSubscription,
    updateSubscription,
    deleteSubscription,
    webhookHandler
};
