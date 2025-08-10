import { Router } from "express";
import { planController } from "./Plan.controller";
import { UserRole } from "@prisma/client";
import validateRequest from "../../middlewares/validateRequest";
import { PlanValidation } from "./Plan.validation";
import auth from "../../middlewares/auth";

const router = Router();

// create plan
router.post(
  "/create",
  auth(UserRole.SUPER_ADMIN, UserRole.ADMIN),
  validateRequest(PlanValidation.PlanSchema),
  planController.createPlan
);

// get all plan
router.get("/", planController.getAllPlans);

// get single plan by id
router.get("/:id", planController.getSinglePlan);

// update plan
router.put(
  "/:id",
  auth(UserRole.SUPER_ADMIN, UserRole.ADMIN),
  validateRequest(PlanValidation.UpdatePlanSchema),
  planController.updatePlan
);

// delete plan
router.delete(
  "/:id",
  auth(UserRole.SUPER_ADMIN, UserRole.ADMIN),
  planController.deletePlan
);

export const planRoutes = router;
