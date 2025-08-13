import { Router } from "express";
import { subscriptionController } from "./Subscription.controller";
import auth from "../../middlewares/auth";
import { UserRole } from "@prisma/client";
import validateRequest from "../../middlewares/validateRequest";
import { SubscriptionValidation } from "./Subscription.validation";

const router = Router();

// create subscription
router.post(
  "/create",
  auth(),
  validateRequest(SubscriptionValidation.SubscriptionSchema),
  subscriptionController.createSubscription
);

// get my subscription
router.get(
  "/my-subscription",
  auth(),
  subscriptionController.getMySubscriptions
);


// get all subscription
router.get(
  "/",
  auth(UserRole.ADMIN, UserRole.SUPER_ADMIN),

  subscriptionController.getAllSubscriptions
);

// get single subscription by id
router.get(
  "/:id",
  auth(UserRole.ADMIN, UserRole.SUPER_ADMIN),
  subscriptionController.getSingleSubscription
);

// update subscription
router.put("/:id", auth(), subscriptionController.updateSubscription);

// delete subscription
router.delete(
  "/:id",
  auth(UserRole.ADMIN, UserRole.SUPER_ADMIN),
  subscriptionController.deleteSubscription
);

// webhook
router.post("/webhook", subscriptionController.webhookHandler);

export const subscriptionRoutes = router;
