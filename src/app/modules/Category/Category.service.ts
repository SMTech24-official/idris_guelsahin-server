import prisma from "../../../shared/prisma";
import QueryBuilder from "../../../helpars/queryBuilder";
import ApiError from "../../../errors/ApiErrors";
import httpStatus from "http-status";
import { TCategory } from "./Category.interface";
import generateUniqueSlug from "../../../utils/slugify";

const createCategory = async (data: TCategory) => {
  const existingCategory = await prisma.category.findUnique({
    where: { name: data.name },
  });
  if (existingCategory) {
    throw new ApiError(httpStatus.CONFLICT, "Category already exists");
  }

  data.slug = await generateUniqueSlug(data.name, prisma, "category");
  //if you wanna add logic here
  const result = await prisma.category.create({ data });
  return result;
};

const getAllCategorys = async (query: Record<string, any>) => {
  const queryBuilder = new QueryBuilder(prisma.category, query);
  const categorys = await queryBuilder
    .search([""])
    .filter()
    .sort()
    .paginate()
    .fields()
    .execute();

  const meta = await queryBuilder.countTotal();
  return { meta, data: categorys };
};

const getSingleCategory = async (slug: string) => {
  const result = await prisma.category.findUnique({
    where: { slug },
    include: { products: true },
  });
  if (!result) {
    throw new ApiError(httpStatus.NOT_FOUND, "Category not found..!!");
  }
  return result;
};

const updateCategory = async (id: string, data: any) => {
  const existingCategory = await prisma.category.findUnique({ where: { id } });
  if (!existingCategory) {
    throw new ApiError(httpStatus.NOT_FOUND, "Category not found..!!");
  }
    if (existingCategory.name !== data.name) {
      data.slug = await generateUniqueSlug(data.name, prisma, "category");
    }
  const result = await prisma.category.update({ where: { id }, data });
  return result;
};

const deleteCategory = async (id: string) => {
  const existingCategory = await prisma.category.findUnique({ where: { id } });
  if (!existingCategory) {
    throw new ApiError(httpStatus.NOT_FOUND, "Category not found..!!");
  }
  const result = await prisma.category.delete({ where: { id } });
  return null;
};

export const categoryService = {
  createCategory,
  getAllCategorys,
  getSingleCategory,
  updateCategory,
  deleteCategory,
};
