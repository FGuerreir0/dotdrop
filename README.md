<p align="center">
    <img src="./public/logo.png" alt="DotDrop - Collaborative Pixel Art Canvas" width="500"/>
</p>

# DotDrop - Collaborative Pixel Art Canvas

A real-time collaborative pixel-art canvas inspired by r/place. Join thousands of players in creating massive pixel art together!

Built with React, Canvas API, WebSockets, and Supabase.

🚀 **Live at:** https://dotdrop-art.netlify.app/

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Made with React](https://img.shields.io/badge/Made%20with-React-61DAFB?logo=react)](https://reactjs.org/)
[![Powered by Supabase](https://img.shields.io/badge/Powered%20by-Supabase-3ECF8E?logo=supabase)](https://supabase.com/)

## ✨ Features

- 🖌️ **Interactive Canvas** — Place pixels on a 1218x630 collaborative canvas
- 🎨 **Grayscale Palette** — 15 colors from pure black to white
- ⏱️ **15-Second Cooldown** — Server-side rate limiting prevents spam
- 🌍 **Real-time Updates** — See other players' pixels instantly via WebSockets
- 💾 **Persistent Canvas** — All artwork saved in Supabase database
- 🔍 **Zoom & Pan** — Navigate the canvas with mouse wheel and drag
- 📍 **Pixel Tooltip** — Hover to see coordinates and color codes
- 🎮 **Draggable UI** — Move controls and palette anywhere on screen
- 📱 **Fully Responsive** — Optimized for desktop, tablet, and mobile
- 🔒 **Secure Backend** — Rate limiting, input validation, and RLS policies
- 🌐 **Fullscreen Mode** — Immersive canvas experience
- 🖥️ **Retro Design** — CRT terminal aesthetic with pixel-perfect styling

## 🎮 How to Play

1. **Choose a color** from the grayscale palette
2. **Click on the canvas** to place your pixel
3. **Wait 15 seconds** for cooldown to complete
4. **Collaborate with others** to create art together!
5. **Zoom and pan** to explore the entire canvas
6. **Drag controls** to position UI elements where you want them

## 🛠️ Tech Stack

- **Frontend:** React + Vite
- **Canvas:** HTML5 Canvas API with zoom/pan transforms
- **Real-time:** WebSocket (ws) for live presence and updates
- **Database:** Supabase with Row Level Security
- **Backend:** Node.js Express server with rate limiting
- **Styling:** Retro CSS with Press Start 2P font
- **Deployment:** 
  - Frontend: Netlify
  - Backend: Render
  - Database: Supabase

## � Security Features

- ✅ Server-side rate limiting (IP-based, 5-second cooldown)
- ✅ Input validation (coordinates, colors)
- ✅ Row Level Security (RLS) policies
- ✅ Service role authentication
- ✅ Protected database writes
- ✅ CORS configuration

## 📦 Installation

### Development Setup

```bash
# Clone the repository
git clone https://github.com/yourusername/dotdrop.git
cd dotdrop

# Install client dependencies
npm install

# Install server dependencies
npm run server:install

# Setup environment variables
cp .env.example .env
cp server/.env.example server/.env
# Edit .env files with your Supabase credentials
```

### Running Locally

```bash
# Start both client and server
npm run all

# Or start separately:
npm run dev          # Client only
npm run dev:server   # Server only
```

Visit http://localhost:5173

### Production Build

```bash
# Build optimized, minified production bundle
npm run build:prod

# Preview production build locally
npm run preview

# Deploy check (lint + build)
npm run deploy:check
```

**Production build features:**
- ✅ Minified `.min.js` files with Terser
- ✅ 60-70% smaller bundle size (370KB → 110KB gzipped)
- ✅ Console logs removed automatically
- ✅ Code splitting (React, Supabase, app code)
- ✅ Cache-friendly hashed filenames

See [BUILD_SUMMARY.md](BUILD_SUMMARY.md) for build details.

## 🚀 Deployment

**Frontend (Netlify):**
- Build: `npm run build:prod`
- Publish: `dist/`

**Backend (Render):**
- Start: `node server.js`
- Root: `server/`

📖 **Complete guides:**
- [DEPLOYMENT.md](DEPLOYMENT.md) - Full deployment instructions
- [PRODUCTION_CHECKLIST.md](PRODUCTION_CHECKLIST.md) - Pre-launch checklist
- [SECURITY_SETUP.md](SECURITY_SETUP.md) - Security configuration

## 📚 Documentation

| File | Description |
|------|-------------|
| [README.md](README.md) | Overview and quick start |
| [DEPLOYMENT.md](DEPLOYMENT.md) | Complete deployment guide |
| [BUILD_SUMMARY.md](BUILD_SUMMARY.md) | Production build details |
| [PRODUCTION_CHECKLIST.md](PRODUCTION_CHECKLIST.md) | Pre-launch checklist |
| [SECURITY_SETUP.md](SECURITY_SETUP.md) | Security configuration |

## 🎯 Project Structure

```
dotdrop/
├── src/
│   ├── components/         # React components
│   │   ├── Canvas/        # Main pixel canvas
│   │   ├── Palette/       # Color picker
│   │   ├── Main/          # Homepage
│   │   ├── Navbar/        # Navigation
│   │   └── Footer/        # Footer
│   ├── hook/              # Supabase hooks
│   ├── App.jsx            # Router setup
│   └── main.jsx           # Entry point
├── server/
│   ├── server.js          # WebSocket + API server
│   └── package.json       # Server dependencies
├── public/                # Static assets
├── dist/                  # Production build (generated)
└── vite.config.js         # Build configuration
```


