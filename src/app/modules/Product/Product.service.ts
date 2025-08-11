import prisma from "../../../shared/prisma";
import QueryBuilder from "../../../helpars/queryBuilder";
import ApiError from "../../../errors/ApiErrors";
import httpStatus from "http-status";
import { TProduct } from "./Product.interface";
import { ProductStatus, UserRole } from "@prisma/client";
import generateUniqueSlug from "../../../utils/slugify";

const createProduct = async (data: TProduct, userId: string) => {
  console.log(data, "dd");
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

  console.log(data.slug, "dd");
  //if you wanna add logic here
  const result = await prisma.product.create({ data });
  return result;
};

const getAllProducts = async (query: Record<string, any>) => {
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
  getAllProducts,
  getSingleProduct,
  updateProduct,
  updateProductStatus,
  deleteProduct,
};
