import { UserRole, VerificationStatus } from "@prisma/client";
import prisma from "../../../shared/prisma";

const getOverview = async () => {
  const totalUser = await prisma.user.count();
  const totalSubscriber = await prisma.subscription.count({
    where: {
      status: "active",
    },
  });
  const totalProducts = await prisma.product.count();
  const pendingProduct = await prisma.product.count({
    where: {
      status: "PENDING",
    },
  });

  return {
    totalUser,
    totalSubscriber,
    totalProducts,
    pendingProduct,
  };
};

const getRevenue = async () => {
  const currentDate = new Date();
  const twelveMonthsAgo = new Date();
  twelveMonthsAgo.setMonth(currentDate.getMonth() - 12);

  const monthNames = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  const lastTwelveMonths = [];
  for (let i = 11; i >= 0; i--) {
    const d = new Date(currentDate);
    d.setMonth(currentDate.getMonth() - i);
    lastTwelveMonths.push(monthNames[d.getMonth()]);
  }

  const subscriptions = await prisma.subscription.findMany({
    where: {
      status: "active",
      createdAt: {
        gte: twelveMonthsAgo,
      },
    },
    include: {
      plan: {
        select: {
          price: true,
          duration: true,
        },
      },
    },
  });

  const monthlyRevenueMap = new Map<string, number>();
  lastTwelveMonths.forEach((month) => monthlyRevenueMap.set(month, 0));

  subscriptions.forEach((sub) => {
    const month = monthNames[new Date(sub.createdAt).getMonth()];
    if (monthlyRevenueMap.has(month)) {
      const currentRevenue = monthlyRevenueMap.get(month) || 0;
      if (sub.plan?.duration === "MONTHLY") {
        monthlyRevenueMap.set(month, currentRevenue + (sub.plan?.price || 0));
      }
    }
  });

  const monthlyRevenue = Array.from(monthlyRevenueMap.entries()).map(
    ([month, revenue]) => ({
      name: month,
      revenue: revenue,
    })
  );

  return monthlyRevenue;
};

const sellerVerificationRequested = async (year: number) => {
  const startDate = new Date(year, 0, 1);
  const endDate = new Date(year, 11, 31, 23, 59, 59, 999);

  const sellerRequests = await prisma.user.findMany({
    where: {
      verificationStatus: VerificationStatus.REQUESTED,
      role: UserRole.USER,
      createdAt: {
        gte: startDate,
        lte: endDate,
      },
    },
    select: {
      fullName: true,
      email: true,
      mobileNumber: true,
      createdAt: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  const count = await prisma.user.count({
    where: {
      verificationStatus: VerificationStatus.REQUESTED,
      role: UserRole.USER,
      createdAt: {
        gte: startDate,
        lte: endDate,
      },
    },
  });

  return { count, requests: sellerRequests };
};

const recentSubscriberList = async (date = new Date()) => {
  const startOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
  const endOfMonth = new Date(
    date.getFullYear(),
    date.getMonth() + 1,
    0,
    23,
    59,
    59,
    999
  );

  const subscribers = await prisma.subscription.findMany({
    where: {
      status: "active",
      createdAt: {
        gte: startOfMonth,
        lte: endOfMonth,
      },
    },
    include: {
      user: {
        select: {
          fullName: true,
          email: true,
          mobileNumber: true,
        },
      },
      plan: {
        select: {
          name: true,
          price: true,
          currency: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return subscribers.map((sub) => ({
    name: sub.user.fullName,
    email: sub.user.email,
    mobileNumber: sub.user.mobileNumber,
    plan: `${sub.plan.name} (${sub.plan.price} ${sub.plan.currency}/Monat)`,
  }));
};

export const metricsService = {
  getOverview,
  getRevenue,
  sellerVerificationRequested,
  recentSubscriberList,
};
