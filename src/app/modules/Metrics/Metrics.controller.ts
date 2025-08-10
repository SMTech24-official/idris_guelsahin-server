import { Request, Response } from "express";
import catchAsync from "../../../shared/catchAsync";
import sendResponse from "../../../shared/sendResponse";
import httpStatus from "http-status";
import { metricsService } from "./Metrics.service";

const getOverview = catchAsync(async (req: Request, res: Response) => {
  const result = await metricsService.getOverview();
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "All Metricss Overview retrieved successfully",
    data: result,
  });
});

const getTotoalRevenue = catchAsync(async (req: Request, res: Response) => {
  const result = await metricsService.getRevenue();
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "New Clients retrieved successfully",
    data: result,
  });
});

const sellerVerificationRequest = catchAsync(async (req: Request, res: Response) => {
  const year = req.query.year
    ? parseInt(req.query.year.toString())
    : new Date().getFullYear();
  const result = await metricsService.sellerVerificationRequested(year);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Monthly Revenue retrieved successfully",
    data: result,
  });
});

const recentSubscriberList = catchAsync(async (req: Request, res: Response) => {
  const dateQuery = req.query.date;
  let referenceDate: Date;

  if (typeof dateQuery === "string") {
    referenceDate = new Date(dateQuery);
  } else {
    referenceDate = new Date();
  }
  const result = await metricsService.recentSubscriberList(referenceDate);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Weekly Booking Data retrieved successfully",
    data: result,
  });
});


export const metricsController = {
  getOverview,
  getTotoalRevenue,
  sellerVerificationRequest,
  recentSubscriberList
};
