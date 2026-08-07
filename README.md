# DZLAW HUB

A comprehensive Algerian legal platform powered by AI for students and citizens.

## Local Development & API Routes

Our Gemini AI calls are secured on the server side using Express and a Vercel serverless function at `/api/gemini.ts`.

To run the application locally:
- For standard full-stack development, run: `npm run dev` (this starts the Express custom server on port 3000 which proxies the Gemini API).
- To test Vercel Serverless Functions specifically in local development, you should use:
  ```bash
  vercel dev
  ```
  instead of plain `vite dev` or `npm run dev`, as Vite alone does not run Vercel serverless functions natively.

## Important Note

After deploying, please rotate your Gemini API key in Google AI Studio as the previous configuration exposed it in the client-side bundle.
