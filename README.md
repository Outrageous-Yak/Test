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
| Local Storage | Future save data (not yet implemented) |

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

## Folder Overview

```text
src/
  main.ts                 # Entry point — creates Phaser game instance
  game/
    config.ts             # Phaser game configuration
    constants.ts          # Shared constants (dimensions, colours, paths)
    types.ts              # TypeScript type definitions
    scenes/
      BootScene.ts        # Initial setup, transitions to Preload
      PreloadScene.ts     # Asset loading (placeholder locations)
      MainMenuScene.ts    # Temporary main menu (Phase 0)
    entities/             # Future: cars, characters
    tracks/               # Future: track definitions
    ui/                   # Reusable UI components (TouchButton)
    audio/                # Future: audio management
    systems/              # Future: game systems
    utils/                # Helper functions
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

**Phase 0 — Foundation & Project Setup (v1.0)** ✅

Implemented:

- Vite + TypeScript + Phaser 3 project scaffold
- Boot, Preload, and Main Menu scenes
- Touch-friendly START button (mouse, touch, Enter key)
- Responsive canvas scaling with aspect ratio preservation
- iPhone safe area support
- Portrait rotation prompt
- PWA manifest and service worker
- GitHub Actions deployment to GitHub Pages

Not yet implemented (by design):

- Characters, cars, tracks, physics, AI, audio, gameplay

## Planned Roadmap

| Phase | Focus |
|-------|-------|
| **Phase 0** | Foundation & project setup ✅ |
| **Phase 1** | Core racing loop — track, cars, controls, lap counting |
| **Phase 2** | Characters (Mango & Ruby), polish, audio |
| **Phase 3** | Power-ups, boost, AI opponents |
| **Phase 4** | Garage, settings, save system, leaderboards |

## Deployment

The project deploys automatically to GitHub Pages when changes are merged into `main`.

### GitHub Pages Setup

1. Go to **Settings → Pages** in the GitHub repository.
2. Under **Build and deployment**, set **Source** to **GitHub Actions**.
3. Merge to `main` — the workflow builds and deploys automatically.

### Live URL

Once enabled, the game is available at:

**https://outrageous-yak.github.io/Test/**

### Base Path

The Vite `base` is set to `/Test/` to match the repository name on GitHub Pages. If the repository is renamed, update `base` in `vite.config.ts` and the manifest `scope`/`start_url` accordingly.

## PWA Installation (iPhone)

1. Open **https://outrageous-yak.github.io/Test/** in Safari.
2. Tap the **Share** button.
3. Tap **Add to Home Screen**.
4. Launch from the home screen for a full-screen experience.

## License

Private project — all rights reserved.
