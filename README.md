# Bookt

Bookt is an AI-first booking agent for musicians: it organizes the full musician-specific path from finding an opportunity through venue research, relationship-aware outreach, negotiation, calendar checks, booking operations, reminders, payment, and rebooking. It is deliberately not a generic CRM, calendar, or email bot; the workflow and records are shaped around getting a solo performer booked and ready to play.

This V1 is a clean rebuild from product requirements. It intentionally does **not** include the earlier Replit “Gig Manager” prototype; only isolated reusable ideas—the signed-cookie authentication shape and the calendar-sync stub shape—were adapted from `ggrissom/GeorgeGrissomLive`.

## Architecture

- **Next.js 15 App Router + TypeScript + Tailwind CSS** for the responsive, server-rendered application.
- **Prisma + SQLite** for lightweight single-tenant V1 persistence. IDs use `cuid()` and fields are portable to Postgres later.
- **Single-admin HMAC cookie session** for the Bookt administrator. Routes other than `/login` and `/api/health` are protected.
- **Server actions** enforce lifecycle transitions, including no auto-send path for outreach messages.
- **Integration boundaries** live under `lib/integrations/`; Google Calendar is intentionally a no-op stub until credentials and OAuth are introduced.

## Data model

The model covers the artist, venues and their relationship status, venue contacts, opportunities and priority explanations, conversations/messages, one operational booking per opportunity, local calendar events, payments, actionable tasks, promotional assets, and integration readiness records.

SQLite does not support Prisma enums. The V1 schema stores the specified enum-like lifecycle values as `String` fields and validates them via typed `lib/constants.ts` values. This preserves a simple SQLite setup and a direct migration path to native Postgres enums later.

### Booking safeguards

- Moving an opportunity into `DATE_PROPOSED` or a later booking state causes `ensureBookingForOpportunity()` to create its associated booking exactly once.
- Moving to `TENTATIVE` or `CONFIRMED` checks local `CalendarEvent` overlaps first.
- Outreach uses a strict `draft → approved → sent` transition guard. A “send” action only records a local sent state and explicitly notes that delivery needs Gmail in Phase 2.
- Template drafting is deterministic and relationship-aware; no external AI calls occur in V1.

## Pages

- `/login` — single-admin sign-in.
- `/` — booking attention dashboard.
- `/venues`, `/venues/[id]` — relationship-aware venue directory and detail.
- `/opportunities`, `/opportunities/[id]` — scored pipeline, conversation, outreach review, and conflict gate.
- `/bookings`, `/bookings/[id]` — upcoming/past performance list and full logistics, payment, task record.
- `/calendar` — local event agenda and honest Google Calendar status.
- `/tasks` — cross-workflow follow-ups and reminders.
- `/settings/integrations` — readiness cards for Google Calendar, Gmail, Calendly, Twilio, and Sendblue.

## Setup

Prerequisites: Node.js 20+ and npm.

```bash
cp .env.example .env
npm install
npx prisma db push
npm run db:seed
npm run dev
```

Open `http://localhost:3000`. The seeded data is conspicuously fictional (`[Sample]` venue names and notes) and is for exercising the workflow only. Use the `ADMIN_EMAIL` and `ADMIN_PASSWORD` values from `.env` to sign in.

Useful commands:

```bash
npm run test
npm run build
npm run db:generate
```

## Environment

`.env.example` contains placeholders only for `DATABASE_URL`, admin credentials and session secret, Google Calendar service-account values, and an OpenAI key. Do not commit a real `.env` file or credentials.

## Roadmap

- **Phase 2:** Gmail and Google Calendar OAuth for Bookt itself; real AI-generated drafting with conversation context.
- **Phase 3:** SMS through Twilio and Calendly intake.
- **Phase 4:** A multi-tenant, venue-side product.
