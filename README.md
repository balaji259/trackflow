# TrackFlow 🚀

TrackFlow is a premium, modern, and real-time collaborative project management and agile planning platform designed for fast-moving teams. It enables organizations to plan sprints, track tasks on an interactive drag-and-drop Kanban board, and collaborate instantly with built-in real-time chat rooms for tasks and projects.

---

## 🌟 Key Features

- 🏢 **Multi-Organization Workspaces**: Create, manage, and switch between separate organizations seamlessly.
- 📋 **Interactive Kanban Board**: Visualize your project workflow with drag-and-drop task cards (powered by `@dnd-kit`).
- 💬 **Real-Time Collaboration**: Discuss task progress or project updates in real-time chat rooms (powered by `Socket.io`).
- 📧 **Team Invitation System**: Invite new members to organizations via automated emails using Nodemailer (supporting Gmail App credentials).
- 🔐 **Secure Authentication**: End-to-end user authentication, routing protection, and user management powered by Clerk.
- 📊 **Insightful Analytics Dashboard**: Track project progress, task states, member contributions, and sprint health at a glance.
- 🎨 **Polished UX/UI**: Clean, modern interface designed with Tailwind CSS, featuring subtle animations, custom themes, and beautiful responsive layouts.

---

## 🛠️ Tech Stack

### Frontend (Client)
- **Framework**: [Next.js 15](https://nextjs.org/) (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS & PostCSS
- **State & Drag-and-Drop**: `@dnd-kit` (Core, Sortable, Utilities)
- **Real-Time Communications**: `socket.io-client`
- **Authentication**: Clerk for Next.js (`@clerk/nextjs`)
- **API Client**: Axios

### Backend (Server)
- **Runtime**: Node.js with [Express](https://expressjs.com/)
- **Language**: TypeScript (using `tsx` for live compilation)
- **Database**: MongoDB with [Mongoose ODM](https://mongoosejs.com/)
- **Real-Time Engine**: `Socket.io`
- **Email Service**: Nodemailer (Gmail integration)
- **Authentication Validation**: Clerk SDK Node (`@clerk/clerk-sdk-node`)
- **Validation**: Zod (Schema parsing)

---

## 📂 Project Structure

```text
trackflow/
├── client/              # Next.js Frontend Application
│   ├── public/          # Static assets
│   └── src/
│       ├── app/         # Pages, Routing, and Components
│       └── middleware.ts# Clerk authentication routing rules
│
└── server/              # Express + TypeScript Backend API
    ├── dist/            # Compiled JavaScript output
    └── src/
        ├── config/      # Environment config & schemas
        ├── db/          # MongoDB connection handler
        ├── models/      # Mongoose Schemas (User, Project, Task, Org, etc.)
        ├── routes/      # REST API endpoints
        └── app.ts       # Server entrypoint and Socket.io setup
```

---

## ⚙️ Getting Started

### Prerequisites
Make sure you have the following installed on your machine:
- **Node.js** (v18.x or higher)
- **npm**, **yarn**, **pnpm**, or **bun**
- **MongoDB** (Local instance or MongoDB Atlas URI)
- A **Clerk** account (for Authentication API keys)

---

### Configuration & Environment Variables

You need to create `.env` files in both the `client` and `server` folders before starting the application.

#### 1. Client Environment Setup (`client/.env`)
Create a `.env` file inside the `client/` folder and add:

```env
# Clerk Authentication Configuration
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key

# Backend Server URL
NEXT_PUBLIC_BACKEND_URL=http://localhost:4000
```

#### 2. Server Environment Setup (`server/.env`)
Create a `.env` file inside the `server/` folder and add:

```env
# Server Configuration
PORT=4000
CORS_ORIGIN=http://localhost:3000

# MongoDB Configuration
MONGODB_URI=your_mongodb_connection_string
MONGO_DB_NAME=trackflow

# Clerk Configuration
CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_SECRET_KEY=your_clerk_secret_key
CLERK_JWT_ISSUER=https://your-clerk-issuer-domain.clerk.accounts.dev

# Frontend URL Configuration (for invitation links)
FRONTEND_URL=http://localhost:3000

# Email Integration (Gmail SMTP via Nodemailer)
GMAIL_USER=your_gmail_address@gmail.com
GMAIL_APP_PASSWORD=your_gmail_app_password
```

---

### Installation & Execution

#### Step 1: Install Dependencies
Open two terminal windows (one for client, one for server).

**For Client:**
```bash
cd client
npm install
```

**For Server:**
```bash
cd server
npm install
```

#### Step 2: Start the Servers

**Start Frontend Development Server (runs on Port 3000):**
```bash
cd client
npm run dev
```

**Start Backend Development Server (runs on Port 4000):**
```bash
cd server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to view and interact with the application!

---

## ⚡ Build for Production

#### Build Frontend
```bash
cd client
npm run build
npm run start
```

#### Build Backend
```bash
cd server
npm run build
npm run start
```

---

## 🤝 Contributing

Contributions are welcome! If you have suggestions or want to add features, please follow these steps:
1. Fork the repository.
2. Create a branch (`git checkout -b feature/AmazingFeature`).
3. Commit your changes.
4. Push to the branch (`git push origin feature/AmazingFeature`).
5. Open a Pull Request.


