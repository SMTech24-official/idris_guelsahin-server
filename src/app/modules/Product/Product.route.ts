import { Router } from "express";
import { productController } from "./Product.controller";
import auth from "../../middlewares/auth";
import validateRequest from "../../middlewares/validateRequest";
import { ProductValidation } from "./Product.validation";
import { parseBodyData } from "../../middlewares/parseBodyData";
import { fileUploader } from "../../../helpars/fileUploader";
import { UserRole } from "@prisma/client";
import fileUploaderCloud from "../../../helpars/fileUploaderCloud";

const router = Router();

// create product
router.post(
  "/create",
  auth(),
  fileUploaderCloud.upload.array("images", 4),
  parseBodyData,
  validateRequest(ProductValidation.ProductSchema),
  productController.createProduct
);

// get my product
router.get("/my-products", auth(UserRole.SELLER), productController.getMyProducts);

// get all produc
router.get("/",  productController.getAllProducts);

// get single product by id
router.get("/:id", productController.getSingleProduct);

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
  fileUploaderCloud.upload.array("images", 4),
  parseBodyData,
  validateRequest(ProductValidation.UpdateProductSchema),
  productController.updateProduct
);

// delete product
router.delete("/:id", auth(), productController.deleteProduct);

export const productRoutes = router;
