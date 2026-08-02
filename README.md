# Mango & Ruby Racing

A fun, colourful, mobile-first arcade racing game designed primarily for iPhone.

## Technology

Vite · TypeScript · Phaser 3 · PWA · Local Storage

## Installation

```bash
git clone https://github.com/Outrageous-Yak/Test.git
cd Test
npm install
```

## Development

```bash
npm run dev
```

Open `http://localhost:5173/Test/`

## Build & Test

```bash
npm test
npm run build
npm run preview
```

## Selection Flow

```text
Main Menu → Character Select → Car Select → Track Select → Race Loading (placeholder)
```

Backward navigation retains all valid selections. Selections persist across reloads.

### Keyboard Controls

| Scene | Keys |
|-------|------|
| Character Select | ← Mango, → Ruby, Enter, Esc |
| Car Select | ← Mango Car, → Red Car, Enter, Esc |
| Track Select | ← prev unlocked, → next unlocked, Enter, Esc |
| Race Loading | Enter (START RACE placeholder), Esc |

## Tracks

| Track | Difficulty | Default State |
|-------|------------|---------------|
| Mango Meadows | Easy | Unlocked |
| Ruby Coast | Medium | Locked |
| Volcano Rush | Hard | Locked |

## Current Phase

**Phase 0–3** ✅ Foundation, menu, character & car selection  
**Phase 4** ✅ Track selection & race-loading flow

Phase 4 implemented:

- Three track cards with placeholder Phaser previews
- `TrackCard` component with difficulty display and locked state
- Track selection persistence via `GameState` / `SaveSystem`
- `unlockTrack()` API for future progression
- `RaceLoadingScene` placeholder with racer/car/track/laps summary
- Version **0.4.0**

## Roadmap

| Phase | Focus |
|-------|-------|
| **Phase 0–4** | Complete ✅ |
| **Phase 5** | Core racing gameplay |
| **Phase 6** | AI, boost, polish |

## Deployment

**Live URL:** https://outrageous-yak.github.io/Test/

Deploys automatically via GitHub Actions on merge to `main`.

## License

Private project — all rights reserved.
