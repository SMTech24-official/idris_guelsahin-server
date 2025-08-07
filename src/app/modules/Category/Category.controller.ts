import { Request, Response } from "express";
import catchAsync from "../../../shared/catchAsync";
import sendResponse from "../../../shared/sendResponse";
import httpStatus from "http-status";
import { categoryService } from "./Category.service";

const createCategory = catchAsync(async (req: Request, res: Response) => {
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
        meta:results.meta,
        data: results.data,
    });
});

const getSingleCategory = catchAsync(async (req: Request, res: Response) => {
    const result = await categoryService.getSingleCategory(req.params.id);
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Category retrieved successfully",
        data: result,
    });
});

const updateCategory = catchAsync(async (req: Request, res: Response) => {
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
