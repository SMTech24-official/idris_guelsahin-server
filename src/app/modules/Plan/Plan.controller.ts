import { Request, Response } from "express";
import catchAsync from "../../../shared/catchAsync";
import sendResponse from "../../../shared/sendResponse";
import httpStatus from "http-status";
import { planService } from "./Plan.service";

const createPlan = catchAsync(async (req: Request, res: Response) => {
    const result = await planService.createPlan(req.body);
    sendResponse(res, {
        statusCode: httpStatus.CREATED,
        success: true,
        message: "Plan created successfully",
        data: result,
    });
});

const getAllPlans = catchAsync(async (req: Request, res: Response) => {
    const results = await planService.getAllPlans(req.query);
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Plans retrieved successfully",
        meta:results.meta,
        data: results.data,
    });
});

const getSinglePlan = catchAsync(async (req: Request, res: Response) => {
    const result = await planService.getSinglePlan(req.params.id);
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Plan retrieved successfully",
        data: result,
    });
});

const updatePlan = catchAsync(async (req: Request, res: Response) => {
    const result = await planService.updatePlan(req.params.id, req.body);
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Plan updated successfully",
        data: result,
    });
});

const deletePlan = catchAsync(async (req: Request, res: Response) => {
    const result = await planService.deletePlan(req.params.id);
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Plan deleted successfully",
        data: result,
    });
});

export const planController = {
    createPlan,
    getAllPlans,
    getSinglePlan,
    updatePlan,
    deletePlan,
};
