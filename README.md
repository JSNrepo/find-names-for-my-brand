<div align="center">
  <br/>
  <h1>🔍 Find Names for My Brand</h1>
  <p><strong>AI-Powered Brand Name Generator with Real-Time Collision Verification</strong></p>
  <p>Generates original brand names, verifies live web collisions across search engines and domain registries, and presents only available candidates.</p>
  <br/>
  <p>
    <a href="#features">Features</a> •
    <a href="#how-it-works">How It Works</a> •
    <a href="#quick-start">Quick Start</a> •
    <a href="#architecture">Architecture</a> •
    <a href="#api">API</a>
  </p>
  <br/>
</div>

---

## ✨ Features

- **Collision-Guarded Pipeline** — Every generated name is checked against live web search engines and DNS registries before you see it. Names with existing exact matches are discarded automatically.
- **7-Stage Verification Protocol** — Exact search → contextual software/company/app checks → phonetic variant scanning → domain availability → GitHub presence → trademark portal links → scoring.
- **Bring Your Own Key (BYOK)** — Use your free Gemini API key. No subscriptions, no paywalls, no hidden tiers.
- **Real-Time Streaming** — Watch the verification pipeline execute live via Server-Sent Events as candidates are generated, checked, and validated.
- **Multi-Provider Search** — Auto-selects from Brave Search, Serper API, Google Custom Search, or Gemini Search Grounding with automatic fallback.
- **Pronunciation Scoring** — Validates syllable balance, consonant clusters, spelling ambiguity, and global pronounceability before candidates enter search.
- **PDF Clearance Certificates** — Download detailed validation reports with full evidence for any shortlisted name.
- **Firebase Auth + Firestore** — Google sign-in, user profiles, project persistence, and admin configuration.
- **100% Open Source** — MIT License. Self-host or use the public instance.

---

## How It Works

Unlike standard AI chatbots that hallucinate strings from training data (most of which are already taken), Find Names for My Brand runs a **7-stage validation pipeline** before presenting any name.

```
Product Brief → AI Generation → Pronunciation Filter → Local Quality Filter
→ Exact Web Search → Contextual Searches (Software/Company/App)
→ Phonetic Variant Scan → Domain DNS Check → GitHub/Trademark Links
→ Scoring → Only Passed Names Displayed
```

### The 7-Stage Pipeline

| Stage | What It Does |
|---|---|
| **1. Dual-Engine Generation** | Google Gemini AI produces domain-tailored candidates. A local phonetic engine generates fallback coinages. |
| **2. Pronunciation & Quality Filter** | Checks syllable count, consonant clusters, vowel balance, spelling ambiguity. Rejects unpronounceable names. |
| **3. Exact Search Collision** | Runs `"exact name"` quoted search via the active search provider. **Any existing exact match = automatic rejection.** |
| **4. Contextual Searches** | Checks the name against `"name" software`, `"name" company`, `"name" app` contexts for brand usage. |
| **5. Phonetic Variant Scan** | Generates phonetic variations (e.g., Navira → Naveera) and checks those too. |
| **6. Domain Availability** | Queries `.com`, `.in`, `.ai`, `.app`, `.io` via DNS-over-HTTPS (Cloudflare). |
| **7. Scoring & Certification** | Calculates pronunciation, memorability, relevance, uniqueness confidence, and final score. Generates evidence trail. |

---

## Quick Start

### Prerequisites

