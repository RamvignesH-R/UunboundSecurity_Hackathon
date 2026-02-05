# Agentic Workflow MVP

A minimal yet functional AI agent workflow builder and executor.  
Create multi-step AI workflows, execute them asynchronously with real AI models, and view detailed execution history.

**Live Demo (Deployed on Replit Autoscale):**  
https://agentic-workflow--ramvigneshr2004.replit.app/

## Features

- Create, edit, delete workflows with multiple ordered steps
- Custom prompt templates with variable support (`{{input}}`)
- Real AI integration via **Unbound AI** (using Kimi models: `kimi-k2p5` & `kimi-k2-instruct-0905`)
- Background execution (non-blocking)
- Execution history with status, duration, per-step logs & AI outputs
- Automatic seeding of a demo workflow in development mode
- Basic retry policy support
- Responsive UI with Shadcn/ui + Tailwind

## Tech Stack

- **Frontend**: React + Vite + TypeScript + Tailwind CSS + Shadcn/ui + Wouter routing
- **Backend**: Node.js + Express + TypeScript + Drizzle ORM + SQLite
- **AI**: Unbound API (OpenAI-compatible endpoint)
- **Deployment**: Replit Autoscale (free tier)

## Live Demo Walkthrough

1. Open the deployed link: https://agentic-workflow--ramvigneshr2004.replit.app/
2. Go to **Workflows** tab → you will see the seeded "Demo Agent Workflow"
3. Click **Execute** on the demo workflow
4. Enter sample input in the context field.
5. Wait ~10–20 seconds (3 steps with delay + AI call)
6. Go to **Executions** tab → refresh → see new completed execution
7. Click the execution row → view per-step logs and final AI-generated outputs (from Unbound/Kimi models)

## Setup & Run Locally

### Prerequisites
- Node.js 18+ (tested on 20–24)
- npm

### Instructions

1. Clone or download the repo
```bash
git clone YOUR_REPO_URL
cd agentic-workflow
```
2. Install dependencies
```bash
cd client && npm install && cd ..
cd server && npm install && cd ..
```
3. Create .env file in root folder 
```.env
UNBOUND_API_KEY=your-unbound-api-key-here
NODE_ENV=development
DATABASE_URL=sqlite:./dev-local.db
PORT=5000
```
4. Run backend & frontend (two terminals)
Backend:
```Bash
cd server
npm run dev
```
Frontend:
```Bash
cd client
npm run dev
```
Open http://localhost:5173 in browser

## Limitations / Notes

Uses SQLite → data resets on Replit restart (use external DB for production)
Free Replit tier may have cold starts or resource limits
No user authentication (MVP scope)

## Deployment
Deployed using Replit Autoscale (free tier with auto-sleep after inactivity).
Link: https://agentic-workflow--ramvigneshr2004.replit.app/
Made for hackathon submission – February 2026
Contact: ramvigneshr2004@gmail.com
Thanks for checking it out!
