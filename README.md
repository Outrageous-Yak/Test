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

Phase 6 implemented:

- Pre-race countdown (3, 2, 1, GO!) with input lock until GO
- Ordered checkpoint system around Mango Meadows (8 zones)
- Three-lap race with start-line exploit protection
- Race timer (`mm:ss.mmm`) with pause/resume support
- Race HUD (lap counter + elapsed time)
- Wrong-way detection with sustained feedback
- Missed-checkpoint protection at finish line
- Finish state and results panel (RACE AGAIN / MAIN MENU)
- Expanded debug mode (checkpoint zones, indices, race phase)
- Version **0.6.0**

## Roadmap

| Phase | Focus |
|-------|-------|
| **Phase 0–6** | Complete ✅ |
| **Phase 7** | AI opponents, race positions, progression |

## Deployment

**Live URL:** https://outrageous-yak.github.io/Test/

Deploys automatically via GitHub Actions on merge to `main`.

## License

Private project — all rights reserved.
