# Weekly App PRD (Questionnaire-Driven Onboarding)

## Document Meta
- Product: Weekly (Expo web + mobile shell)
- Version: v0.4 draft
- Date: February 11, 2026
- Owner: Swart
- Purpose: Align on what is already built vs. what remains before scaling onboarding + sector intelligence.

## 1. Product Vision
Weekly should help users run structured weekly self-reviews across sectors that are truly relevant to their real life, including unusual/custom sectors (e.g., `jamesmgmt`).

The system should:
- discover who the user is via lightweight but deep profiling,
- generate a high-quality sector map,
- let user verify/edit/decline sectors,
- run a consistent weekly review ritual on top of those sectors.

## 2. Problem Statement
Most habit/review apps force generic categories. Power users have non-standard responsibilities and identities. If sector setup is rigid, the app stops feeling personal and quickly gets abandoned.

## 3. Goals
### Primary Goals
- Replace static sector selection with intelligent, questionnaire-first onboarding.
- Support custom sectors from freeform narrative.
- Keep onboarding simple while still deeply personal.
- Preserve weekly review consistency with structured contracts.

### Non-Goals (Current Phase)
- Multi-user collaboration
- Backend sync/auth
- Full AI-generated coaching narratives
- Production-grade secure AI orchestration

## 4. Current Build Status (Implemented)
### 4.1 Platform
- Expo TypeScript app running on web.
- Modularized architecture with typed domain models.

### 4.2 Contract-Driven Review Core
Implemented:
- `SectorContract` schema
- `WeeklyEntry` schema
- dynamic prompt rendering from contract
- rating + intention capture
- dynamic scoring cards
- summary insights generated from scores
- privacy toggle for sensitive sectors before export

### 4.3 Questionnaire Onboarding (Implemented)
Implemented in `src/screens/OnboardingSectors.tsx`:
- sequential yes/no questions
- freeform profile input
- deterministic sector extraction fallback
- optional AI-assisted extraction (if `EXPO_PUBLIC_OPENAI_API_KEY` exists)
- sector verification/edit/remove screen
- active-sector cap (7 max)

### 4.4 Bug Fix Applied
Fixed issue where final yes/no step did not advance to freeform stage.
- Root cause: step increment condition blocked on final question.
- Fix: allow progression when `stepIndex < surveyQuestions.length`.

### 4.5 External Design Review Integrated (Claude)
Accepted into direction:
- Front-load identity, defer detail.
- Make freeform input the primary engine.
- Move to two-pass AI extraction.
- Use reason chips + confidence-based ordering (not raw numbers as primary UX).
- Replace hard 7-sector binary with scored vs awareness tiers.
- Treat re-onboarding as recurring “season reset,” not one-time setup.

## 5. What Is Still Missing / Incomplete
### 5.1 Questionnaire Quality (Major)
Current questionnaire is functional but shallow for identity modeling.
Needed:
- conditional branching questions
- intensity/frequency questions
- role clarity questions (owner vs participant)
- time-budget + stress-source questions
- outcome-priority ranking

### 5.2 AI Extraction Architecture (Major)
Current AI extraction is client-side direct call (prototype only).
Needed:
- move AI calls to server endpoint
- prompt versioning + schema validation
- strict JSON parser + recovery path
- rate limiting and error taxonomy

### 5.3 Sector Contract Fidelity (Major)
Current generated contracts use generic prompts/signals.
Needed:
- sector-specific prompt templates by archetype (student, creator, athlete, manager, etc.)
- scoring anchor quality improvements (0/5/8/10)
- anti-pattern suggestions tailored to sector type

### 5.4 Verification UX (Medium)
Needed:
- bulk actions (activate top N, deactivate all low-priority)
- duplicate detection UI
- explanation chips (why sector was generated)
- confidence grouping/sorting

### 5.5 Review Engine Depth (Medium)
Needed:
- weighted sectors / priority impact on overall score
- low-priority sectors contributing less to weekly total
- optional carryover tasks/open loops from prior weeks

### 5.6 Persistence (Major)
Needed:
- local persistence (AsyncStorage) at minimum
- eventual backend sync (future phase)

## 6. Recommended Onboarding Framework
### 6.0 Target Onboarding Flow (v0.4)
1. **Fast identity capture (30 seconds)**
- Role multi-select (student, employee, creator, athlete, musician, manager, etc.).
- One pressure prompt: “What is consuming you most right now?”

2. **Primary freeform input**
- Prompt: “In a few sentences, what does a typical week actually look like for you?”

3. **Pass 1 extraction**
- Generate candidate sectors + reason traces + confidence metadata.

4. **Verification stage**
- High-confidence sectors first (pre-toggled).
- Low-confidence sectors in a “we’re less sure” section.
- User edit/approve/reject per sector.

