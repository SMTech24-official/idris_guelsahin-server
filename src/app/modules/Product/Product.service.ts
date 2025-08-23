import prisma from "../../../shared/prisma";
import QueryBuilder from "../../../helpars/queryBuilder";
import ApiError from "../../../errors/ApiErrors";
import httpStatus from "http-status";
import { TProduct } from "./Product.interface";
import { ProductStatus, UserRole } from "@prisma/client";
import generateUniqueSlug from "../../../utils/slugify";

const createProduct = async (data: TProduct, userId: string) => {


  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (user && user.role !== UserRole.SELLER) {
    throw new ApiError(
      httpStatus.UNAUTHORIZED,
      `Only seller can create a product`
    );
  }
  const existingCategory = await prisma.category.findUnique({
    where: { id: data.categoryId, isActive: true },
  });

  if (!existingCategory) {
    throw new ApiError(httpStatus.NOT_FOUND, "Category not found..!!");
  }
  data.slug = await generateUniqueSlug(data.name, prisma, "product");
  data.userId = userId;

  
  //if you wanna add logic here
  const result = await prisma.product.create({ data });
  return result;
};

const getMyProducts = async (query: Record<string, any>) => {
  const queryBuilder = new QueryBuilder(prisma.product, query);
  const products = await queryBuilder
    .search([""])
    .filter()
    .sort()
    .paginate()
    .fields()
    .include({
      category: {
        select: {
          id: true,
          name: true,
          slug: true,
        },
      },
    })
    .execute();

  const meta = await queryBuilder.countTotal();

  return { meta, data: products };
};
const getAllProducts = async (query: Record<string, any>, userId: string) => {
  const queryBuilder = new QueryBuilder(prisma.product, query);
  const products = await queryBuilder
    .search([""])
    .filter()
    .sort()
    .paginate()
    .fields()
    .include({
      category: {
        select: {
          id: true,
          name: true,
          slug: true,
        },
      },
      user: {
        select: {
          id: true,
          fullName: true,
          profileImage: true,
        },
      }
    })
    .execute();

  const meta = await queryBuilder.countTotal();

  if (userId) {
    const favouriteProducts = await prisma.favorite.findMany({
      where: { userId },
      select: { productId: true },
    });
    const favouriteProductIds = new Set(
      favouriteProducts.map((fav) => fav.productId)
    );
    products.forEach((product: any) => {
      (product as any).isFavorite = favouriteProductIds.has(product.id);
    }
    );
  }
  return { meta, data: products };
};

const getSingleProduct = async (id: string) => {
  const result = await prisma.product.findUnique({
    where: { id },
    include: {
      category: {
        select: {
          id: true,
          name: true,
          slug: true,
        },
      },
      user: {
        select: {
          id: true,
          fullName: true,
          profileImage: true,
        },
      },
    },
  });
  if (!result) {
    throw new ApiError(httpStatus.NOT_FOUND, "Product not found..!!");
  }
  return result;
};

const updateProduct = async (id: string, data: any) => {
  const existingProduct = await prisma.product.findUnique({ where: { id } });
  if (!existingProduct) {
    throw new ApiError(httpStatus.NOT_FOUND, "Product not found..!!");
  }
  if (existingProduct.name !== data.name) {
    data.slug = await generateUniqueSlug(data.name, prisma, "product");
  }
  const result = await prisma.product.update({ where: { id }, data });
  return result;
};

const updateProductStatus = async (
  id: string,
  data: { status: ProductStatus }
) => {
  const existingProduct = await prisma.product.findUnique({ where: { id } });
  if (!existingProduct) {
    throw new ApiError(httpStatus.NOT_FOUND, "Product not found..!!");
  }

  const result = await prisma.product.update({
    where: { id },
    data: { status: data.status },
  });

  return result;
};

const deleteProduct = async (id: string) => {
  const existingProduct = await prisma.product.findUnique({ where: { id } });
  if (!existingProduct) {
    throw new ApiError(httpStatus.NOT_FOUND, "Product not found..!!");
  }
  const result = await prisma.product.delete({ where: { id } });
  return null;
};

export const productService = {
  createProduct,
  getMyProducts,
  getAllProducts,
  getSingleProduct,
  updateProduct,
  updateProductStatus,
  deleteProduct,
};
