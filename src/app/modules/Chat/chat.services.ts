// import { UserRole } from "@prisma/client";
// import httpStatus from "http-status";
// import ApiError from "../../../errors/ApiErrors";
// import prisma from "../../../shared/prisma";

import httpStatus from "http-status";
import ApiError from "../../../errors/ApiErrors";
import prisma from "../../../shared/prisma";


const getMessageHistory = async (
    chatId: string,
) => {


  const chat = await prisma.chatRoom.findUnique({
    where: { id: chatId },
    include: {
      user1: {
        select: {
          id: true,
          fullName: true,
          email: true,
          profileImage: true,
        },
      },
      user2: {
        select: {
          id: true,
          fullName: true,
          email: true,
          profileImage: true,
        },
      },

      messages: true,
    },
  });

  if (!chat) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Chat not found")
  }
  
  return chat
};

export const chatServices = {
  getMessageHistory,
}
