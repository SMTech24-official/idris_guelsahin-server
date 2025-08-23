import prisma from "../../../shared/prisma";
import QueryBuilder from "../../../helpars/queryBuilder";
import ApiError from "../../../errors/ApiErrors";
import httpStatus from "http-status";
import { TContact } from "./Contact.interface";
import { ContactEmailTemplate } from "../../../utils/ContactEmailTemplate";
import { emailSenderForContact } from "../../../helpars/emailSender";

const createContact = async (data: TContact) => {
  //if you wanna add logic here
  const result = await ContactEmailTemplate(data);
  await prisma.contact.create({ data });
  emailSenderForContact( data.email, result);
  return;
};

const getAllContacts = async (query: Record<string, any>) => {
  const queryBuilder = new QueryBuilder(prisma.contact, query);
  const contacts = await queryBuilder
    .search([""])
    .filter()
    .sort()
    .paginate()
    .fields()
    .execute();

  const meta = await queryBuilder.countTotal();
  return { meta, data: contacts };
};

const getSingleContact = async (id: string) => {
  const result = await prisma.contact.findUnique({ where: { id } });
  if (!result) {
    throw new ApiError(httpStatus.NOT_FOUND, "Contact not found..!!");
  }
  return result;
};

const updateContact = async (id: string, data: any) => {
  const existingContact = await prisma.contact.findUnique({ where: { id } });
  if (!existingContact) {
    throw new ApiError(httpStatus.NOT_FOUND, "Contact not found..!!");
  }
  const result = await prisma.contact.update({ where: { id }, data });
  return result;
};

const deleteContact = async (id: string) => {
  const existingContact = await prisma.contact.findUnique({ where: { id } });
  if (!existingContact) {
    throw new ApiError(httpStatus.NOT_FOUND, "Contact not found..!!");
  }
  const result = await prisma.contact.delete({ where: { id } });
  return null;
};

export const contactService = {
  createContact,
  getAllContacts,
  getSingleContact,
  updateContact,
  deleteContact,
};
