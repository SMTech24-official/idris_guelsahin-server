import { Request, Response } from "express";
import catchAsync from "../../../shared/catchAsync";
import sendResponse from "../../../shared/sendResponse";
import httpStatus from "http-status";
import { contactService } from "./Contact.service";

const createContact = catchAsync(async (req: Request, res: Response) => {
    const result = await contactService.createContact(req.body);
    sendResponse(res, {
        statusCode: httpStatus.CREATED,
        success: true,
        message: "Message sent successfully",
        data: result,
    });
});


const getAllContacts = catchAsync(async (req: Request, res: Response) => {
    const results = await contactService.getAllContacts(req.query);
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Contacts retrieved successfully",
        meta:results.meta,
        data: results.data,
    });
});


const getSingleContact = catchAsync(async (req: Request, res: Response) => {
    const result = await contactService.getSingleContact(req.params.id);
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Contact retrieved successfully",
        data: result,
    });
});


const updateContact = catchAsync(async (req: Request, res: Response) => {
    const result = await contactService.updateContact(req.params.id, req.body);
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Contact updated successfully",
        data: result,
    });
});


const deleteContact = catchAsync(async (req: Request, res: Response) => {
    const result = await contactService.deleteContact(req.params.id);
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Contact deleted successfully",
        data: result,
    });
});

export const contactController = {
    createContact,
    getAllContacts,
    getSingleContact,
    updateContact,
    deleteContact,
};
