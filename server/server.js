/* eslint-disable no-undef */
import { WebSocketServer } from "ws";
import http from "http";
import dotenv from "dotenv";
dotenv.config();

// Use Render's dynamic port or fallback to 4000
const PORT = process.env.PORT || 3000;

// Create HTTP server (for status endpoint)
const server = http.createServer((req, res) => {
  if (req.url === "/status") {
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ status: "ok", online: usersOnline.size }));
  } else {
    res.writeHead(404);
    res.end("Not found");
  }
});

const wss = new WebSocketServer({ server });

let usersOnline = new Set();

wss.on("connection", (ws) => {
  // Add user to presence set
  usersOnline.add(ws);
  broadcast({ type: "presence", online: usersOnline.size });

  // Example: handle messages if you want
  /*
  ws.on("message", async (msg) => {
    try {
      const data = JSON.parse(msg);
      if (data.type === "pixel") {
        // handle pixel
      }
    } catch (err) {
      console.error(err);
    }
  });
  */

  ws.on("close", () => {
    usersOnline.delete(ws);
    broadcast({ type: "presence", online: usersOnline.size });
  });
});

function broadcast(message) {
  const json = JSON.stringify(message);
  for (const client of wss.clients) {
    if (client.readyState === 1) {
      client.send(json);
    }
  }
}

server.listen(PORT, () => {
  console.log(`🚀 DotDrop WebSocket + HTTP server running on port ${PORT}`);
  console.log(`🌐 Status endpoint: http://localhost:${PORT}/status`);
});
