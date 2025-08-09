import { Router } from "express";
import { subscriptionController } from "./Subscription.controller";

const router = Router();

// create subscription
router.post("/create", subscriptionController.createSubscription);

// get all subscription
router.get("/", subscriptionController.getAllSubscriptions);

// get single subscription by id
router.get("/:id", subscriptionController.getSingleSubscription);

// update subscription
router.put("/:id", subscriptionController.updateSubscription);

// delete subscription
router.delete("/:id", subscriptionController.deleteSubscription);

// webhook
router.post("/webhook", subscriptionController.webhookHandler);

export const subscriptionRoutes = router;
