import { Router } from "express";
import { planController } from "./Plan.controller";

const router = Router();

// create plan
router.post("/create", planController.createPlan);

// get all plan
router.get("/", planController.getAllPlans);

// get single plan by id
router.get("/:id", planController.getSinglePlan);

// update plan
router.put("/:id", planController.updatePlan);

// delete plan
router.delete("/:id", planController.deletePlan);

export const planRoutes = router;
