import express from "express";

import { AuthRoutes } from "../modules/Auth/auth.routes";
import { UserRoutes } from "../modules/User/user.route";
import { categoryRoutes } from "../modules/Category/Category.route";
import { productRoutes } from "../modules/Product/Product.route";
import { planRoutes } from "../modules/Plan/Plan.route";


// import { paymentRoutes } from "../modules/Payment/payment.route";

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
];

moduleRoutes.forEach((route) => router.use(route.path, route.route));

export default router;
