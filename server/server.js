/* eslint-disable no-undef */
import { WebSocketServer } from "ws";
import http from "http";
import dotenv from "dotenv";
import { createClient } from '@supabase/supabase-js';
dotenv.config();

// Supabase setup
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.VITE_SUPABASE_KEY; // Use service key on server
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Use Render's dynamic port or fallback to 4000
const PORT = process.env.PORT || 3000;

// Rate limiting storage (IP -> last placement timestamp)
const rateLimitMap = new Map();
const COOLDOWN_MS = 15000; // 15 seconds

// Allowed colors (grayscale palette)
const ALLOWED_COLORS = [
  "#000000", "#1a1a1a", "#333333", "#4d4d4d", "#666666", 
  "#808080", "#999999", "#b3b3b3", "#cccccc", "#e6e6e6", 
  "#f0f0f0", "#f5f5f5", "#fafafa", "#fdfdfd", "#ffffff"
];

// Canvas bounds
const MAX_X = 173; // 1218 / 7
const MAX_Y = 89;  // 630 / 7

// Create HTTP server
const server = http.createServer(async (req, res) => {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }
  
  if (req.url === "/status") {
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ status: "ok", online: usersOnline.size }));
    return;
  }
  
  if (req.url === "/place-pixel" && req.method === "POST") {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });
    
    req.on('end', async () => {
      try {
        const { x, y, color } = JSON.parse(body);
        const clientIP = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
        
        // Validate coordinates
        if (!Number.isInteger(x) || !Number.isInteger(y) || x < 0 || y < 0 || x >= MAX_X || y >= MAX_Y) {
          res.writeHead(400, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ error: "Invalid coordinates" }));
          return;
        }
        
        // Validate color
        if (!ALLOWED_COLORS.includes(color)) {
          res.writeHead(400, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ error: "Invalid color" }));
          return;
        }
        
        // Rate limiting
        const now = Date.now();
        const lastPlacement = rateLimitMap.get(clientIP);
        
        if (lastPlacement && (now - lastPlacement) < COOLDOWN_MS) {
          const remainingTime = Math.ceil((COOLDOWN_MS - (now - lastPlacement)) / 1000);
          res.writeHead(429, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ 
            error: "Rate limit exceeded", 
            remainingTime 
          }));
          return;
        }
        
        // Update database
        const { error } = await supabase
          .from('pixels202508')
          .upsert({ 
            x, 
            y, 
            color, 
            updated_by: clientIP.substring(0, 50), // Store anonymized IP
            updated_at: new Date().toISOString()
          });
        
        if (error) {
          console.error('Database error:', error);
          res.writeHead(500, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ error: "Database error" }));
          return;
        }
        
        // Update rate limit
        rateLimitMap.set(clientIP, now);
        
        // Broadcast pixel update to all connected clients
        broadcast({ type: "pixel", x, y, color });
        
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ success: true }));
        
      } catch (err) {
        console.error('Error processing pixel:', err);
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "Invalid request" }));
      }
    });
    return;
  }
  
  res.writeHead(404);
  res.end("Not found");
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
