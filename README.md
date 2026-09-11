# Aurelis Recruitment Center

A clinical and consumer research study recruitment platform that connects study teams with eligible participants. Built with Next.js, it features an AI-powered intake agent that screens participants conversationally, an admin dashboard for managing studies and reviewing submissions, and a participant portal for tracking enrollment status.

## Demo



## Features

- **Public study listings** — Browse and search active research studies
- **AI-powered intake agent** — A conversational Claude-backed agent that screens participant eligibility on the study detail page, replacing a static form
- **Study finder agent** — Chat interface to help visitors discover relevant studies
- **Admin dashboard** — Metrics (submissions, eligibility rate, enrollment rate), study CRUD, and submission review with AI screening recommendations
- **Participant portal** — Enrolled participants can view their studies and enrollment status
- **Role-based access** — Three tiers: public visitor, participant, admin; protected via NextAuth middleware

## Tech Stack

| Layer | Choice |
|---|---|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript |
| Database | Neon (serverless Postgres) |
| ORM | Drizzle |
| Auth | NextAuth.js v5 |
| AI Agent | Claude API (Anthropic) |
| Styling | Tailwind CSS v4 |
| Deployment | Vercel |

## How It Works

1. A visitor browses studies at `/studies` and opens a study detail page
2. An AI intake agent (powered by Claude) greets them and collects eligibility information through natural conversation
3. On submission, the agent screens the responses against the study's eligibility criteria and saves a `screening_result` with a recommendation and confidence score
4. An admin reviews the submission at `/admin/submissions/[id]`, sees the AI recommendation, and approves or rejects
5. On approval, the participant gains access to `/portal` with their enrolled study details

## Getting Started

### Prerequisites

- Node.js 18+
- A [Neon](https://neon.tech) database
- An [Anthropic](https://console.anthropic.com) API key
- A NextAuth secret

### Environment Variables

Create a `.env.local` file:

```env
DATABASE_URL=your_neon_connection_string
AUTH_SECRET=your_nextauth_secret
ANTHROPIC_API_KEY=your_anthropic_api_key
```

### Install and Run

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the app.

### Database Setup

```bash
npx drizzle-kit push
```

## Project Structure

```
app/
  (public)/         # Public pages: landing, studies, find
  admin/            # Admin dashboard, studies CRUD, submission review
  portal/           # Authenticated participant portal
  auth/             # Sign in / sign up
```

## License

Private project. All rights reserved.
