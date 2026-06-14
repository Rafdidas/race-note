# AI Content Generation Design

## Goal

RaceNote administrators can generate, inspect, edit, and apply Korean beginner-oriented
race content without AI automatically changing reviewed or published content. A daily
Cloudflare Cron creates a small number of upcoming drafts with a strict cost ceiling.

## Confirmed Decisions

- Use the OpenAI Responses API with `gpt-5-nano` and Structured Outputs.
- Generate all eight content fields in one request:
  `summaryThreeLines`, `keyDriversOrTeams`, `raceVariables`, `beginnerRules`,
  `mustWatchReason`, `notificationText`, `seoTitle`, and `seoDescription`.
- Store generated output in a separate AI draft instead of writing directly to
  `race_contents`.
- Show and allow editing of all eight current-content and draft fields in the admin race
  editor.
- Manual generation handles one selected race.
- Daily generation runs at UTC `0 1 * * *` (10:00 KST), considers races starting within
  the next 14 days, and processes at most three races per run.
- Never automatically replace reviewed or published content.
- Manual regeneration of reviewed or published content requires an explicit warning
  confirmation, but still writes only to the separate draft.
- Leave `keyDriversOrTeams` empty when the stored RaceNote data does not provide reliable
  driver or team facts.
- Do not use web search, tools, or automatic API retries.

## Data Model

Add an `ai_content_drafts` table with one row per race. It contains the same eight content
fields as `race_contents`, plus:

- `status`: `ready`, `failed`, or `applied`
- `model`: the model used for the latest successful or failed attempt
- `error_message`: a short safe error summary for the latest failed attempt
- `generated_at`, `created_at`, and `updated_at`

The row is the latest draft and latest-attempt record, not an unbounded generation history.
On successful generation, the row is upserted to `ready`. On failure, existing draft
content is preserved while status and safe error details are updated. If no row exists, a
failed row with empty content is created.

Applying a draft copies its edited eight fields into `race_contents`, sets content to
`needs_review`, marks it as AI-generated but not reviewed, and marks the draft `applied`.
The draft remains visible as the latest applied AI output.

## Generation Architecture

A provider-neutral generation service receives a normalized race context and an
`OpenAiContentGenerator` dependency. Both administrator actions and Cron use this service.

The normalized input contains only stored RaceNote facts:

- series code and name
- race name, country, location, venue, and date range
- known sessions and must-watch sessions

The OpenAI adapter uses a direct `fetch` call, avoiding a new package. It requests strict
JSON matching the eight-field schema, uses a short Korean editorial prompt, and caps output
tokens. The parser treats the response as `unknown`, validates every field, limits array
lengths and string lengths, and converts unsupported or missing `keyDriversOrTeams` to
`null`.

## Target Selection And Cost Guardrails

The automatic runner selects races whose start date is between today and 14 days from
today, ordered by start date, with a hard limit of three.

Automatic generation is allowed when:

- no `race_contents` row exists or its status is `empty`;
- content is `generated` or `needs_review` because new or changed schedule data requires a
  fresh draft; and
- no `ready` draft already exists for the same race.

Automatic generation excludes `reviewed` and `published` content. Manual generation may
target any race, but protected content requires explicit confirmation. One request produces
all fields, no tools are enabled, and failed requests are not automatically retried within
the same run.

## Administrator Flow

The admin race editor displays:

1. Current content with all eight editable fields.
2. A Generate AI action and generation warning/status.
3. The latest AI draft with all eight editable fields.
4. An Apply Draft action.

Generation redirects back with a success or safe failure notice. A failed request leaves
current content and previous draft fields unchanged. Applying the edited draft changes only
the current content and its review status; publication still requires the existing review
and publish actions.

## Cron Routing

Add `0 1 * * *` to Wrangler Cron triggers. The Worker scheduled handler routes this exact
expression to the AI runner and keeps the two existing schedule-sync expressions routed to
schedule synchronization. The AI route requires `DB` and `OPENAI_API_KEY`; a missing key
fails the AI run without affecting schedule synchronization.

## Error Handling And Security

- The OpenAI key remains in `.env.local` and Cloudflare secrets and is never logged or
  returned to the browser.
- OpenAI HTTP failures, timeouts, malformed JSON, and validation failures produce safe
  administrator messages and update only draft attempt status.
- Raw provider response bodies are not stored.
- Administrator generation and draft application are protected by the existing server-side
  admin session check.
- D1 multi-write operations use atomic `batch()` rather than transactions.

## Testing And Verification

- Unit-test Structured Output validation, unsupported facts, and malformed responses.
- Unit-test target selection, 14-day window, three-race limit, protected-status exclusion,
  and ready-draft exclusion.
- Unit-test all-eight-field admin form parsing and explicit protected-content confirmation.
- Verify the migration in SQLite, including repeated seed/migration behavior and foreign
  keys.
- Run `npm test`, `npm run lint`, `npm run build`, `npm run cf:build`, `npm run cf:types`,
  and `npx wrangler deploy --dry-run`.
- Before any remote migration, secret registration, or deployment, obtain explicit user
  approval as required by `AGENTS.md`.

