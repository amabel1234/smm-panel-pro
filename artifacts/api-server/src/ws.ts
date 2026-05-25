import { WebSocketServer, WebSocket } from "ws";
import type { IncomingMessage } from "http";
import type { Server } from "http";
import { verifyToken } from "./lib/jwt";

type WsClient = { ws: WebSocket; userId: number };
const clients: WsClient[] = [];

export function setupWebSocket(server: Server): void {
  const wss = new WebSocketServer({ server, path: "/api/ws" });

  wss.on("connection", (ws: WebSocket, req: IncomingMessage) => {
    const rawUrl = req.url ?? "";
    const url = new URL(rawUrl, "ws://localhost");
    const token = url.searchParams.get("token");

    let userId: number | null = null;
    if (token) {
      const payload = verifyToken(token);
      if (payload) userId = payload.userId;
    }

    if (!userId) {
      ws.close(1008, "Unauthorized");
      return;
    }

    const client: WsClient = { ws, userId };
    clients.push(client);

    ws.send(JSON.stringify({ type: "connected", message: "WebSocket terhubung" }));

    ws.on("close", () => {
      const idx = clients.indexOf(client);
      if (idx !== -1) clients.splice(idx, 1);
    });

    ws.on("error", () => {
      ws.close();
    });
  });
}

export function sendToUser(userId: number, data: object): void {
  const msg = JSON.stringify(data);
  for (const client of clients) {
    if (client.userId === userId && client.ws.readyState === WebSocket.OPEN) {
      client.ws.send(msg);
    }
  }
}

export function broadcastToAll(data: object): void {
  const msg = JSON.stringify(data);
  for (const client of clients) {
    if (client.ws.readyState === WebSocket.OPEN) {
      client.ws.send(msg);
    }
  }
}
