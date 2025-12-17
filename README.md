<p align="center">
    <img src="./public/logo.png" alt="App Logo" width="500"/>
</p>

A collaborative pixel-art canvas inspired by r/place.

Built with Vite.js + React, Canvas API, WebSockets, and Supabase for persistence.

🚀 Deployed at https://dotdropwars.netlify.app/

## Features

- 🖌️ Interactive Pixel Canvas — click to paint pixels.
- 🎨 Color Palette — select from a set of colors.
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
- Pixel updates are broadcast to all connected clients via WebSocket.
- Supabase keeps the full grid state persisted.

## Deployment

- Frontend: Netlify.
- Backend (WebSocket): Render.
- Database: Supabase.

## Roadmap
 - [X] Create main app
 - [X] Create Homepage and Canvas page
 - [X] Implement color palette
 - [X] Add Server and /status
 - [X] Add first ws interaction
 - [X] Show saved pixels colors
 - [X] Save pixels on Supabase
 - [ ] Pixel cooldown timer (prevent spamming).
 - [ ] Improve Front-end & mobile usage.
 - [ ] Bigger grid with zoom & pan.
 - [ ] Public live gallery showing monthly canvas.

## Usage

- Local:
```bash
    npm run start
```

- Build:
```bash
    npm run build
```


