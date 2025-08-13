import prisma from "../../../shared/prisma";
import QueryBuilder from "../../../helpars/queryBuilder";
import ApiError from "../../../errors/ApiErrors";
import httpStatus from "http-status";

const createMessage = async (data: any) => {

//if you wanna add logic here
    const result = await prisma.message.create({ data });
    return result;
};

const getAllMessages = async (query: Record<string, any>) => {
    const queryBuilder = new QueryBuilder(prisma.message, query);
    const messages = await queryBuilder
        .search([""])
        .filter()
        .sort()
        .paginate()
        .fields()
        .execute()

    const meta = await queryBuilder.countTotal();
    return { meta, data: messages };
};

const getSingleMessage = async (id: string) => {
    const result = await prisma.message.findUnique({ where: { id } });
    if(!result){
     throw new ApiError(httpStatus.NOT_FOUND, "Message not found..!!")
    }
    return result;
};

const updateMessage = async (id: string, data: any) => {
    const existingMessage = await prisma.message.findUnique({ where: { id } });
    if (!existingMessage) {
        throw new ApiError(httpStatus.NOT_FOUND, "Message not found..!!");
    }
    const result = await prisma.message.update({ where: { id }, data });
    return result;
};

const deleteMessage = async (id: string) => {
 const existingMessage = await prisma.message.findUnique({ where: { id } });
    if (!existingMessage) {
        throw new ApiError(httpStatus.NOT_FOUND, "Message not found..!!");
    }
    const result = await prisma.message.delete({ where: { id } });
    return null;
};

export const messageService = {
    createMessage,
    getAllMessages,
    getSingleMessage,
    updateMessage,
    deleteMessage,
};
