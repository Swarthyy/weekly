# Weekly Expo Migration

Single-codebase Expo TypeScript app migrated from `weekly-app-demo.html` with contract-driven sectors.

## Targets
- Web via Expo web
- iOS simulator via Expo iOS

## New Product Capabilities
- Custom life sector wizard with:
  - sector intent
  - signals
  - anti-patterns
  - core prompts
  - advanced prompts
  - priority + sensitivity flags
- Max active sectors guard (`7`) to reduce review fatigue
- Preset framework import:
  - Week 18 Framework
  - Week 12 Framework
- Dynamic reflection rendering from each sector contract
- Advanced prompt collapse per sector
- Low-priority sector badges
- Privacy-aware export toggle for sensitive sectors
- Dynamic scoring from sector ratings + auto-generated insights
- v0.5 Daily Cockpit shell:
  - `Status` tab
  - `Capture` tab
  - `Vault` tab
- Sunday hero card routes into weekly Review (Review no longer in persistent nav)
- Backend routes for Hevy + food analysis:
  - `GET /api/hevy/summary`
  - `POST /api/webhooks/hevy`
  - `GET /api/hevy/connect-url`
  - `GET /api/withings/connect-url`
  - `GET /api/auth/withings/callback`
  - `POST /api/webhooks/withings`
  - `POST /api/food/analyze-text`
  - `POST /api/food/analyze-image`

## Run
```bash
npm install
npm run start
npm run web
npm run ios
npm run dev:api
npm run dev:web
npm run sync:github
```

## API Setup (Hevy + Withings)
Create `.env` in project root:

```bash
EXPO_PUBLIC_HEVY_BASE_URL=https://api.hevyapp.com
EXPO_PUBLIC_OPENAI_API_KEY=your_openai_key_optional
EXPO_PUBLIC_API_BASE_URL=http://localhost:8787

HEVY_API_KEY=your_hevy_api_key
HEVY_WEBHOOK_SECRET=Bearer your_hevy_webhook_secret
OPENAI_API_KEY=your_openai_api_key_optional
WITHINGS_CLIENT_ID=your_withings_client_id
WITHINGS_CLIENT_SECRET=your_withings_client_secret
WITHINGS_REDIRECT_URI=https://<your-public-callback-host>/api/auth/withings/callback
PORT=8787
```

Notes:
- Hevy API uses `api-key` header.
- Frontend now calls local backend routes for Hevy and food parsing.
- Webhook endpoint for Hevy subscription is: `http://<your-host>:8787/api/webhooks/hevy`
- Withings provider checks callback URL reachability with HTTP `HEAD`.
- Use a stable public tunnel/domain for Withings callbacks and webhooks.

## GitHub Push Workflow
- `npm run sync:github` stages all tracked changes, commits with a timestamp message, and pushes `main`.
- Optional custom message:
```bash
powershell -ExecutionPolicy Bypass -File scripts/sync-github.ps1 -Message "feat: your message"
```

## Validation Commands Used
```bash
npx tsc --noEmit
npx expo export --platform web
```

## Key Files
- `App.tsx`: root state, sector contract orchestration, review flow wiring
- `src/types/app.ts`: contract/entry/prompt schemas
- `src/data/demoData.ts`: starter sectors, preset packs, score/insight/export helpers
- `src/screens/OnboardingSectors.tsx`: sector picker + custom wizard + preset import
- `src/screens/ReviewTab.tsx`: dynamic contract-driven weekly reflection + privacy toggle
- `src/components/ScoringCards.tsx`: animated score cards from dynamic sector scores

## Scope Notes
- Data is local in-memory for this phase (no backend sync)
- iOS is simulator-only in this phase
- Android/store distribution remain out of scope
