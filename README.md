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
| Mango Meadows | Easy | Unlocked |
| Ruby Coast | Medium | Locked |
| Volcano Rush | Hard | Locked |

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

Phase 8 implemented:

- Career progression with coins, best times, and statistics
- Ruby Coast unlocks after winning Mango Meadows (1st place only)
- Expanded race results with coins, best time, and unlock messages
- Career screen from main menu (coins, wins, races, best times, fastest lap)
- Track cards show LOCKED / UNLOCKED / ✓ COMPLETE with best times
- Reset Career in Settings (preserves audio and control preferences)
- Safe migration for existing `mango-ruby-racing-save-v1` saves
- Version **0.8.0**

## Roadmap

| Phase | Focus |
|-------|-------|
| **Phase 0–8** | Complete ✅ |
| **Phase 9** | Ruby Coast gameplay, audio, polish |

## Deployment

**Live URL:** https://outrageous-yak.github.io/Test/

Deploys automatically via GitHub Actions on merge to `main`.

## License

Private project — all rights reserved.
