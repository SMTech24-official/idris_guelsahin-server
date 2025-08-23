import { UserRole } from "@prisma/client";
import express from "express";
import { fileUploader } from "../../../helpars/fileUploader";
import auth from "../../middlewares/auth";
import { UserController } from "./user.controller";
import { UserValidation } from "./user.validation";
import validateRequest from "../../middlewares/validateRequest";
import { parseBodyData } from "../../middlewares/parseBodyData";
import fileUploaderCloud from "../../../helpars/fileUploaderCloud";

const router = express.Router();

// const uploadSingle = fileUploader.upload.single("profileImage");

// register user
router.post(
  "/register",
  validateRequest(UserValidation.CreateUserValidationSchema),
  UserController.createUser
);

// register user
router.post(
  "/request",
  auth(),
  fileUploader.upload.fields([
    { name: "nid", maxCount: 1 },
    { name: "tradeLicense", maxCount: 1 },
    { name: "passport", maxCount: 1 },
  ]),
  parseBodyData,
  validateRequest(UserValidation.userUpdateSchema),
  UserController.requestVerification
);

// register user
router.post("/accept/:id", auth(UserRole.SUPER_ADMIN, UserRole.ADMIN), UserController.updateVerification);

// get single user
router.get("/:id", auth(), UserController.getUserById);

// update user
router.put(
  "/update-me",
  auth(),
  fileUploaderCloud.upload.fields([
    { name: "profileImage", maxCount: 1 },
    { name: "coverImage", maxCount: 1 },
  ]),
  parseBodyData,
  validateRequest(UserValidation.userUpdateSchema),
  UserController.updateUser
);

// block user
router.put(
  "/:id",
  auth(UserRole.SUPER_ADMIN, UserRole.ADMIN),
  UserController.blockUser
);
// delete user
router.delete("/:id", auth(UserRole.SUPER_ADMIN), UserController.deleteUser);

// get all user
router.get(
  "/",
  auth(UserRole.SUPER_ADMIN, UserRole.ADMIN),
  UserController.getAllUsers
);

export const UserRoutes = router;
