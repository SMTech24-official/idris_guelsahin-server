import { Router } from "express";
import { favoriteController } from "./Favorite.controller";
import auth from "../../middlewares/auth";
import validateRequest from "../../middlewares/validateRequest";
import { FavoriteSchema } from "./Favorite.validation";

const router = Router();

// create favorite
router.post("/add", auth(), validateRequest(FavoriteSchema), favoriteController.createFavorite);

// get all favorite
router.get("/my-favorites", auth(), favoriteController.getAllMyFavorites);

// get single favorite by id
router.get("/:id", auth(), favoriteController.getSingleFavorite);


export const favoriteRoutes = router;
