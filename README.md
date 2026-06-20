# Palaro — Filipino Childhood Games Collection Platform

Palaro is a full-featured MERN stack web application dedicated to preserving, celebrating, and gamifying traditional Filipino childhood games. It features multiplayer (PVP) and computer (PVC) modes, real-time chats, visual character customization, province-based leaderboards, a shared memory wall, and family account connections.

## Features

- **Childhood Games Collection:** Interactive digital museum of 16 classic games (Patintero, Tumbang Preso, Sungka, Sipa, Holen, Trumpo, Jackstone, and more).
- **Multiplayer & Matchmaking:** Real-time online gameplay (PVP) powered by Socket.IO, as well as offline-ready AI opponents (PVC).
- **Character Customization:** Interactive avatar dress-up with male and female presets, shirts, pants, skirts, hairstyles, and accessories.
- **Nostalgia Social Hubs:**
  - **Memory Wall:** Share childhood memories, read stories, and like community posts.
  - **Barangay Clubs:** Create and join local community clubs with custom tournaments.
  - **Province Rankings:** Compete to score points for your home province and climb regional leaderboards.
  - **Family Dashboard:** Connect parents and children accounts to track achievements and explore game rules together.
- **Virtual Playground:** A interactive 2D proximity social map where avatars walk, chat, and challenge others to games.

## Tech Stack

- **Backend:** Node.js, Express, MongoDB (Mongoose), Socket.IO, Nodemailer, Cloudinary.
- **Frontend:** React 18, Zustand, Chakra UI, PixiJS (2D Physics & Canvas), React Three Fiber (Three.js 3D), Socket.IO Client.

## Setup Instructions

### Prerequisites
- Node.js (v18+)
- MongoDB Atlas or local MongoDB instance
- Cloudinary account (for character customization uploads)

### Installation
1. Clone the repository:
   ```bash
   git clone <repo-url>
   cd Palaro
   ```

2. Setup backend:
   ```bash
   cd server
   npm install
   npm run seed  # Seed games, provinces, achievements
   npm run dev   # Start development server
   ```

3. Setup frontend:
   ```bash
   cd ../client
   npm install
   npm run dev   # Start React frontend
   ```
