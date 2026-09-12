# LifeOS

LifeOS is an AI-native personal operating system for direction, execution, reflection, accountability, and long-term growth.

## Stack

- React + TypeScript + Vite
- Tailwind CSS
- Supabase Auth + PostgreSQL
- Supabase Realtime and Edge Functions
- Provider-agnostic AI gateway

## Frontend foundation

The current frontend establishes:

- Vite + React + TypeScript
- Tailwind CSS v4
- Supabase browser client
- Responsive application shell
- Primary LifeOS navigation
- Route structure for Home, Today, Goals, Tasks, Focus, Journal, Progress, and Settings
- Environment configuration template

## Local development

1. Copy `.env.example` to `.env.local`.
2. Add the LifeOS Supabase URL and anon key.
3. Install dependencies with `npm install`.
4. Start the app with `npm run dev`.

The database foundation is managed in the connected Supabase project.
