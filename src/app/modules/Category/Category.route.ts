import { Router } from "express";
import { categoryController } from "./Category.controller";
import { UserRole } from "@prisma/client";
import auth from "../../middlewares/auth";
import validateRequest from "../../middlewares/validateRequest";
import { CategoryValidation } from "./Category.validation";

const router = Router();

// create category
router.post(
  "/create",
    auth(UserRole.ADMIN, UserRole.SUPER_ADMIN),
  validateRequest(CategoryValidation.CategorySchema),
  categoryController.createCategory
);

// get all category
router.get("/", auth(), categoryController.getAllCategorys);

// get category slug by all products
router.get("/:slug", auth(), categoryController.getSingleCategory);

// update category
router.put(
  "/:id",
  auth(UserRole.ADMIN, UserRole.SUPER_ADMIN),
  categoryController.updateCategory
);

// delete category
router.delete(
  "/:id",
  auth(UserRole.ADMIN, UserRole.SUPER_ADMIN),
  categoryController.deleteCategory
);

export const categoryRoutes = router;
