import { Router } from "express";
import { metricsController } from "./Metrics.controller";

const router = Router();

// get all metrics
router.get("/overview", metricsController.getOverview);


router.get("/total-revenue", metricsController.getTotoalRevenue);

router.get("/subscriber-list", metricsController.recentSubscriberList);

router.get("/verification-request", metricsController.sellerVerificationRequest);




export const metricsRoutes = router;
