# Office Quest

A gentler, kid-friendly clone of [Human Resource Machine](https://tomorrowcorporation.com/humanresourcemachine) - same idea (program a little office worker to move numbers between an inbox, an outbox, and floor tiles), but with a flatter difficulty curve and modern web tech. Built for a 9-year-old, not for puzzle veterans.

"Office Quest" is a working title - rename it before shipping anywhere public, since the project intentionally avoids reusing Tomorrow Corporation's name or art assets.

## Design goals

- **Same core mechanic, gentler ramp.** One new idea per level, with extra repetition levels inserted after each new mechanic before the next one shows up.
- **Block-based control flow instead of jump arrows.** The original game implements loops/conditionals as goto-style jump-to-line arrows - that's the single biggest difficulty spike in the original curve. This clone uses nestable `If` / `Repeat Forever` blocks instead (Scratch-style), while keeping everything else (inbox/outbox, floor tiles, the "hand" you're carrying a value in) faithful to the original.
- **Forgiving by design.** Step-by-step playback, per-level program autosave, and plain-English error messages ("You tried to use an empty hand!") instead of a stack trace.

## Tech stack

- React + TypeScript + Vite
- Vitest for the interpreter/engine logic
- No backend - progress is saved to `localStorage`

## Project structure

- `src/engine/` - the pure interpreter (`types.ts`, `interpreter.ts`) and its test suite. No UI dependencies; this is the "virtual machine" that runs a program against a level.
- `src/levels/levels.ts` - level definitions (input, expected output, floor size, which instructions are unlocked).
- `src/components/editorTypes.ts` - the editor's instruction representation (same shape as the engine's `Instruction`, plus a stable `id` for React keys and step-playback highlighting).
- `src/components/InstructionList.tsx` - the recursive program editor (palette + nested blocks).
- `src/components/OfficeFloor.tsx` - the inbox/outbox/floor/worker visualization.
- `src/App.tsx` - wires level select, the editor, run/step controls, and localStorage persistence together.

## Running it

```bash
npm install
npm run dev      # http://localhost:5173
npm test         # engine unit tests
npm run build    # production build
```

## Current levels

1. **Mail Room** - copy everything from the inbox to the outbox.
2. **Busy Mail Room** - same mechanic, just more mail (repetition, no new concept).
3. **Coffee Break** - introduces floor tiles (`COPYFROM`/`COPYTO`) with a fixed two-item swap, no loop required yet.
4. **Double Trouble** - introduces `Repeat Forever` and `Add`, doubling every number that comes through.

## Deployment

Pushes to `main` build and deploy automatically to GitHub Pages via `.github/workflows/pages.yml`. In the repo's Settings -> Pages, set "Build and deployment" -> Source to "GitHub Actions". The site is served at `/HumanResourceMachineClone/`, which is why `vite.config.ts` sets a matching `base`.

## Roadmap / not-yet-built

- More levels covering `Sub`, `Bump Up/Down`, and `If` (negative/zero conditions), each with a repetition level after it.
- Drag-and-drop reordering in the editor (today you can only append/delete, not reorder).
- Real worker animation (walking between tiles) - today the worker is static and a caption describes each step. PixiJS is a good fit for this when we get there.
- Hint system for when a kid gets stuck.
- iOS packaging via Capacitor, once the web version is solid.
