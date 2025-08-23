import { Router } from "express";
import { contactController } from "./Contact.controller";
import auth from "../../middlewares/auth";
import { UserRole } from "@prisma/client";

const router = Router();

// create contact
router.post("/send-message", contactController.createContact);

// get all contact
router.get(
  "/",
  auth(UserRole.SUPER_ADMIN, UserRole.ADMIN),
  contactController.getAllContacts
);

// get single contact by id
router.get(
  "/:id",
  auth(UserRole.SUPER_ADMIN, UserRole.ADMIN),
  contactController.getSingleContact
);

// update contact
router.put(
  "/:id",
  auth(UserRole.SUPER_ADMIN, UserRole.ADMIN),
  contactController.updateContact
);

// delete contact
router.delete(
  "/:id",
  auth(UserRole.SUPER_ADMIN, UserRole.ADMIN),
  contactController.deleteContact
);

export const contactRoutes = router;
