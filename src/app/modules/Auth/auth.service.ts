import { UserStatus } from "@prisma/client";
import * as bcrypt from "bcrypt";
import * as crypto from "crypto";
import httpStatus from "http-status";
import { Secret } from "jsonwebtoken";
import config from "../../../config";
import ApiError from "../../../errors/ApiErrors";
import emailSender from "../../../helpars/emailSender";
import { jwtHelpers } from "../../../helpars/jwtHelpers";
import prisma from "../../../shared/prisma";

const loginUser = async (payload: { email: string; password: string }) => {
  const userData = await prisma.user.findUnique({
    where: {
      email: payload.email,
    },
  });

  if (!userData) {
    throw new Error("User not found");
  }

  if (userData.userStatus === UserStatus.BLOCKED) {
    throw new Error("Your account is blocked.");
  }

  if (!payload.password || !userData?.password) {
    throw new Error("Password is required");
  }

  const isCorrectPassword: boolean = await bcrypt.compare(
    payload.password,
    userData.password
  );

  if (!isCorrectPassword) {
    throw new Error("Password incorrect!");
  }

  if (userData.emailVerified) {
    const accessToken = jwtHelpers.generateToken(
      {
        id: userData.id,
        firstName: userData.firstName,
        lastName: userData.lastName,
        email: userData.email,
        role: userData.role,
      },
      config.jwt.jwt_secret as Secret,
      config.jwt.expires_in as string
    );

    const refreshToken = jwtHelpers.generateToken(
      {
        id: userData.id,
        firstName: userData.firstName,
        lastName: userData.lastName,
        email: userData.email,
        role: userData.role,
      },
      config.jwt.refresh_token_secret as Secret,
      config.jwt.refresh_token_expires_in as string
    );

    return {
      accessToken,
      refreshToken,
      message: "User logged in successfully",
    };
  }

  await sendOtp({ email: payload.email });

  return { message: "OTP sent to your email successfully" };
};

//send otp

const sendOtp = async (payload: { email: string }) => {
  const userData = await prisma.user.findUnique({
    where: {
      email: payload.email,
    },
  });
  if (!userData) {
    throw new ApiError(404, "User not found");
  }

  const randomOtp = Math.floor(100000 + Math.random() * 900000).toString();
  const otpExpiry = new Date(Date.now() + 5 * 60 * 1000);
  const html = `<!DOCTYPE html>
  <html lang="en">
  <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Email Verification</title>
  </head>
  <body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f6f9fc; margin: 0; padding: 0; line-height: 1.6;">
      <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);">
          <div style="background-color: #FF7600; background-image: linear-gradient(135deg, #00A9EA, #005D81); padding: 30px 20px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 600; text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);">OTP Verification</h1>
          </div>
          <div style="padding: 20px 12px; text-align: center;">
              <p style="font-size: 18px; color: #333333; margin-bottom: 10px;">Hello,</p>
              <p style="font-size: 18px; color: #333333; margin-bottom: 20px;">Your OTP for verifying your account is:</p>
              <p style="font-size: 36px; font-weight: bold; color: #005D81; margin: 20px 0; padding: 10px 20px; background-color: #f0f8f0; border-radius: 8px; display: inline-block; letter-spacing: 5px;">${randomOtp}</p>
              <p style="font-size: 16px; color: #555555; margin-bottom: 20px; max-width: 400px; margin-left: auto; margin-right: auto;">Please enter this OTP to complete the verification process. This OTP is valid for 5 minutes.</p>
              <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #e0e0e0;">
                  <p style="font-size: 14px; color: #888888; margin-bottom: 4px;">Thank you for choosing our service!</p>
                  <p style="font-size: 14px; color: #888888; margin-bottom: 0;">If you didn't request this OTP, please ignore this email.</p>
              </div>
          </div>
          <div style="background-color: #f9f9f9; padding: 10px; text-align: center; font-size: 12px; color: #999999;">
              <p style="margin: 0;">© ${new Date().getFullYear()} Business. All rights reserved.</p>
          </div>
      </div>
  </body>
  </html>`;

  await emailSender("Verify your email", userData.email, html);

  await prisma.user.update({
    where: {
      id: userData.id,
    },
    data: {
      otp: Number(randomOtp),
      otpExpiry: otpExpiry,
    },
  });

  return { message: "OTP sent your email successfully" };
};

// user login
const enterOtp = async (payload: { email: string; otp: string }) => {
  const userData = await prisma.user.findFirst({
    where: {
      AND: [
        {
          otp: Number(payload.otp),
        },
      ],
    },
  });

  if (!userData) {
    throw new ApiError(404, "Your otp is incorrect");
  }

  if (userData.otpExpiry && userData.otpExpiry < new Date()) {
    throw new ApiError(400, "Your otp has been expired");
  }

  const accessToken = jwtHelpers.generateToken(
    {
      id: userData.id,
      firstName: userData.firstName,
      lastName: userData.lastName,
      email: userData.email,
      role: userData.role,
    },
    config.jwt.jwt_secret as Secret,
    config.jwt.expires_in as string
  );

  await prisma.user.update({
    where: {
      id: userData.id,
    },
    data: {
      emailVerified: true,
      otp: null,
      otpExpiry: null,
    },
  });

  const result = {
    accessToken,
  };

  return result;
};

