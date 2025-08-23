import prisma from "../../../shared/prisma";
import QueryBuilder from "../../../helpars/queryBuilder";
import ApiError from "../../../errors/ApiErrors";
import httpStatus from "http-status";
import { TFavorite } from "./Favorite.interface";

const createFavorite = async (data: TFavorite) => {
  const existingProduct = await prisma.product.findUnique({
    where: { id: data.productId },
  });
  if (!existingProduct) {
    throw new ApiError(httpStatus.NOT_FOUND, "Product not found");
  }
  // Check if the favorite already exists for the user and item
  const existingFavorite = await prisma.favorite.findUnique({
    where: {
      uniqueFavorite: {
        userId: data.userId,
        productId: data.productId,
      },
    },
  });

  if (existingFavorite) {
    await prisma.favorite.delete({ where: { id: existingFavorite.id } });
    return {
      message: `${existingProduct.name} removed from favorites successfully`,
      data: null,
    };
  }

  const result = await prisma.favorite.create({
    data: {
      userId: data.userId,
      productId: data.productId,
    },
  });

  return {
    message: `${existingProduct.name} added to favorites successfully`,
    data: result,
  };
};

const getAllFavorites = async (query: Record<string, any>) => {
  const queryBuilder = new QueryBuilder(prisma.favorite, query);
  const favorites = await queryBuilder
    .search([""])
    .filter()
    .sort()
    .paginate()
    .fields()
    .include({
      user: {
        select: {
          id: true,
          fullName: true,
          email: true,
          profileImage: true,
        },
      },
      product: true,
    })
    .execute();
  const meta = await queryBuilder.countTotal();

  return { meta, data: favorites };
};

const getSingleFavorite = async (id: string) => {
    const favorite = await prisma.favorite.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            email: true,
            profileImage: true,
          },
        },
        product: true,
      },
    });
  if (!favorite) {
    throw new ApiError(httpStatus.NOT_FOUND, "Favorite not found..!!");
  }


};


export const favoriteService = {
  createFavorite,
  getAllFavorites,
  getSingleFavorite,
};
