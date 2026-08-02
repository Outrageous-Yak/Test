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

**Phase 0–3** ✅ Foundation, menu, character & car selection  
**Phase 4** ✅ Track selection & race-loading flow  
**Phase 5** ✅ First playable race prototype (Mango Meadows)

Phase 5 implemented:

- `RaceScene` with arcade driving physics
- Procedural Mango Meadows track (`TrackRenderer`)
- Player car with auto-acceleration, steering, and braking
- Smooth camera follow with zoom and world bounds
- Touch controls (LEFT/RIGHT/BRAKE) and desktop arrow keys
- Pause menu (Resume, Restart Race, Main Menu)
- Debug HUD (Speed, FPS) toggled with D key
- Version **0.5.0**

## Roadmap

| Phase | Focus |
|-------|-------|
| **Phase 0–5** | Complete ✅ |
| **Phase 6** | AI opponents, laps, checkpoints, polish |

## Deployment

**Live URL:** https://outrageous-yak.github.io/Test/

Deploys automatically via GitHub Actions on merge to `main`.

## License

Private project — all rights reserved.
