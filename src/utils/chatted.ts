import { z } from "zod";
import prisma from "../shared/prisma";
import { WebSocket, WebSocketServer } from "ws";

const chatSchemas = {
  joinChat: z.object({
    chatroomId: z.string().optional(),
    reciverId: z.string().optional(),
  }),
  sendMessage: z.object({
    chatroomId: z.string(),
    content: z.string().min(1),
  }),
  typing: z.object({
    chatroomId: z.string(),
    isTyping: z.boolean(),
  }),
  readReceipt: z.object({
    messageId: z.string(),
    chatroomId: z.string(),
  }),
};

export const clients = new Map<string, WebSocket>(); // userId -> ws

const ChatHandler = async (wss: WebSocketServer, ws: WebSocket) => {
  const userId = ws.userId;
  clients.set(userId, ws);
  await sendChatMembers(userId, ws);

  ws.on("message", async (raw) => {
    try {
      const msg = JSON.parse(raw.toString());
      const { event, data } = msg;
      console.log(msg, "ji");

      switch (event) {
        case "refreshChatMembers":
          sendChatMembers(userId, ws);

          break;

        case "joinChat":
          await handleJoinChat(userId, data, ws);
          break;

        case "allMessages":
          await handleAllMessages(userId, data, ws);
          break;

        case "sendMessage":
          await handleSendMessage(userId, data);
          break;

        case "typing":
          await handleTyping(userId, data);
          break;

        case "markAsRead":
          await handleReadReceipt(userId, data);
          break;

        default:
          break;
      }
    } catch (err) {
      sendError(ws, "Invalid message", err);
    }
  });

  ws.on("close", () => {
    clients.delete(userId);
  });
};

// Function to chat

const sendChatMembers = async (userId: string, ws: WebSocket) => {
  try {
    const chats = await getChatMembersWithMetadata(userId);
    ws.send(JSON.stringify({ event: "chatMembers", data: chats }));
  } catch (error) {
    handleError(ws, "Failed to fetch chat members", error);
  }
};

async function handleJoinChat(userId: string, rawData: any, ws: WebSocket) {
  try {
    console.log(rawData, "rawData");
    const { chatroomId, reciverId } = chatSchemas.joinChat.parse(rawData);

    if (chatroomId) {
      const messages = await prisma.message.findMany({
        where: { chatroomId },
        include: {
          sender: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              profileImage: true,
            },
          },
        },
        orderBy: { createdAt: "asc" },
      });

      await markMessagesAsRead(chatroomId, userId);
      ws.send(JSON.stringify({ event: "messageHistory", data: messages }));
    } else if (reciverId && reciverId !== userId) {
      const existingChat = await prisma.chatRoom.findFirst({
        where: {
          OR: [
            { user1Id: userId, user2Id: reciverId },
            { user1Id: reciverId, user2Id: userId },
          ],
        },
      });

      if (existingChat) {
        const messages = await prisma.message.findMany({
          where: { chatroomId: existingChat.id },
          include: {
            sender: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                profileImage: true,
              },
            },
          },
          orderBy: { createdAt: "asc" },
        });

        await markMessagesAsRead(existingChat.id, userId);
        ws.send(JSON.stringify({ event: "messageHistory", data: messages }));
        return;
      }
      const chat = await prisma.chatRoom.create({
        data: {
          user1Id: userId,
          user2Id: reciverId,
        },
      });
      console.log("chat created", chat);
      ws.send(JSON.stringify({ event: "messageHistory", data: null }));
    }
  } catch (err) {
    console.log(err, "error in handleJoinChat");
    sendError(ws, "Failed to join chat", err);
  }
}

async function handleAllMessages(userId: string, data: any, ws: WebSocket) {
  try {
    const { reciverId } = chatSchemas.joinChat.parse(data);
    const existingChat = await prisma.chatRoom.findFirst({
      where: {
        OR: [
          { user1Id: userId, user2Id: reciverId },
          { user1Id: reciverId, user2Id: userId },
        ],
      },
    });

    if (!existingChat) {
      throw new Error("Chat not found");
    }
    const messages = await prisma.message.findMany({
      where: { chatroomId: existingChat.id },
      include: {
        sender: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            profileImage: true,
          },
        },
      },
      orderBy: { createdAt: "asc" },
    });

    await markMessagesAsRead(existingChat.id, userId);
    ws.send(JSON.stringify({ event: "messageHistory", data: messages }));
    return;
  } catch (error) {}
}

