# PolyPix — OCR‑Powered Accessible Language Chat

A minimal, fast, and accessibility‑first language practice app that turns real‑world text (photos, notes, menus, worksheets) into level‑appropriate conversations—instantly.

> Built by **Gongcha Warriors** • Repo: `gcw-mathpix-ocr-language-chat`

---

## Why PolyPix?

Reading a photo is easy; practicing natural conversation from it is not. PolyPix bridges that gap:

* **See → Understand → Practice** in one flow
* Designed to work well with assistive tech and low‑friction inputs

---

## What It Does (Quick Tour)

1. **Snap or upload text** (menu, worksheet, chat screenshot).
2. **Extracts clean text** via **Mathpix OCR** (including math and mixed scripts).
3. **Understands and reframes** content with **Gemini AI** into a short, level‑matched dialogue.
4. **Guides practice** in a chat UI (suggested replies, hints, rephrasing, slow mode).
5. **Speaks naturally** with **ElevenLabs** TTS (multi‑voice, multi‑language).
6. **Optionally checks speech** (voice input → text) to keep the loop tight.

---

## Core Features

* **Adaptive Conversation Generation**: Topic, register, and difficulty scale with learner choices and detected complexity.
* **One‑Screen Learning Flow**: Upload → level → practice. No labyrinth of settings.
* **Accessible by Default**:

  * Keyboard‑first navigation & visible focus states
  * Screen‑reader labels and live regions for streaming content
  * Dyslexia‑friendly fonts & adjustable spacing
  * Captioning + transcript for all audio; optional “slow speak”
* **Latency‑Aware**: Streams responses and audio progressively so learners aren’t waiting.
* **Privacy‑Respecting**: Content is session‑scoped by default (configurable).

---

## Architecture (High Level)

```
[Client (React/TypeScript/Tailwind)]
   ├─ Upload UI (camera / file)
   ├─ Chat Interface (prompt chips, hints, level control)
   ├─ A11y Controls (font size, contrast, dyslexia mode)
   └─ Audio Controls (play/pause, speed, transcript)

[Server (Node/Express)]
   ├─ /ocr          -> Mathpix OCR API
   ├─ /dialogue     -> Gemini (prompt chaining + safety)
   ├─ /tts          -> ElevenLabs streaming TTS
   ├─ /stt (opt)    -> speech‑to‑text verification (provider‑agnostic)
   └─ Policy & Rate limiting

[Vendors]
   ├─ Mathpix OCR   (image → structured text/LaTeX/markdown)
   ├─ Gemini AI     (topic modeling, leveling, dialogue crafting)
   └─ ElevenLabs    (natural TTS, multilingual, voices)
```

---

## Tech Stack

* **Frontend**: React + TypeScript + Vite + Tailwind (respects system settings; accessible components)
* **AI/ML**: Mathpix OCR, Gemini (text), ElevenLabs (TTS)
* **Server**: Node.js + Express
* **Build/Dev**: pnpm, ESLint, Prettier
* **(Optional)**: Mongo/Prisma if you enable saved sessions later

---

## Getting Started

### Prerequisites

* Node 18+ and **pnpm**
* API keys:

  * `MATHPIX_APP_ID`, `MATHPIX_APP_KEY`
  * `GEMINI_API_KEY`
  * `ELEVENLABS_API_KEY` (only if you enable TTS)
* (Optional) STT provider key if you enable speech‑back verification

### Setup

```bash
# clone
git clone https://github.com/monkikat/gcw-mathpix-ocr-language-chat.git
cd gcw-mathpix-ocr-language-chat

# install
pnpm install

# environment
cp .env.example .env
# fill in: MATHPIX_APP_ID, MATHPIX_APP_KEY, GEMINI_API_KEY, ELEVENLABS_API_KEY

# dev
pnpm dev    # starts client and server (or use separate scripts if split)
```

### Scripts

```bash
pnpm dev           # run locally
pnpm build         # production build
pnpm lint          # lint
pnpm preview       # preview production build
```

---

## Configuration

**.env**

