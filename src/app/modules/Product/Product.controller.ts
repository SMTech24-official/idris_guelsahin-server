import { Request, Response } from "express";
import catchAsync from "../../../shared/catchAsync";
import sendResponse from "../../../shared/sendResponse";
import httpStatus from "http-status";
import { productService } from "./Product.service";
import config from "../../../config";
import prisma from "../../../shared/prisma";
import ApiError from "../../../errors/ApiErrors";
import { SubscriptionService } from "../Subscription/subscription.utils";
import { imageService } from "../Image/Image.service";

const createProduct = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user.id;
  const subscriptionService = new SubscriptionService();

  // Check if user can create more ads
  const canCreate = await subscriptionService.canUserCreateAd(userId);

  if (!canCreate.allowed) {
    throw new ApiError(httpStatus.FORBIDDEN, canCreate.reason);
  }

  if (req.files) {
    //s3
    const urls = await imageService.createMultipleImages(
      req.files as Express.Multer.File[]
    );
    req.body.images = urls.imageUrls;

    //local
    // req.body.images = (req.files as Express.Multer.File[]).map((file) => {
    //   return `${config.backend_image_url}/${file.filename}`;
    // });
  }
  const result = await productService.createProduct(req.body, userId);
  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: "Product created successfully",
    data: result,
  });
});

const getMyProducts = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user.id;

  const results = await productService.getMyProducts({ userId, ...req.query });
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Your Products retrieved successfully",
    meta: results.meta,
    data: results.data,
  });
});

const getAllProducts = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user.id;
  const { categorySlug, ...rest } = req.query;

  let categoryId = undefined;
  if (categorySlug) {
    const category = await prisma.category.findUnique({
      where: {
        slug: categorySlug as string,
      },
    });
    if (!category) {
      throw new ApiError(httpStatus.NOT_FOUND, "Category not found..!!");
    }
    categoryId = category.id;
  }

  const subscriptionService = new SubscriptionService();
  const userSubscription = await subscriptionService.getUserCurrentSubscription(
    userId
  );

  let searchQuery: any = {
    where: {
      status: "ACCEPTED",
    },
  };

  // Enhanced search for premium users
  if (userSubscription.canAccessPremiumFeatures) {
    // Add premium search filters, sorting, etc.
    searchQuery.include = {
      category: true,
      // Include additional data for premium users
    };
  }

  const results = await productService.getAllProducts(
    { ...rest, categoryId },
    userId
  );
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Products retrieved successfully",
    meta: results.meta,
    data: results.data,
  });
});

const getSingleProduct = catchAsync(async (req: Request, res: Response) => {
  const result = await productService.getSingleProduct(req.params.id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Product retrieved successfully",
    data: result,
  });
});

const updateProductStatus = catchAsync(async (req: Request, res: Response) => {
  const result = await productService.updateProductStatus(
    req.params.id,
    req.body
  );
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: `Product ${req.body.status} successfully`,
    data: result,
  });
});

const updateProduct = catchAsync(async (req: Request, res: Response) => {
  if (req.files) {
    //s3
    const urls = await imageService.createMultipleImages(
      req.files as Express.Multer.File[]
    );
    const newImages: string[] = urls.imageUrls;

    //local
    // const newImages: string[] = (req.files as Express.Multer.File[]).map(
    //   (file) => {
    //     return `${config.backend_image_url}/${file.filename}`;
    //   }
    // );
    const keepImages: string[] = req.body.images || [];
    req.body.images = [...keepImages, ...newImages];
  }
  const result = await productService.updateProduct(req.params.id, req.body);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Product updated successfully",
    data: result,
  });
});

const deleteProduct = catchAsync(async (req: Request, res: Response) => {
  const result = await productService.deleteProduct(req.params.id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Product deleted successfully",
    data: result,
  });
});

export const productController = {
  createProduct,
  getAllProducts,
  getMyProducts,
  getSingleProduct,
  updateProduct,
  updateProductStatus,
  deleteProduct,
};
