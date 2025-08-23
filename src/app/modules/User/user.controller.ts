import { Request, Response } from "express";
import httpStatus from "http-status";
import catchAsync from "../../../shared/catchAsync";
import { UserService } from "./user.service";
import sendResponse from "../../../shared/sendResponse";
import { User } from "@prisma/client";
import config from "../../../config";
import { imageService } from "../Image/Image.service";

const createUser = catchAsync(async (req: Request, res: Response) => {
  const result = await UserService.createUser(req.body);
  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: "User Created Successfully",
    data: result,
  });
});


const requestVerification = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user.id;
  const { identification = {}, ...rest } = req.body;
  
  if (req.files) {
    const files = req.files as { [fieldname: string]: Express.Multer.File[] };
    console.log(files, "files");

    if (files.nid && files.nid[0]) {
      identification.nid = `${config.backend_image_url}/${files.nid[0].filename}`;
    }
    if (files.tradeLicense && files.tradeLicense[0]) {
      identification.tradeLicense = `${config.backend_image_url}/${files.tradeLicense[0].filename}`;
    }
    if (files.passport && files.passport[0]) {
      identification.passport = `${config.backend_image_url}/${files.passport[0].filename}`;
    }
  }
  const result = await UserService.requestVerification(userId, rest, identification);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Seller Verification Requested successfully!",
    data: result,
  });
});


const updateVerification = catchAsync(async (req: Request, res: Response) => {
  const userId = req.params.id;
  const { verificationStatus } = req.body;

  const result = await UserService.updateVerification(
    userId,
    verificationStatus
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: ` Seller verification ${verificationStatus} successfully!`,
    data: result,
  });
});

const getUserById = catchAsync(async (req: Request, res: Response) => {
  const userId = req.params.id;
  const result = await UserService.getUserById(userId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "User retrieved successfully!",
    data: result,
  });
});

const updateUser = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user.id;
  const updateData: User = req.body;

  if (req.files) {
    const files = req.files as { [fieldname: string]: Express.Multer.File[] };

    //s3
    if (files.profileImage && files.profileImage[0]) {

      const url =  await imageService.createImage(files.profileImage[0]);
      updateData.profileImage =  url.imageUrl
      // updateData.profileImage = `${config.backend_image_url}/${
      //   files.profileImage[0].filename
      // }`;
    }

    if (files.coverImage && files.coverImage[0]) {
            const url = await imageService.createImage(files.coverImage[0]);
      updateData.profileImage = url.imageUrl;
      
      // updateData.coverImage = `${config.backend_image_url}/${files.coverImage[0].filename}`;
    }
  }

  console.log(updateData, "updateData");

  const result = await UserService.updateUser(userId, updateData);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "User updated successfully!",
    data: result,
  });
});

const blockUser = catchAsync(async (req: Request, res: Response) => {
  const userId = req.params.id;
  const result = await UserService.blockUser(userId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: result.message,
    data: result.data,
  });
});

const deleteUser = catchAsync(async (req: Request, res: Response) => {
  const userId = req.params.id;
  const result = await UserService.deleteUser(userId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "User deleted successfully!",
    data: result,
  });
});

const getAllUsers = catchAsync(async (req: Request, res: Response) => {
  const result = await UserService.getAllUsers(req.query);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "All users retrieved successfully!",
    meta: result.metaData,
    data: result.user,
  });
});

export const UserController = {
  createUser,
  requestVerification,
  updateVerification,
  getUserById,
  updateUser,
  deleteUser,
  getAllUsers,
  blockUser,
};
