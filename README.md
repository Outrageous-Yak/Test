# Mango & Ruby Racing

A fun, colourful, mobile-first arcade racing game designed primarily for iPhone. Play in Safari, install as a Progressive Web App, and race without an App Store.

## Technology

| Tool | Purpose |
|------|---------|
| [Vite](https://vitejs.dev/) | Build tool and dev server |
| [TypeScript](https://www.typescriptlang.org/) | Type-safe JavaScript |
| [Phaser 3](https://phaser.io/) | HTML5 game framework |
| HTML5 Canvas | Rendering |
| CSS | Layout, safe areas, rotation overlay |
| Local Storage | Settings and game-state persistence |

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

Open the URL shown in the terminal (typically `http://localhost:5173/Test/`).

## Production Build

```bash
npm run build
npm run preview
```

## Testing

```bash
npm test
```

## Menu Flow

```text
Main Menu → Character Select → Car Select → Track Select (placeholder)
```

Backward navigation retains character and car selections. Selections persist across page reloads.

### Keyboard Controls

| Scene | Keys |
|-------|------|
| Character Select | ← Mango, → Ruby, Enter continue, Esc back |
| Car Select | ← Mango Car, → Red Car, Enter continue, Esc back |
| Track Select | Esc back to Car Select |

## Folder Overview

```text
src/game/
  data/characters.ts, cars.ts
  state/GameState.ts, gameStateTypes.ts
  systems/SaveSystem.ts
  scenes/ — Boot, Preload, MainMenu, CharacterSelect, CarSelect, TrackSelect
  ui/ — TouchButton, MenuPanel, CharacterCard, CarCard
  utils/ — scene transitions, vibration, flow recovery
```

## Current Phase

**Phase 0 — Foundation** ✅  
**Phase 1 — Main Menu & Core Game State** ✅  
**Phase 2 — Character Selection** ✅  
**Phase 3 — Car Selection & Track Placeholder** ✅

Phase 3 implemented:

- Mango Car and Red Car selectable cards with placeholder Phaser graphics
- `CarCard` reusable component (selected/locked states)
- Car selection updates `GameState.selectedCar` and persists via `SaveSystem`
- `TrackSelectScene` placeholder showing racer and car choices
- Invalid flow recovery (missing character/car redirects safely)
- Version **0.3.0**

## Planned Roadmap

| Phase | Focus |
|-------|-------|
| **Phase 0–3** | Foundation through car selection ✅ |
| **Phase 4** | Track selection and core racing loop |
| **Phase 5** | Power-ups, AI, polish |

## Deployment

Deploys automatically to GitHub Pages on merge to `main`.

**Live URL:** https://outrageous-yak.github.io/Test/

Set Pages source to **GitHub Actions** in repository settings.

## License

Private project — all rights reserved.
