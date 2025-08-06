import { Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { corsOptions } from "../app";
import { jwtHelpers } from "./jwtHelpers";
import config from "../config";
import { Secret } from "jsonwebtoken";
import prisma from "../shared/prisma";
import ChatHandler from "../utils/chatted";

declare module "ws" {
  interface WebSocket {
    user: any;
    userId: string;
    isAlive: boolean;
  }
}

let wss: WebSocketServer;

export function socketIo(server: Server) {
  // Initialize Socket.io with the server and CORS options
  wss = new WebSocketServer({
    server,
    perMessageDeflate: {
      zlibDeflateOptions: {
        chunkSize: 1024,
        memLevel: 7,
        level: 3,
      },
      zlibInflateOptions: {
        chunkSize: 10 * 1024,
      },
      clientNoContextTakeover: true,
      serverNoContextTakeover: true,
      concurrencyLimit: 10,
      threshold: 1024, // Size threshold for compression
    },
  });

  wss.on("connection", async (ws: WebSocket, req) => {
    try {
      // Authenticate user using JWT token from query or headers
      const token =
        req.url?.split("token=")[1]?.split("&")[0] ||
        req.headers["sec-websocket-protocol"]?.split(", ")[1];
      //   console.log(token);

      if (!token) {
        ws.close(1008, "Authentication error");
        return;
      }

      const user = await jwtHelpers.verifyToken(
        token,
        config.jwt.jwt_secret as Secret
      );
      if (!user) {
        ws.close(1008, "Invalid token");
        return;
      }

      // Attach user to WebSocket
      ws.userId = user.id;
      ws.user = user;

      // Update user status
      await updateUserStatus(user.id, true);

      // Handle chat and notification events
      ChatHandler(wss, ws);
      // NotificationHandlers(wss, ws);

      // Heartbeat
      ws.isAlive = true;
      ws.on("pong", () => {
        ws.isAlive = true;
      });
    } catch (error) {
      console.error("WebSocket connection error:", error);
      ws.close();
    }
  });

  return wss;
}

export function getWSS(): WebSocketServer {
  if (!wss) throw new Error("WebSocket server not initialized");
  return wss;
}

// Helper functions
async function updateUserStatus(userId: string, isOnline: boolean) {
  await prisma.user.update({
    where: { id: userId },
    data: {
      isOnline,
      lastSeen: new Date(),
    },
  });
}
