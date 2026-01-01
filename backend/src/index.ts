import express, { Request, Response } from "express";
import dotenv from "dotenv";
import { setupWebSocket } from "./lib/wsServer";
import http from "http";


dotenv.config();
const app = express();
const port = process.env.PORT ?? 3000;

// Middleware
app.use(express.json());

// Health route
app.get("/", (req: Request, res: Response) => {
  res.json({ message: "Hello from Express + TypeScript!" });
});

// Example API route
app.get("/api/example", (req: Request, res: Response) => {
  res.json({ success: true, data: "This is an example route" });
});

const server = http.createServer(app);
setupWebSocket(server);

// Start the server
server.listen(port, () => {
  console.log(`⚡ Server is running at http://localhost:${port}`);
});
