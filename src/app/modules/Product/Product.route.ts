import { Router } from "express";
import { productController } from "./Product.controller";
import auth from "../../middlewares/auth";
import validateRequest from "../../middlewares/validateRequest";
import { ProductValidation } from "./Product.validation";
import { parseBodyData } from "../../middlewares/parseBodyData";
import { fileUploader } from "../../../helpars/fileUploader";
import { UserRole } from "@prisma/client";

const router = Router();

// create product
router.post(
  "/create",
  auth(),
  fileUploader.upload.single("image"),
  parseBodyData,
  validateRequest(ProductValidation.ProductSchema),
  productController.createProduct
);

// get all product
router.get("/", auth(), productController.getAllProducts);

// get single product by id
router.get("/:id", auth(), productController.getSingleProduct);

// update product status
router.patch(
  "/status/:id",
  auth(UserRole.SUPER_ADMIN, UserRole.ADMIN),
  validateRequest(ProductValidation.UpdateProductStatusSchema),
  productController.updateProductStatus
);


// update product
router.put(
  "/:id",
  auth(),
  fileUploader.upload.single("image"),
  parseBodyData,
  validateRequest(ProductValidation.UpdateProductSchema),
  productController.updateProduct
);

// delete product
router.delete("/:id", auth(), productController.deleteProduct);

export const productRoutes = router;
