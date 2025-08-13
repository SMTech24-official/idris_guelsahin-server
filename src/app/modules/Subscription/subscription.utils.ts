import app from "../../../app";
import prisma from "../../../shared/prisma";




// 1. First, create a service to check user subscription and features
export class SubscriptionService {
  async getUserCurrentSubscription(userId: string) {
    const subscription = await prisma.subscription.findFirst({
      where: {
        userId,
        status: "active", // or whatever status indicates active subscription
        currentPeriodEnd: {
          gte: new Date(), // Ensure subscription hasn't expired
        },
      },
      include: {
        plan: true,
      },
    });

    // If no active subscription, return free plan features
    if (!subscription) {
      return this.getFreePlanFeatures();
    }

    return {
      planName: subscription.plan.name,
      features: subscription.plan.features,
      maxAds: this.getMaxAdsForPlan(subscription.plan.name),
      canAccessPremiumFeatures: this.canAccessPremiumFeatures(
        subscription.plan.name
      ),
    };
  }

  private getFreePlanFeatures() {
    return {
      planName: "Free Plan",
      features: [
        "Publication of 1 advertisement",
        "Basic visibility",
        "Access to public company data",
        "Standard search function",
        "Registration & expression of interest possible",
      ],
      maxAds: 1,
      canAccessPremiumFeatures: false,
    };
  }

  private getMaxAdsForPlan(planName: string): number {
    const limits: Record<string, number> = {
      Free: 1,
      Basic: 1,
      Standard: 10,
      Premium: -1, // -1 means unlimited
    };
    return limits[planName] || 1;
  }

  private canAccessPremiumFeatures(planName: string): boolean {
    return ["Standard", "Premium"].includes(planName);
  }

  async canUserCreateAd(
    userId: string
  ): Promise<{ allowed: boolean; reason?: string }> {
    const userSubscription = await this.getUserCurrentSubscription(userId);

    // Count current active ads
    const currentAdsCount = await prisma.product.count({
      where: {
        // Assuming you have a userId field in Product model
        // You might need to add this field or relate it through another model
        status: "ACCEPTED", // Only count active/accepted ads
      },
    });

    if (userSubscription.maxAds === -1) {
      return { allowed: true }; // Unlimited
    }

    if (currentAdsCount >= userSubscription.maxAds) {
      return {
        allowed: false,
        reason: `You've reached your plan limit of ${userSubscription.maxAds} advertisement(s). Upgrade your plan to post more.`,
      };
    }

    return { allowed: true };
  }
}

// 2. Middleware to check subscription access
export const checkSubscriptionAccess = (requiredFeature: string) => {
  return async (req: any, res: any, next: any) => {
    try {
      const userId = req.user.id; // Assuming you have user in request from auth middleware
      const subscriptionService = new SubscriptionService();

      const userSubscription =
        await subscriptionService.getUserCurrentSubscription(userId);

      // Check if user has the required feature
      const hasFeature = userSubscription.features.some((feature: string) =>
        feature.toLowerCase().includes(requiredFeature.toLowerCase())
      );

      if (!hasFeature) {
        return res.status(403).json({
          success: false,
          message: `This feature requires a higher subscription plan. Your current plan: ${userSubscription.planName}`,
          requiredFeature,
          currentPlan: userSubscription.planName,
          upgradeRequired: true,
        });
      }

      req.userSubscription = userSubscription;
      next();
    } catch (error:any) {
      return res.status(500).json({
        success: false,
        message: "Error checking subscription access",
        error: error.message,
      });
    }
  };
};

// 3. Usage examples in your routes


// // Premium features route (e.g., accessing business analytics)
// app.get(
//   "/api/analytics",
//   authenticateUser,
//   checkSubscriptionAccess("analysis tools"),
//   async (req, res) => {
//     // This route is only accessible to Standard/Premium users
//     // Your analytics logic here
//     res.json({
//       success: true,
//       message: "Analytics data",
//       data: {
//         /* analytics data */
//       },
//     });
//   }
// );






// // 6. API endpoint to get user subscription info
// app.get("/api/user/subscription", authenticateUser, async (req, res) => {
//   try {
//     const userId = req.user.id;
//     const subscriptionService = new SubscriptionService();

//     const subscription = await subscriptionService.getUserCurrentSubscription(
//       userId
//     );

//     // Get current ads count
//     const currentAdsCount = await prisma.product.count({
//       where: {
//         userId: userId,
//         status: "ACCEPTED",
//       },
//     });

//     res.json({
//       success: true,
//       subscription: {
//         ...subscription,
//         currentAdsCount,
//       },
//     });
//   } catch (error) {
//     res.status(500).json({
//       success: false,
//       message: "Error fetching subscription info",
//       error: error.message,
//     });
//   }
// });