- **Node.js** 18+
- **npm** or **bun**
- **Firebase project** (for authentication & Firestore)
- **Gemini API key** (free from [Google AI Studio](https://aistudio.google.com/app/apikey))

### 1. Clone & Install

```bash
git clone https://github.com/JSNrepo/find-names-for-my-brand.git
cd find-names-for-my-brand
npm install
```

### 2. Configure Firebase

Firebase credentials are loaded from `firebase-applet-config.json` (gitignored). Create yours:

```bash
cp firebase-applet-config.example.json firebase-applet-config.json
```

Fill in your Firebase project values from the Firebase Console:
- `projectId` — Your Firebase project ID
- `appId` — Your Web app's Firebase App ID
- `apiKey` — Web API key
- `authDomain` — `{project}.firebaseapp.com`
- `firestoreDatabaseId` — Firestore database ID (or leave as default)
- `oAuthClientId` — OAuth 2.0 Client ID (for Google sign-in)

Enable **Google sign-in** in Firebase Authentication.

### 3. Configure Environment

```bash
cp .env.example .env
```

| Variable | Required | Description |
|---|---|---|
| `GEMINI_API_KEY` | Yes (server) | Gemini API key for AI generation & Gemini Grounding search |
| `BRAVE_SEARCH_API_KEY` | Optional | Brave Search API key (search provider) |
| `SERPER_API_KEY` | Optional | Serper API key (search provider) |
| `GOOGLE_SEARCH_API_KEY` | Optional | Google Custom Search API key |
| `GOOGLE_SEARCH_ENGINE_ID` | Optional | Google Custom Search Engine ID |
| `APP_URL` | Optional | Public URL for OAuth callbacks |

> **No API keys needed to start.** The app uses **Gemini Search Grounding** as the default/fallback search provider, which only requires `GEMINI_API_KEY`.

### 4. Deploy Firestore Rules

```bash
firebase deploy --only firestore:rules
```

Or apply the rules from `firestore.rules` via the Firebase Console.

### 5. Start Development

```bash
npm run dev
```

Opens at `http://localhost:3000`.

---

## Deploy to Netlify

One-click deploy:

[![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start)

### Manual Setup

1. Push the repo to GitHub
2. In Netlify Dashboard → **Add new site** → **Import from Git**
3. Select your repo, use these settings:

| Setting | Value |
|---|---|
| **Build command** | `npm run build:netlify` |
| **Publish directory** | `dist` |
| **Functions directory** | `netlify/functions` |

4. Add environment variables in Netlify → **Site settings** → **Environment variables**:

| Variable | Notes |
|---|---|
| `GEMINI_API_KEY` | Required for Gemini Grounding search |
| `BRAVE_SEARCH_API_KEY` | Optional |
| `SERPER_API_KEY` | Optional |
| `GOOGLE_SEARCH_API_KEY` | Optional |
| `GOOGLE_SEARCH_ENGINE_ID` | Optional |

5. Deploy! The `netlify.toml` handles API route redirects automatically.

> **Note:** The SSE streaming endpoint (`/api/name-runs/:runId/stream`) has limited support on serverless platforms. Pipeline results can still be polled via `GET /api/name-runs/:runId`.

---

## Architecture

```
Server (Express + Vite middleware)
├── src/server/
│   ├── engine/
│   │   ├── pipeline.ts          # Main validation pipeline orchestrator
│   │   ├── gemini-generator.ts  # Gemini AI candidate generation
│   │   ├── local-generator.ts   # Local phonetic candidate generation
│   │   ├── pronunciation.ts     # Pronunciation scoring & phonetic analysis
│   │   └── domain-checker.ts    # DNS-over-HTTPS domain availability
│   ├── search/
│   │   ├── search-provider.interface.ts  # Search provider abstraction
│   │   ├── search-factory.ts             # Auto-selects best provider
│   │   ├── gemini-grounding.provider.ts  # Gemini Google Search Grounding
│   │   ├── brave.provider.ts             # Brave Search API
│   │   ├── serper.provider.ts            # Serper API
│   │   └── google-search.provider.ts     # Google Custom Search
│   └── ...
├── src/lib/
│   ├── firebase.ts             # Firebase init, auth helpers
│   └── userProfile.ts          # User profile CRUD (Firestore + localStorage)
├── src/context/
│   └── AuthContext.tsx          # Auth state management
├── src/components/             # React UI components (16 components)
├── src/types/
│   └── index.ts                # TypeScript types & Zod schemas
└── server.ts                   # Express entry point + API routes
```

### Search Provider Fallback Chain

The factory (`search-factory.ts`) auto-selects the first available provider:

1. **Google Custom Search** — if `GOOGLE_SEARCH_API_KEY` + `GOOGLE_SEARCH_ENGINE_ID` are set
2. **Serper API** — if `SERPER_API_KEY` is set
3. **Brave Search** — if `BRAVE_SEARCH_API_KEY` is set
4. **Gemini Search Grounding** — always available if `GEMINI_API_KEY` is set (default fallback)

---

## API

### Projects

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/projects` | Create a new naming project |
| `GET` | `/api/projects` | List projects (`?userId=`) |
| `GET` | `/api/projects/:id` | Get project details |
| `PUT` | `/api/projects/:id` | Update project |
| `DELETE` | `/api/projects/:id` | Delete project |

### Name Generation

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/name-runs` | Start a validation pipeline run |
| `GET` | `/api/name-runs/:id` | Get run status & results |
| `GET` | `/api/name-runs/:id/stream` | SSE stream for live pipeline updates |
| `POST` | `/api/name-runs/:id/cancel` | Cancel a running pipeline |
| `POST` | `/api/candidates/similar` | Generate similar names to a liked candidate |

### Search & Domains

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/search/exact` | Run exact web search for a name |
| `POST` | `/api/search/context` | Run contextual web search |
| `POST` | `/api/domains/check` | Check domain availability |

### Admin

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/admin/config` | Get admin configuration |
| `POST` | `/api/admin/config` | Update admin configuration |
| `POST` | `/api/admin/clear-all` | Clear all in-memory data |

### Assistant

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/assistant/chat` | Guided brief-filling assistant chat |

### Health

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/health` | Health check |

---

## Scripts

| Script | Description |
|---|---|
| `npm run dev` | Start dev server with hot-reload |
| `npm run build` | Build frontend (Vite) + bundle server (esbuild) |
| `npm start` | Start production server |
| `npm run preview` | Preview Vite production build |
| `npm run clean` | Remove build artifacts |
| `npm run lint` | Type-check with `tsc --noEmit` |

---

## Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 19, TypeScript, Tailwind CSS v4, Vite |
| **Backend** | Express, Vite middleware (dev), esbuild bundle (prod) |
| **AI** | Google Gemini (`@google/genai` SDK), Gemini Search Grounding |
| **Auth** | Firebase Authentication (Google sign-in) |
| **Database** | Firebase Firestore (user profiles, project persistence) |
| **Real-time** | Server-Sent Events (SSE) for pipeline streaming |
| **Forms** | React Hook Form, Zod validation |
| **PDF** | jsPDF for validation certificates |
| **Icons** | Lucide React |
| **Animation** | Motion library |
| **State** | TanStack React Query |

---

## Project Structure

```
find-names-for-my-brand/
├── .env.example                  # Environment variable template
├── .gitignore                    # Git ignore rules
├── firebase-applet-config.example.json  # Firebase config template
├── firebase-blueprint.json       # Firestore schema blueprint
├── firestore.rules               # Firestore security rules
├── metadata.json                 # App metadata
├── package.json
├── tsconfig.json
├── vite.config.ts
├── server.ts                     # Express server + API routes
├── index.html                    # SPA entry
├── assets/                       # Static assets
├── src/
│   ├── main.tsx                  # React entry point
│   ├── App.tsx                   # Main app component with routing
│   ├── index.css                 # Global styles + Tailwind
│   ├── types/index.ts            # TypeScript types & Zod schemas
│   ├── lib/
│   │   ├── firebase.ts           # Firebase initialization & auth
│   │   └── userProfile.ts        # User profile management
│   ├── context/
│   │   └── AuthContext.tsx       # Auth state provider
│   ├── components/
│   │   ├── LandingPage.tsx       # Public landing page
│   │   ├── ProjectForm.tsx       # Brand brief input form
│   │   ├── LivePipelineView.tsx  # Real-time pipeline stream
│   │   ├── ResultsView.tsx       # Validated name results
│   │   ├── CompareView.tsx       # Side-by-side comparison
│   │   ├── ValidationReportView.tsx  # PDF report generator
│   │   ├── SavedProjectsView.tsx # Project history
│   │   ├── AccountView.tsx       # User settings & API key
│   │   ├── AdminView.tsx         # Admin configuration
│   │   ├── MethodologyView.tsx   # 7-stage methodology explainer
│   │   ├── Header.tsx            # Navigation header
│   │   ├── Sidebar.tsx           # Side navigation
│   │   ├── Footer.tsx            # Site footer
│   │   ├── ErrorBoundary.tsx     # React error boundary
│   │   ├── LegalModals.tsx       # Privacy, terms, cookie consent
│   │   └── OnboardingTour.tsx    # First-time user tour
│   └── server/
│       ├── engine/
│       │   ├── pipeline.ts           # Pipeline orchestrator
│       │   ├── gemini-generator.ts   # Gemini AI name generation
│       │   ├── local-generator.ts    # Local coined name generation
│       │   ├── pronunciation.ts      # Pronunciation scoring
│       │   └── domain-checker.ts     # DNS domain availability
│       └── search/
│           ├── search-provider.interface.ts
│           ├── search-factory.ts
│           ├── gemini-grounding.provider.ts
│           ├── brave.provider.ts
│           ├── serper.provider.ts
│           └── google-search.provider.ts
```

---

## Firestore Data Model

### Collections

| Collection | Description |
|---|---|
| `users` | User profiles with plan, runs, API key, sessions |
| `projects` | Naming projects with brief, candidates, status |
| `name_runs` | Pipeline execution runs with stats & validated names |
| `search_cache` | Cached search results with TTL expiry |
| `admin_config` | Global application configuration |

See `firestore.rules` for security rules (user-owned data isolation with authenticated access).

---

## License

MIT License — see the [LICENSE](LICENSE) file for details.

---

<div align="center">
  <p>Built with ❤️ for founders who need unclaimed brand names.</p>
  <p>
    <a href="https://github.com/JSNrepo/find-names-for-my-brand">GitHub</a> •
    <a href="https://aistudio.google.com/app/apikey">Get Gemini API Key</a>
  </p>
</div>
