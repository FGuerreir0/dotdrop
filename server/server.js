 
import { WebSocketServer } from "ws";
//import { createClient } from "@supabase/supabase-js";
import dotenv from 'dotenv';
dotenv.config();

const wss = new WebSocketServer({ port: 4000 });
//const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);

let usersOnline = new Set();

wss.on("connection", (ws) => {
  // Add user to presence set
  usersOnline.add(ws);
  broadcast({ type: "presence", online: usersOnline.size });

  /*
  ws.on("message", async (msg) => {
    try {
      const data = JSON.parse(msg);

      if (data.type === "pixel") {
        const { x, y, color, user } = data;

        // Store in DB
        await supabase.from("pixels").upsert({ x, y, color, updated_by: user });

        // Broadcast to all clients
        broadcast({ type: "pixel", x, y, color, user });
      }

      if (data.type === "hello") {
        // Example handshake: store user info
        ws.user = data.user;
        console.log(`👤 ${data.user.name} joined`);
      }

    } catch (err) {
      console.error("Error handling message", err);
    }
  });*/

  ws.on("close", () => {
    usersOnline.delete(ws);
    broadcast({ type: "presence", online: usersOnline.size });
  });
});

function broadcast(message) {
  const json = JSON.stringify(message);
  console.log("Broadcasting:", json);
  for (const client of wss.clients) {
    if (client.readyState === 1) {
      client.send(json);
    }
  }
}

console.log("🚀 DotDrop WebSocket running on ws://localhost:4000");