```
MATHPIX_APP_ID=...
MATHPIX_APP_KEY=...
GEMINI_API_KEY=...
ELEVENLABS_API_KEY=...

# optional
ALLOW_ANALYTICS=false
ENABLE_STT=false
DEFAULT_LANGUAGE=en
```

**Tuning**

* `DEFAULT_LANGUAGE`: seed language for UI hints & voice
* `ENABLE_STT`: toggles speech‑back verification loop
* Rate limits configurable per provider to avoid throttling

---

## How the Pieces Fit (Flow Details)

1. **OCR (Mathpix)**

   * Cleans artifacts, preserves math/formatting if present
   * Returns structured text blocks that are easy to prompt with
2. **Understanding (Gemini)**

   * Analyzes topic, tone, vocabulary density
   * Generates 6–12 turn scaffold tailored to level (A1–C1)
   * Produces hint chips, acceptable‑answer ranges, and rephrase options
3. **Speaking (ElevenLabs)**

   * Streams voice for each assistant turn
   * Supports alternative voices, speed, and transcript download
4. **(Optional) Speech Check**

   * Light rubric (semantic similarity > exact match)
   * Encourages “close enough” + corrective nudge with examples

---

## Accessibility Notes

* WAI‑ARIA labels on all controls; chat updates announced via `aria-live="polite"`
* Color contrast meets WCAG AA; dyslexia mode increases letter spacing & switches to accessible type
* Keyboard shortcuts for send, replay, and next hint
* Captions & transcripts for all generated audio
* Motion reduced when `prefers-reduced-motion` is set

---

## Performance & Reliability

* **Progressive streaming** (text + audio) reduces perceived wait
* Image compression client‑side before OCR call
* Debounced uploads, back‑pressure, and retries for flaky connections
* Vendor calls isolated per route; graceful fallbacks if any vendor is down

---

## Security & Data Handling

* API keys are server‑side only
* Images and text are processed transiently for the session (no persistent storage by default)
* Optional “save session” toggle (if enabled later) uses hashed user IDs

---

## Demo Guide

* Use the **Sample Images** folder (menu, worksheet, bilingual sign)
* Toggle **Level: Beginner → Intermediate** to watch conversations adapt
* Try **Dyslexia Mode** and **Reduce Motion**
* Click **Speak** to hear ElevenLabs; open transcript for captions
* (Opt‑in) Use mic to attempt a reply and get a gentle correction

---

## Roadmap (Prioritized)

* **Now**: core OCR → dialogue → TTS loop with accessibility controls
* **Next**: user progress summaries; spaced‑repetition phrase bank
* **Later**: multi‑turn persona voices; offline cache; educator mode with batch prompts

---

## Implementation Notes (for Devs/Judges)

* Prompt chaining keeps system prompts minimal and composable
* Leveling heuristic mixes lexical frequency + sentence length + idiom density
* Safety: input sanitation, output moderation, and topic guardrails
* Vendor‑agnostic interfaces: swap TTS/STT providers without UI changes

---

## Limitations (Honest Edges)

* Handwriting recognition depends on image quality; Mathpix helps but not magic
* Long, domain‑dense texts are summarized before dialogue—by design
* STT omitted by default to keep setup simple (can be toggled on)

---

## Contributing

* Issues/PRs welcome. Please run `pnpm lint` before opening PRs.
* Add accessible labels and tests for any new interactive element.

---

## Credits

* **Mathpix OCR** for robust text extraction (including math)
* **Google Gemini** for dialogue generation & leveling
* **ElevenLabs** for natural, multilingual TTS

---

## License

MIT (see `LICENSE`)

---

### Appendix: Quick Facts

* **Usefulness**: turns any real‑world text into immediate, level‑matched practice
* **Innovation**: OCR → adaptive chat → natural TTS, all on one screen with a11y defaults
* **Technical Depth**: streaming, prompt chaining, vendor isolation, a11y engineering
* **Feasibility**: clean MVP architecture; optional features gated by flags
* **Scalability**: stateless by default; clear interfaces to add persistence later
