# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

React + Vite (user decision). The project currently holds a single static `index.html`
prototype; it is superseded by the React app and kept only as visual evidence.
Google sign-in and backend services are planned next and are not yet built.

## Users

Broad Indian consumers — not a profession-restricted audience. The person opening
Nuzio wants the day's news without reading it: they are getting ready, commuting,
or otherwise occupied, so audio is the primary channel and the screen is glanced at
rather than studied. Profession and niche selection exist as personalisation inputs,
not as an audience gate.

## Product Purpose

Nuzio AI delivers a short, personalised audio news brief every morning. The user
picks a language, a set of niches, a narrator voice, a length, and a delivery time;
Nuzio assembles and narrates a brief matching those choices and has it waiting at
that time. Success is the user listening to the brief most mornings and trusting it
as their complete news intake.

## Positioning

A personalised, AI-narrated daily brief built for Indian listeners in both English
and Hindi — assembled per user from their chosen niches and delivered at a chosen
time, rather than a fixed podcast episode or an endless article feed.

## Operating Context

- Consumed in the morning: commute, gym, kitchen, getting ready.
- Hands and eyes are often busy; the audio player and lock-screen/notification
  surfaces carry more weight than dense reading layouts.
- Onboarding is a one-time five-step setup (profession → niches → voice → time →
  notifications) that determines every later brief.
- Two content surfaces: the assembled morning brief, and a browsable Discover feed.

## Capabilities and Constraints

- Languages: English and Hindi.
- Narrator voices: exactly three — two English (Aria, British warm; Kai, American
  crisp) and one Hindi (Meera).
- Brief lengths: 5 / 10 / 15 minutes, plus a custom option.
- Location permission is requested to surface hyperlocal stories; city only.
- Push notifications: brief-ready (daily), breaking story (rare), weekly digest.
- News cards carry **no imagery** — a "Source" affordance stands in its place, so
  provenance is always one tap away.
- Google sign-in and all backend services are not yet implemented.
- Sample story content and story counts in the prototype are placeholder text.

## Brand Commitments

- Name and wordmark: **Nuzio AI**, set with a waveform mark. The logo must render
  large and legible; no descriptive tagline is locked to the mark itself.
- Tagline on the landing/splash surface: **"News on go"**.
- Palette: blue and green accents only. Purple, violet and neon treatments are
  explicitly rejected.
- Background: black, in the flat "Uber black" sense — one committed dark ground
  across every screen, not mixed or gradient-washed.
- Typography: mixed-weight sans headlines. Italic serif display type is rejected.
- Profession and niche selection use a dense, staggered circular tile grid.
- Voice options are rectangular cards, never circular tiles.

## Evidence on Hand

- `index.html` — the incumbent 13-screen static prototype (visual evidence only).
- Client-supplied logo reference and a 14-screen prototype board supplied as images.
- No user research, testimonials, press, usage data, or partner logos exist. None
  may be fabricated.

## Pricing (confirmed)

Free ₹0/mo · Pro ₹79/mo · Pro Annual ₹1,499/yr. Confirmed by the client as real,
committed prices, not placeholders.

## Product Principles

1. **Audio is the product; the screen is the remote.** Every layout decision answers
   to someone who is listening, not reading.
2. **Setup earns every later brief.** The five onboarding steps are the entire
   personalisation contract — they should feel considered, not like a form.
3. **Provenance is never buried.** With no imagery to lean on, the source is the
   credibility surface and stays reachable on every story.
4. **Two languages, one product.** Hindi is a first-class path, not a translation
   afterthought.
5. **Mass-market, not insider.** Nothing in the language or hierarchy should assume
   a finance or tech reader.

## Accessibility & Inclusion

Hindi and English must both render correctly, including Devanagari at display sizes.
No product-specific standard has been established beyond that; ordinary contrast and
touch-target floors apply.
