import { Request, Response } from "express";
import catchAsync from "../../../shared/catchAsync";
import sendResponse from "../../../shared/sendResponse";
import httpStatus from "http-status";
import { categoryService } from "./Category.service";
import { imageService } from "../Image/Image.service";
import { jwtHelpers } from "../../../helpars/jwtHelpers";
import config from "../../../config";
import prisma from "../../../shared/prisma";
import { Secret } from "jsonwebtoken";

const createCategory = catchAsync(async (req: Request, res: Response) => {
  if (req.file) {
    const url = await imageService.createImage(req.file);
    req.body.image = url.imageUrl;
    // req.body.image = `${config.backend_image_url}/${req.file.filename}`;
  }
  const result = await categoryService.createCategory(req.body);
  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: "Category created successfully",
    data: result,
  });
});

const getAllCategorys = catchAsync(async (req: Request, res: Response) => {
  const results = await categoryService.getAllCategorys(req.query);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Categorys retrieved successfully",
    meta: results.meta,
    data: results.data,
  });
});

const getSingleCategory = catchAsync(async (req: Request, res: Response) => {
  const token = req.headers.authorization;
  let userId;
  if (token) {
    const verifiedUser = jwtHelpers.verifyToken(
      token,
      config.jwt.jwt_secret as Secret
    );

    const user = await prisma.user.findUnique({
      where: {
        email: verifiedUser.email,
      },
    });
    userId = user?.id;
  }
  const result = await categoryService.getSingleCategory(
    req.params.slug,
    userId
  );
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Category retrieved successfully",
    data: result,
  });
});

const updateCategory = catchAsync(async (req: Request, res: Response) => {
  if (req.file) {
    const url = await imageService.createImage(req.file);
    req.body.image = url.imageUrl;
    // req.body.image = `${config.backend_image_url}/${req.file.filename}`;
  }
  const result = await categoryService.updateCategory(req.params.id, req.body);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Category updated successfully",
    data: result,
  });
});

const deleteCategory = catchAsync(async (req: Request, res: Response) => {
  const result = await categoryService.deleteCategory(req.params.id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Category deleted successfully",
    data: result,
  });
});

export const categoryController = {
  createCategory,
  getAllCategorys,
  getSingleCategory,
  updateCategory,
  deleteCategory,
};
