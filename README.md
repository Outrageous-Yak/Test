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

For mobile testing on the same network, use your machine's local IP address.

## Production Build

```bash
npm run build
```

Output is written to the `dist/` folder.

Preview the production build locally:

```bash
npm run preview
```

## Testing

```bash
npm test
```

Runs unit tests for character data, save system, and state merging logic.

## Folder Overview

```text
src/
  main.ts                 # Entry point — initialises state and Phaser game
  game/
    config.ts             # Phaser game configuration
    constants.ts          # Shared constants (dimensions, colours, paths)
    types.ts              # TypeScript type definitions
    data/
      characters.ts       # Mango & Ruby character definitions
    state/
      GameState.ts        # Central singleton game state
      gameStateTypes.ts   # Serializable state types and defaults
    systems/
      SaveSystem.ts       # Versioned local-storage persistence
    scenes/
      BootScene.ts        # Initial setup, transitions to Preload
      PreloadScene.ts     # Asset loading (placeholder locations)
      MainMenuScene.ts    # Main menu with modal panels
      CharacterSelectScene.ts  # Mango & Ruby character selection
      CarSelectScene.ts   # Phase 2 placeholder for car selection
    entities/             # Future: cars, characters
    tracks/               # Future: track definitions
    ui/                   # TouchButton, MenuPanel, CharacterCard
    audio/                # Future: audio management
    utils/                # Helpers, scene transitions, vibration
  assets/
    images/               # Future: sprite and texture assets
    audio/                # Future: sound and music files
    fonts/                # Future: custom fonts
  styles/
    main.css              # Global styles, safe areas, rotation overlay

public/
  icons/                  # PWA placeholder icons

.github/workflows/
  deploy.yml              # GitHub Pages deployment
```

## Current Phase

**Phase 0 — Foundation & Project Setup** ✅

**Phase 1 — Main Menu & Core Game State** ✅

**Phase 2 — Character Selection & Selection Flow** ✅

Phase 2 implemented:

- Mango and Ruby selectable character cards with placeholder portraits
- `CharacterCard` reusable UI component (selected/locked states)
- Selection updates `GameState.selectedCharacter` and persists via `SaveSystem`
- CONTINUE disabled until a character is chosen; opens `CarSelectScene` placeholder
- Keyboard: ← Mango, → Ruby, Enter continues, Esc goes back
- Scene fade transitions; version bumped to **0.2.0**

### State Architecture

Game state is accessed via a typed singleton (`GameState`) in `src/game/state/GameState.ts`. State is loaded from local storage on startup and persisted automatically when settings or selections change. Scenes import `GameState` directly — no parameter passing or external state library.

Not yet implemented (by design):

- Final character artwork, car selection, tracks, physics, AI, audio playback, gameplay

## Planned Roadmap

| Phase | Focus |
|-------|-------|
| **Phase 0** | Foundation & project setup ✅ |
| **Phase 1** | Main menu & core game state ✅ |
| **Phase 2** | Character selection & selection flow ✅ |
| **Phase 3** | Car selection, track select placeholder, core racing loop |
| **Phase 4** | Power-ups, boost, AI opponents |
| **Phase 5** | Garage upgrades, leaderboards |

## Deployment

The project deploys automatically to GitHub Pages when changes are merged into `main`.

### GitHub Pages Setup

1. Go to **Settings → Pages** in the GitHub repository.
2. Under **Build and deployment**, set **Source** to **GitHub Actions**.
3. Merge to `main` — the workflow builds and deploys automatically.

### Live URL

**https://outrageous-yak.github.io/Test/**

### Base Path

The Vite `base` is set to `/Test/` to match the repository name on GitHub Pages. If the repository is renamed, update `base` in `vite.config.ts` and the manifest `scope`/`start_url` accordingly.

## PWA Installation (iPhone)

1. Open **https://outrageous-yak.github.io/Test/** in Safari.
2. Tap the **Share** button.
3. Tap **Add to Home Screen**.
4. Launch from the home screen for a full-screen experience.

## Dependency Audit

Run `npm audit` to check for known vulnerabilities. As of Phase 2, any reported issues are in **development tooling only** (not included in the production bundle). See the Phase 2 PR description for the latest audit findings.

## License

Private project — all rights reserved.