// get user profile
const getMyProfile = async (userId: string) => {
  const exitingUser = await prisma.user.findUnique({
    where: {
      id: userId,
    },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      mobileNumber: true,
      currentAddress: true,
      homeAddress: true,
      role: true,
      profileImage: true,
      coverImage: true,
      isOnline: true,
      lastSeen: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  if (!exitingUser) {
    throw new ApiError(httpStatus.NOT_FOUND, "User Not found");
  }

  return exitingUser;
};

const forgotPassword = async (payload: { email: string; otp: string }) => {
  const userData = await prisma.user.findUnique({
    where: {
      email: payload.email,
      otp: Number(payload.otp),
    },
  });
  if (!userData) {
    throw new ApiError(404, "User not found");
  }
  if (userData.otp !== Number(payload.otp)) {
    throw new ApiError(404, "Your otp is incorrect");
  }

  if (userData.otpExpiry && userData.otpExpiry < new Date()) {
  }
  const resetPassToken = jwtHelpers.generateToken(
    { email: userData.email, role: userData.role },
    config.jwt.reset_pass_secret as Secret,
    config.jwt.reset_pass_token_expires_in as string
  );

  await prisma.user.update({
    where: {
      id: userData.id,
    },
    data: {
      otp: null,
      otpExpiry: null,
    },
  });

  return {
    data: {
      resetPassToken,
    },
  };
};

// reset password
const resetPassword = async (token: string, newPassword: string) => {
  // verify token

  const isValidToken = jwtHelpers.verifyToken(
    token,
    config.jwt.reset_pass_secret as Secret
  );

  if (!isValidToken) {
    throw new ApiError(httpStatus.FORBIDDEN, "Forbidden!");
  }

  console.log(isValidToken, "isValidToken");
  const userData = await prisma.user.findUnique({
    where: {
      email: isValidToken.email,
    },
  });

  if (!userData) {
    throw new ApiError(404, "User not found");
  }
  // hash password
  const password = await bcrypt.hash(newPassword, 12);

  // update into database
  await prisma.user.update({
    where: {
      id: userData.id,
    },
    data: {
      password,
    },
  });
  return { message: "Password reset successfully" };
};

// change password
const changePassword = async (
  userId: string,
  newPassword: string,
  oldPassword: string
) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user || !user?.password) {
    throw new ApiError(404, "User not found");
  }

  const isPasswordValid = await bcrypt.compare(oldPassword, user?.password);

  if (!isPasswordValid) {
    throw new ApiError(401, "Incorrect old password");
  }

  const hashedPassword = await bcrypt.hash(newPassword, 12);

  await prisma.user.update({
    where: {
      id: userId,
    },
    data: {
      password: hashedPassword,
    },
  });
  return { message: "Password changed successfully" };
};

// -----------------------------------------------------------------
// SOCIAL LOGIN
// -----------------------------------------------------------------

// const socialLogin = async (payload: ISocialUser) => {
//   const user = await prisma.user.findUnique({
//     where: {
//       email: payload.email,
//     },
//   });

//   if (user?.userStatus === UserStatus.BLOCKED) {
//     throw new ApiError(403, "Your account is blocked");
//   }

//   if (user?.isDeleted) {
//     throw new ApiError(404, "User not found");
//   }

//   const result = await prisma.$transaction(async (TransactionClient) => {
//     const customerId =
//       "#" +
//       payload?.firstName?.slice(0, 2) +
//       payload?.lastName?.slice(0, 2) +
//       Math.floor(Math.random() * 1000000);
//     // user exists

//     if (user) {
//       const accessToken = jwtHelpers.generateToken(
//         {
//           id: user.id,
//           email: user.email,
//           role: user.role,
//         },
//         config.jwt.jwt_secret as Secret,
//         config.jwt.expires_in as string
//       );

//       return { accessToken };
//     } else {
//       // user does not exist, create account in user & customer table
//       await TransactionClient.user.create({
//         data: {
//           email: payload.email,
//           role: "CUSTOMER",
//           userStatus: "ACTIVE",
//           profileImage: payload.profileImage,
//         },
//       });

//       await TransactionClient.customer.create({
//         data: {
//           customerId: customerId,
//           firstName: payload.firstName,
//           lastName: payload.lastName,
//           email: payload.email,
//         },
//       });

//       const newUser = await TransactionClient.user.findUnique({
//         where: {
//           email: payload.email,
//         },
//       });

//       const accessToken = jwtHelpers.generateToken(
//         {
//           id: newUser?.id,
//           email: newUser?.email,
//           role: newUser?.role,
//         },
//         config.jwt.jwt_secret as Secret,
//         config.jwt.expires_in as string
//       );

//       return { accessToken };
//     }
//   });

//   return result;
// };

export const AuthServices = {
  loginUser,
  sendOtp,
  enterOtp,
  getMyProfile,
  changePassword,
  forgotPassword,
  resetPassword,
  // socialLogin,
};
