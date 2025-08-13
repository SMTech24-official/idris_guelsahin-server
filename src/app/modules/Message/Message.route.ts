import { Router } from "express";
import { messageController } from "./Message.controller";

const router = Router();

// create message
router.post("/create", messageController.createMessage);

// get all message
router.get("/", messageController.getAllMessages);

// get single message by id
router.get("/:id", messageController.getSingleMessage);

// update message
router.put("/:id", messageController.updateMessage);

// delete message
router.delete("/:id", messageController.deleteMessage);

export const messageRoutes = router;
