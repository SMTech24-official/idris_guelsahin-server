import express from "express";

import { AuthRoutes } from "../modules/Auth/auth.routes";
import { UserRoutes } from "../modules/User/user.route";
import { categoryRoutes } from "../modules/Category/Category.route";
import { productRoutes } from "../modules/Product/Product.route";
import { planRoutes } from "../modules/Plan/Plan.route";
import { subscriptionRoutes } from "../modules/Subscription/Subscription.route";
import { metricsRoutes } from "../modules/Metrics/Metrics.route";
import { favoriteRoutes } from "../modules/Favorite/Favorite.route";
import { contactRoutes } from "../modules/Contact/Contact.route";


const router = express.Router();

const moduleRoutes = [
  {
    path: "/auth",
    route: AuthRoutes,
  },

  {
    path: "/user",
    route: UserRoutes,
  },
  {
    path: "/category",
    route: categoryRoutes,
  },
  {
    path: "/product",
    route: productRoutes,
  },
  {
    path: "/plan",
    route: planRoutes,
  },
  {
    path: "/subscription",
    route: subscriptionRoutes,
  },
  {
    path: "/favorite",
    route: favoriteRoutes,
  },
  {
    path: "/contact",
    route: contactRoutes,
  },
  {
    path: "/metrics",
    route: metricsRoutes,
  },
];

moduleRoutes.forEach((route) => router.use(route.path, route.route));

export default router;
