import bcrypt from "bcrypt";
import prisma from "../../shared/prisma";
import { User } from "@prisma/client";

export const initiateSuperAdmin = async () => {
  const payload: Partial<User> = {
    firstName: "Super" as string,
    lastName: "Admin" as string,
    email: "admin@gmail.com" as string,
    mobileNo: "1234567890" as string,
    currentAddress: "123 Main St" as string,
    password: "123456" as string,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const existingSuperAdmin = await prisma.user.findUnique({
    where: { email: payload.email },
  });

  if (existingSuperAdmin) {
    return;
  }

  await prisma.$transaction(async (TransactionClient) => {
    const hashedPassword: string = await bcrypt.hash(
      payload.password as string,
      12
    );
    // const adminId =
    //   "#" +
    //   payload?.firstName?.slice(0, 1).toUpperCase() +
    //   payload?.lastName?.slice(0, 1).toUpperCase() +
    //   Math.floor(Math.random() * 1000000);

    await TransactionClient.user.create({
      data: {
        firstName: payload.firstName as string,
        lastName: payload.lastName as string,
        email: payload.email as string,
        mobileNo: payload.mobileNo as string,
        currentAddress: payload.currentAddress as string,
        password: hashedPassword,
        role: "SUPER_ADMIN",
        userStatus: "ACTIVE",
        emailVerified: true,
      },
    });
  });
};
