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
Main Menu → Character Select → Car Select → Track Select → Race Loading → Race

Main Menu also includes **Career** (progression summary) and **Settings → Reset Career**.
```

Backward navigation retains all valid selections. Selections persist across reloads.

### Keyboard Controls

| Scene | Keys |
|-------|------|
| Character Select | ← Mango, → Ruby, Enter, Esc |
| Car Select | ← Mango Car, → Red Car, Enter, Esc |
| Track Select | ← prev unlocked, → next unlocked, Enter, Esc |
| Race Loading | Enter (START RACE), Esc |
| Race | ← → steer, ↓ brake, D debug, Esc pause |

## Tracks

| Track | Difficulty | Default State |
|-------|------------|---------------|
| Mango Meadows | Easy | Unlocked (playable) |
| Ruby Coast | Medium | Locked until Mango Meadows win (playable when unlocked) |
| Volcano Rush | Hard | Locked until Ruby Coast win (unlocked in career, playable Phase 10) |

## Current Phase

**Phase 0** ✅ Foundation  
**Phase 1** ✅ Main menu & save system  
**Phase 2** ✅ Character selection  
**Phase 3** ✅ Car selection  
**Phase 4** ✅ Track selection & race loading  
**Phase 5** ✅ First playable driving prototype  
**Phase 6** ✅ Race rules, checkpoints, laps, timer, and finish state  
**Phase 7** ✅ AI opponents, race position, and finishing order  
**Phase 8** ✅ Career progression, unlocks, best times, and persistent save  
**Phase 9** ✅ Multi-track engine and playable Ruby Coast

Phase 9 implemented:

- Reusable multi-track architecture with `TrackRegistry` and typed track definitions
- Mango Meadows migrated to the new engine without gameplay changes
- Ruby Coast fully playable — coastal circuit with unique geometry, checkpoints, and AI path
- Dynamic race loading from `GameState.selectedTrack` (no Mango Meadows default)
- Winning Ruby Coast unlocks Volcano Rush (visible as unlocked but not yet playable)
- Track-specific camera, barriers, grid, and AI tuning per track
- Version **0.9.0**

## Roadmap

| Phase | Focus |
|-------|-------|
| **Phase 0–9** | Complete ✅ |
| **Phase 10** | Volcano Rush gameplay, audio, polish |

## Deployment

**Live URL:** https://outrageous-yak.github.io/Test/

Deploys automatically via GitHub Actions on merge to `main`.

## License

Private project — all rights reserved.
