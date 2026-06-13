# Admin Editor Actions Design

## Goal

Allow authenticated administrators to correct collected race data, review
content, and control publication without turning RaceNote into a manual-entry
system.

## Scope

Administrators can edit existing races only. Automatic collection remains the
source of new race and session records. Manual override protection during future
sync runs is deferred to the sync design because the current schema has no
field-level override metadata.

## Editable Fields

- Race: name, country, location, start date, end date
- Session: name, UTC start timestamp, must-watch flag
- Content: three-line summary, must-watch reason, beginner rules, race variables

## State Transitions

- Save updates editable fields, marks content `needs_review`, and leaves the
  current publication state unchanged.
- Mark reviewed clears race and session review flags, changes content to
  `reviewed`, and marks pending change logs `auto_applied`.
- Publish is allowed only when race/session review flags are clear and content
  is `reviewed` or `published`. It changes race and content to `published`.
- Unpublish changes only the race publication state to `draft`.
- AI generation remains disabled until the AI generation milestone.

## Security And Errors

- Every Server Action verifies the admin session and rechecks the target race.
- Form input is parsed and validated on the server.
- Validation and state-transition failures redirect back with a generic,
  user-readable message.
- Successful actions revalidate admin and public routes.

## Verification

- Unit tests cover form parsing, UTC/date validation, and publish eligibility.
- Run tests, lint, Next build, OpenNext build, Cloudflare types, and Wrangler
  dry-run.
