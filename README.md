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
| Race | Nudge pad steer (analog), ↓ brake, D debug, Esc pause |

## Tracks

| Track | Difficulty | Default State |
|-------|------------|---------------|
| Mango Meadows | Easy | Unlocked (playable) |
| Ruby Coast | Medium | Locked until Mango Meadows win (playable when unlocked) |
| Volcano Rush | Hard | Locked until Ruby Coast win (playable when unlocked) |

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
**Phase 10** ✅ Playable Volcano Rush and three-track completion

Phase 10 implemented:

- Volcano Rush fully playable via the shared `TrackRegistry`
- Unique volcanic circuit with lava bridge, switchback, chicane, and crater curve
- Career completion when all three tracks are won (1st place each)
- Career screen shows per-track status and CAREER COMPLETE badge
- Independent Volcano Rush best times and save compatibility
- Version **1.0.0** — first complete three-track gameplay build

## Roadmap

| Phase | Focus |
|-------|-------|
| **Phase 0–10** | Complete ✅ |
| **Phase 11** | Audio, polish, garage upgrades |

## Deployment

**Live URL:** https://outrageous-yak.github.io/Test/

Deploys automatically via GitHub Actions on merge to `main`.

## License

Private project — all rights reserved.
