<p align="center">
    <img src="./public/logo.png" alt="App Logo" width="500"/>
</p>

A collaborative pixel-art canvas inspired by r/place.

Built with Vite.js + React, Canvas API, WebSockets, and Supabase for persistence.

🚀 Deployed at https://dotdropwars.netlify.app/

## Features

- 🖌️ Interactive Pixel Canvas — click or drag to paint pixels.
- 🎨 Color Palette — select from a set of colors.
- ⚡ High Performance — uses canvas instead of thousands of divs.
- 🌍 Real-time Updates — via WebSockets.
- 💾 Persistence — store pixel state in Supabase.

## Tech Stack
- Vite.js — lightning fast frontend bundler.
- React — component-based UI.
- Canvas API — efficient pixel rendering.
- ws — WebSocket backend for real-time updates.
- Supabase — database + authentication + hosting.

## Usage

- Click on a pixel to paint it.
- Hold mouse and drag to paint multiple pixels.
- Pixel updates are broadcast to all connected clients via WebSocket.
- Supabase keeps the full grid state persisted.

## Deployment

- Frontend: Deploy to Vercel or Netlify.
- Backend (WebSocket): Deploy with Heroku, Fly.io, or a VPS.
- Database: Supabase cloud project.

## Roadmap
 - [X] Create main app
 - [X] Create Homepage and Canvas page
 - [X] Implement color palette
 - [ ] Add Express API
 - [ ] Add first ws interaction to save and retrieve pixels from database
 - [ ] Save pixels on Supabase
 - [ ] Show saved pixels colors
 - [ ] Pixel cooldown timer (prevent spamming).
 - [ ] Improve Front-end & mobile usage.
 - [ ] Bigger grid with zoom & pan.
 - [ ] Public live gallery.
 - [ ] Authentication (only logged-in users can paint).

## Usage

- Local:
```bash
    npm run start
```

- Build:
```bash
    npm run build
```