5. **Pass 2 generation**
- Generate full sector contracts only for approved sectors.

6. **Deferred refinement**
- Ask output/privacy/weighting questions after candidate visibility.

### 6.1 Better Questions Blocks
#### Block A: Identity & Role
- Which roles describe you this season? (student, creator, employee, founder, athlete, musician, coach, manager, etc.)
- Which 2 roles matter most in the next 8 weeks?

#### Block B: Commitments
- What commitments are non-negotiable weekly?
- What domains currently create the most pressure?

#### Block C: Output & Accountability (deferred)
- Where are outcomes measurable?
- Which domains need strict score accountability vs lightweight awareness?

#### Block D: Risk & Privacy (deferred)
- Any sensitive domains to track privately?
- Should sensitive sectors be excluded by default from export?

#### Block E: Freeform Context
- “Describe your real life setup in your own words.”
- Includes unusual/custom domains (e.g., `jamesmgmt`).

#### Block F: Verification
- Proposed sectors with confidence + reason.
- User can edit name, icon, intent, priority, sensitivity, activate/deactivate.

## 7. Functional Requirements (Next Iteration)
1. Onboarding must support role multi-select + short pressure prompt before deeper questions.
2. Freeform context must be first-class input and weighted higher than binary answers.
3. Extraction must run in **two passes**:
- Pass 1: candidate sectors + reason traces + confidence metadata.
- Pass 2: contract generation only for approved sectors.
4. Every generated sector must include a visible reason chip in verification UI.
5. Verification UI must support approve/edit/reject + confidence-based ordering.
6. Sector model must support `mode: scored | awareness`.
7. Up to 7 scored sectors may affect weekly score; additional sectors may remain awareness-only.
8. Sensitive sectors must be redacted by default on export unless explicitly included.
9. Onboarding output must create valid review contracts with no manual dev intervention.
10. App must support recurring season reset (default cadence: every 8 weeks).

## 8. Data Model Requirements (Target)
### Entities
- UserProfile
- SectorContract
- WeeklyEntry
- SectorGenerationCandidate
- SectorGenerationTrace
- SeasonProfile

### Key Fields
- `SectorGenerationCandidate.confidence: number`
- `SectorGenerationTrace.reason: string`
- `SectorContract.templateType: string`
- `SectorContract.weight: number`
- `SectorContract.mode: "scored" | "awareness"`
- `SeasonProfile.startedAt: ISODate`
- `SeasonProfile.resetEveryWeeks: number`

## 9. Acceptance Criteria for Next Milestone
1. User can complete onboarding end-to-end without dead-ends.
2. At least 80% of generated sectors are accepted without rename/delete in internal test set.
3. Custom domain terms from freeform (e.g., `jamesmgmt`) appear in candidate list.
4. Verification shows reason chips for every candidate sector.
5. High-confidence candidates are sorted first and pre-selected.
6. Scored sectors are capped at 7; awareness sectors can exceed cap without score impact.
7. Redaction toggle works for sensitive sectors in export.
8. Review screen renders contracts generated in pass 2 with no missing prompt state.

## 10. Risks and Pushback
### Product Risk
- Too many sectors/prompts will cause review fatigue.
Mitigation: hard scored cap + awareness mode + advanced collapse.

### AI Risk
- Client-side API key exposure is not production-safe.
Mitigation: server proxy before production.

### UX Risk
- Overly long questionnaire can reduce completion.
Mitigation: fast identity capture + progressive disclosure + completion indicator.

### Trust Risk
- Users may distrust sector generation if rationale is opaque.
Mitigation: reason chips + editable candidates + low-confidence grouping.

## 11. Recommended Build Sequence
1. Reshape onboarding flow to fast identity + primary freeform.
2. Implement pass 1 candidate extraction with reason/confidence metadata.
3. Build verification UI with confidence sorting and low-confidence grouping.
4. Implement pass 2 approved-only contract generation.
5. Add scored vs awareness sector modes (7 scored cap retained).
6. Add local persistence.
7. Move AI extraction behind server endpoint.
8. Add season reset loop (8-week default) + onboarding analytics.

## 12. Current File References (for Claude handoff)
- `App.tsx`
- `src/screens/OnboardingSectors.tsx`
- `src/screens/ReviewTab.tsx`
- `src/data/demoData.ts`
- `src/types/app.ts`

## 13. Discussion Prompts for Claude Review
1. Should contracts split into `Template` and `Instance` models now, or after persistence is added?
2. For pass 1 extraction, should confidence be model-native, heuristic, or hybrid?
3. Should awareness sectors be time-boxed to one optional prompt only?
4. Should sensitive sectors default to awareness mode unless user upgrades them to scored?
5. Should season reset be hard-timed (every 8 weeks) or trigger-based (drift signals)?
