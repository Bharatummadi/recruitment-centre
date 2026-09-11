# Aurelis Recruitment Center

A clinical and consumer research study recruitment platform that connects study teams with eligible participants. Built with Next.js, it features an AI-powered intake agent that screens participants conversationally, an admin dashboard for managing studies and reviewing submissions, and a participant portal for tracking enrollment status.

## Demo

https://github.com/user-attachments/assets/da8ffc88-4423-40b0-8737-8e2dfef7aafb


## Features

- **Public study listings** — Browse and search active research studies
- **AI-powered intake agent** — A conversational Claude-backed agent that screens participant eligibility on the study detail page, replacing a static form
- **Study finder agent** — Chat interface to help visitors discover relevant studies
- **Admin dashboard** — Metrics (submissions, eligibility rate, enrollment rate), study CRUD, and submission review with AI screening recommendations
- **Participant portal** — Enrolled participants can view their studies and enrollment status
- **Role-based access** — Three tiers: public visitor, participant, admin; protected via NextAuth middleware

## How It Works

1. A visitor browses studies at `/studies` and opens a study detail page
2. An AI intake agent (powered by Lyzr.ai) greets them and collects eligibility information through natural conversation
3. On submission, the agent screens the responses against the study's eligibility criteria and saves a `screening_result` with a recommendation and confidence score
4. An admin reviews the submission at `/admin/submissions/[id]`, sees the AI recommendation, and approves or rejects
5. On approval, the participant gains access to `/portal` with their enrolled study details
