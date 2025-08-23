import { Request, Response } from "express";
import catchAsync from "../../../shared/catchAsync";
import sendResponse from "../../../shared/sendResponse";
import httpStatus from "http-status";
import { favoriteService } from "./Favorite.service";

const createFavorite = catchAsync(async (req: Request, res: Response) => {
    const userId = req.user.id
    const results = await favoriteService.createFavorite({userId, ...req.body});
    sendResponse(res, {
        statusCode: httpStatus.CREATED,
        success: true,
        message: results.message,
        data: results.data,
    });  
});

const getAllMyFavorites = catchAsync(async (req: Request, res: Response) => {
    const userId = req.user.id
    const results = await favoriteService.getAllFavorites({ userId, ...req.query });
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Favorites retrieved successfully",
        meta:results.meta,
        data: results.data,
    });
});

const getSingleFavorite = catchAsync(async (req: Request, res: Response) => {
    const result = await favoriteService.getSingleFavorite(req.params.id);
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Favorite retrieved successfully",
        data: result,
    });
});
export const favoriteController = {
    createFavorite,
    getAllMyFavorites,
    getSingleFavorite
};
