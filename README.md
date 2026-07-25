# Find Names for My Brand

AI-powered brand & product name generator that displays candidate names only after passing online collision checks. Real-time web search and domain availability verification before you ever see a name.

## Features

- **Collision-Guarded Pipeline**: Every generated name is checked against live search engines and domain registries
- **BYOK (Bring Your Own Key)**: Use your free Gemini API key — no subscriptions, no paywalls
- **Real-time Streaming**: Watch the verification pipeline as it runs
- **PDF Clearance Certificates**: Download validation reports for shortlisted names
- **100% Open Source**: MIT License

## Run Locally

**Prerequisites:** Node.js

1. Install dependencies:
   `npm install`
2. Copy `.env.example` to `.env` and set `GEMINI_API_KEY`
3. Copy `firebase-applet-config.example.json` to `firebase-applet-config.json` and fill in your Firebase config
4. Run the app:
   `npm run dev`

## Tech Stack

- React 19 + TypeScript
- Vite + Tailwind CSS v4
- Express server (Vite middleware in dev)
- Google Gemini AI (Google Gen AI SDK)
- Firebase Auth + Firestore
