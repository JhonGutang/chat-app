import { WebSocketServer, WebSocket } from "ws";
import { Server as HTTPServer } from "http";

export function setupWebSocket(server: HTTPServer) {
  const wss = new WebSocketServer({ server });

  // username -> websocket
  const users = new Map<string, WebSocket>();

  wss.on("connection", (ws: WebSocket) => {
    console.log("A client connected");

    let currentUsername: string | null = null;

    ws.on("message", (raw) => {
      const data = JSON.parse(raw.toString());

      // 1️⃣ REGISTER
      if (data.type === "register") {
        const username: string = data.username;
        if (users.has(username)) {
          ws.send(JSON.stringify({
            type: "error",
            message: "Username already taken"
          }));
          return;
        }

        currentUsername = username;
        users.set(username, ws);
        broadcastUsers();
        return;
      }


      // ignore messages until registered
      if (!currentUsername) return;

      // 2️⃣ PUBLIC MESSAGE (broadcast)
      if (data.type === "public_message") {
        broadcast({
          type: "public_message",
          from: currentUsername,
          message: data.message
        });
        return;
      }

      // 3️⃣ PRIVATE MESSAGE
      if (data.type === "private_message") {
        const target = users.get(data.to);
        if (!target || target.readyState !== WebSocket.OPEN) return;

        const payload = {
          type: "private_message",
          from: currentUsername,
          to: data.to,
          message: data.message
        };

        // send to recipient
        target.send(JSON.stringify(payload));
        // echo back to sender so sender sees their own message
        ws.send(JSON.stringify(payload));
      }
    });

    ws.on("close", () => {
      if (currentUsername) {
        users.delete(currentUsername);
        broadcastUsers();
      }
    });
  });

  function broadcastUsers() {
    broadcast({
      type: "users",
      users: Array.from(users.keys())
    });
  }

  function broadcast(payload: object) {
    const message = JSON.stringify(payload);
    users.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(message);
      }
    });
  }

  console.log("✅ Public + Private WebSocket server ready");
}
