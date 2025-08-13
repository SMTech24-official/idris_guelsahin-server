import { Request, Response } from "express";
import catchAsync from "../../../shared/catchAsync";
import sendResponse from "../../../shared/sendResponse";
import httpStatus from "http-status";
import { messageService } from "./Message.service";

const createMessage = catchAsync(async (req: Request, res: Response) => {
    const result = await messageService.createMessage(req.body);
    sendResponse(res, {
        statusCode: httpStatus.CREATED,
        success: true,
        message: "Message created successfully",
        data: result,
    });
});

const getAllMessages = catchAsync(async (req: Request, res: Response) => {
    const results = await messageService.getAllMessages(req.query);
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Messages retrieved successfully",
        meta:results.meta,
        data: results.data,
    });
});

const getSingleMessage = catchAsync(async (req: Request, res: Response) => {
    const result = await messageService.getSingleMessage(req.params.id);
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Message retrieved successfully",
        data: result,
    });
});

const updateMessage = catchAsync(async (req: Request, res: Response) => {
    const result = await messageService.updateMessage(req.params.id, req.body);
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Message updated successfully",
        data: result,
    });
});

const deleteMessage = catchAsync(async (req: Request, res: Response) => {
    const result = await messageService.deleteMessage(req.params.id);
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Message deleted successfully",
        data: result,
    });
});

export const messageController = {
    createMessage,
    getAllMessages,
    getSingleMessage,
    updateMessage,
    deleteMessage,
};
