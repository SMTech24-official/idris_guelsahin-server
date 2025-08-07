import { Router } from "express";
import { productController } from "./Product.controller";
import auth from "../../middlewares/auth";
import validateRequest from "../../middlewares/validateRequest";
import { ProductValidation } from "./Product.validation";
import { parseBodyData } from "../../middlewares/parseBodyData";
import { fileUploader } from "../../../helpars/fileUploader";

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

// update product
router.put("/:id", auth(), productController.updateProduct);

// delete product
router.delete("/:id", auth(), productController.deleteProduct);

export const productRoutes = router;