async function handleSendMessage(userId: string, rawData: any) {
  try {
    const { chatroomId, content } = chatSchemas.sendMessage.parse(rawData);

    const message = await prisma.message.create({
      data: {
        chatroomId,
        senderId: userId,
        content,
        isRead: false,
      },
      include: {
        sender: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            profileImage: true,
          },
        },
      },
    });

    // Notify all participants
    const chat = await prisma.chatRoom.findUnique({
      where: { id: chatroomId },
    });
    if (!chat) return;

    [chat.user1Id, chat.user2Id].forEach((uid) => {
      const client = clients.get(uid);
      if (client) {
        client.send(JSON.stringify({ event: "receiveMessage", data: message }));
      }
    });
  } catch (err) {
    console.error("Failed to send message", err);
  }
}

async function handleTyping(userId: string, rawData: any) {
  try {
    const { chatroomId, isTyping } = chatSchemas.typing.parse(rawData);

    const chat = await prisma.chatRoom.findUnique({
      where: { id: chatroomId },
    });
    if (!chat) return;

    const otherUserId = chat.user1Id === userId ? chat.user2Id : chat.user1Id;
    const otherSocket = clients.get(otherUserId);

    if (otherSocket) {
      otherSocket.send(
        JSON.stringify({ event: "typing", data: { userId, isTyping } })
      );
    }
  } catch (err) {
    console.error("Typing error", err);
  }
}

async function handleReadReceipt(userId: string, rawData: any) {
  try {
    const { messageId, chatroomId } = chatSchemas.readReceipt.parse(rawData);

    await prisma.message.update({
      where: { id: messageId },
      data: { isRead: true },
    });

    const chat = await prisma.chatRoom.findUnique({
      where: { id: chatroomId },
    });
    if (!chat) return;

    [chat.user1Id, chat.user2Id].forEach((uid) => {
      const client = clients.get(uid);
      if (client) {
        client.send(
          JSON.stringify({ event: "messageRead", data: { messageId } })
        );
      }
    });
  } catch (err) {
    console.error("Read receipt error", err);
  }
}

async function markMessagesAsRead(chatroomId: string, userId: string) {
  await prisma.message.updateMany({
    where: {
      chatroomId,
      isRead: false,
      senderId: { not: userId },
    },
    data: { isRead: true },
  });
}

function sendError(ws: WebSocket, message: string, error?: any) {
  ws.send(
    JSON.stringify({
      event: "chatError",
      data: {
        message,
        error: error?.message || error || "Unknown error",
      },
    })
  );
}

// Replace this with your real authentication logic
function getUserIdFromRequest(req: any): string | null {
  const url = new URL(req.url!, `http://${req.headers.host}`);
  return url.searchParams.get("userId"); // or get from token
}

export async function getChatMembersWithMetadata(userId: string) {
  console.log(userId, "userId");
  const chatRooms = await prisma.chatRoom.findMany({
    where: {
      OR: [{ user1Id: userId }, { user2Id: userId }],
    },
    include: {
      user1: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          profileImage: true,
          isOnline: true,
          lastSeen: true,
        },
      },
      user2: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          profileImage: true,
          isOnline: true,
          lastSeen: true,
        },
      },
      messages: {
        orderBy: { createdAt: "desc" },
        take: 1, // Get only the last message
        select: {
          id: true,
          content: true,
          createdAt: true,
          isRead: true,
          senderId: true,
        },
      },
    },
    orderBy: { updatedAt: "desc" },
  });
  // console.log(chatRooms, 'ss');
  const membersMap = new Map();

  for (const room of chatRooms) {
    const otherUser = room.user1Id === userId ? room.user2 : room.user1;
    const otherUserId = otherUser ? otherUser.id : null;

    // Get the last message (we included it with take:1)
    const lastMessage = room.messages[0] || null;

    // Calculate unread count for this chat room
    const unreadCount = await prisma.message.count({
      where: {
        chatroomId: room.id,
        senderId: { not: userId },
        isRead: false,
      },
    });

    if (!membersMap.has(otherUserId)) {
      membersMap.set(otherUserId, {
        user: otherUser,
        lastMessage: lastMessage?.content || null,
        lastMessageTime: lastMessage?.createdAt || room.createdAt,
        unreadCount,
        chatRoomId: room.id, // include chat room ID for reference
      });
    } else {
      // Update if we find a newer message (shouldn't happen with our query but just in case)
      const existing = membersMap.get(otherUserId);
      if (
        lastMessage &&
        (!existing.lastMessageTime ||
          lastMessage.createdAt > existing.lastMessageTime)
      ) {
        existing.lastMessage = lastMessage.content;
        existing.lastMessageTime = lastMessage.createdAt;
        existing.unreadCount = unreadCount;
      }
    }
  }

  return Array.from(membersMap.values());
}

export function handleError(ws: WebSocket, message: string, error: any) {
  console.error(message, error);
  ws.emit("chatError", { message, error: error.message });
}

export default ChatHandler;
