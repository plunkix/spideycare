# SpideyCare - Mental Health Chatbot

A mental health chatbot built with Cloudflare Workers and Pages.

## Structure
- `worker/` - Backend API built with Cloudflare Workers
- `frontend/` - Frontend UI built with Cloudflare Pages

## Setup
1. Clone the repository
2. Set up the Worker:
   ```bash
   cd worker
   npm install
   npx wrangler login
   npx wrangler secret put GEMINI_API_KEY
   npx wrangler deploy
   ```
3. Set up the Frontend:
   ```bash
   cd frontend
   npm install
   npx wrangler pages deploy public/
   ```

## Development
- Worker: `npm run dev` in the worker directory
- Frontend: `npm run dev` in the frontend directory

## License
MIT