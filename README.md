# Property Passport

A citizen-first prototype for making property records easier to understand and act on. This is a competition demo only; it uses fictional mock data and is not an official government service.

## Run locally

```bash
npm install
npm run dev
```

Then visit `http://localhost:3000`.

## Optional AI configuration

Copy `.env.example` to `.env.local` and set `OPENAI_API_KEY` plus `OPENAI_MODEL` to enable server-side assistant and document extraction. Without these values, or when the AI service is unavailable, the prototype uses its built-in fictional demo guidance and document extraction.

## Foundation included

- A responsive, high-trust citizen landing page with five plain-language starting paths
- Natural-language assistant entry and browser speech-recognition fallback
- Property Passport visual identity and demo credential card
- Typed, fictional Bengaluru mock data and a deliberately narrow service layer for future AI tool routing
- Next.js App Router, TypeScript, Tailwind CSS, and reusable UI components

## Next build slices

1. New-property document upload and review
2. Officer verification and supervisor approval
3. Passport portfolio, document vault, status timeline, and Morse scanner

## Competition demo reset

Use `/demo/reset` before a replay. It restores the fictional APP-2026-001 scenario to **Awaiting field verification** with the Property Passport not yet issued.
