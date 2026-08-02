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
**Phase 7** ✅ AI opponents, race position, and finishing order

Phase 7 implemented:

- Three AI racers (Citrus, Pepper, Berry) with distinct driving profiles
- Four-car starting grid on Mango Meadows
- AI path-following with rubber-banding and stuck recovery
- Independent checkpoint and lap tracking per racer
- Live player position HUD (1 / 4)
- Car-to-car collisions
- Full four-racer finishing order in results
- Post-player-finish timeout with DNF classification
- Version **0.7.0**

## Roadmap

| Phase | Focus |
|-------|-------|
| **Phase 0–7** | Complete ✅ |
| **Phase 8** | Progression, unlocks, audio, polish |

## Deployment

**Live URL:** https://outrageous-yak.github.io/Test/

Deploys automatically via GitHub Actions on merge to `main`.

## License

Private project — all rights reserved.
