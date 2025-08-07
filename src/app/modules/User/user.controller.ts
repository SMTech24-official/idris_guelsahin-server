import { Request, Response } from "express";
import httpStatus from "http-status";
import catchAsync from "../../../shared/catchAsync";
import { UserService } from "./user.service";
import sendResponse from "../../../shared/sendResponse";
import { User } from "@prisma/client";
import config from "../../../config";

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
  const {Identification, ...rest} = req.body;

  if (req.files) {
    const files = req.files as { [fieldname: string]: Express.Multer.File[] };

    // if (files.profileImage && files.profileImage[0]) {
    //   updateData.profileImage = `${config.backend_image_url}/${files.profileImage[0].filename}`;
    // }
  }


  const result = await UserService.requestVerification(userId, rest, Identification);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "User updated successfully!",
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
    message: "User updated successfully!",
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

    if (files.profileImage && files.profileImage[0]) {
      updateData.profileImage = `${config.backend_image_url}/${
        files.profileImage[0].filename
      }`;
    }

    if (files.coverImage && files.coverImage[0]) {
      updateData.coverImage = `${config.backend_image_url}/${files.coverImage[0].filename}`;
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
  getUserById,
  updateUser,
  deleteUser,
  getAllUsers,
  blockUser,
};
