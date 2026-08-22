# Classic Tetris

A mobile **classic Tetris** game in the NES / Game Boy tradition, built with **Expo + React Native + TypeScript**.

Features an 8×16 playfield, SRS rotation, 7-bag randomizer, ghost piece, and a campaign mode (5 levels × 5 stages). Game logic lives in a pure TypeScript engine, separate from the React UI.

## Features

- **Classic rules** — SRS wall kicks, 7-bag, DAS/ARR, NES-style gravity
- **Campaign mode** — per-stage line targets, stage clear and campaign complete screens
- **Swipe controls** — tap to rotate, swipe to move, down-swipe to hard drop
- **Gesture tutorial** — animated hint cards at the bottom of the screen
- **Side HUD** — score, level, stage, lines, and next piece
- **Profile bar** — avatar and promotion progress UI (placeholder)
- **Haptic feedback** — line clears, locks, and other game events (`expo-haptics`)
- **Web keyboard** — keyboard controls on web / dev builds

## Tech Stack

| Area | Choice |
|------|--------|
| Framework | [Expo SDK 57](https://docs.expo.dev/versions/v57.0.0/) (prebuild / bare workflow) |
| Language | TypeScript (strict) |
| UI | React Native |
| State | `useReducer` + game engine |
| Tests | Jest |

## Getting Started

### Prerequisites

- Node.js 18+
- npm
- Android Studio / Xcode (for native builds)
- Android device with USB debugging or an emulator

### Install

```bash
git clone https://github.com/mike008/classic-tetris.git
cd classic-tetris
npm install
```

### Run

```bash
# Metro bundler
npm start

# Android (connected device)
npm run android:device

# Android emulator
npm run android

# iOS
npm run ios
```

Expo Go may not support all native modules. For device testing, prefer `expo run:android`.

### Tests

```bash
npm test
```

Engine unit tests cover board logic, 7-bag, scoring, and campaign progression (`__tests__/`).

## Controls

### Touch (mobile)

| Input | Action |
|-------|--------|
| Tap on board | Rotate (SRS) |
| Swipe ← / → | Move left / right |
| Hold drag ← / → | DAS repeat move |
| Swipe ↓ | Hard drop |

### Keyboard (web)

| Key | Action |
|-----|--------|
| ← → | Move |
| ↓ | Soft drop |
| ↑ / X / Z / Space | Rotate / hard drop |
| P / Esc | Pause |
| R | Restart |

## Campaign

- **5 levels**, each with **5 stages**
- Stage line targets: `3 → 5 → 10 → 10 → 12`
- Stage 4+ gravity increases via `getGravityTier`
- Clear all stages to see **Campaign Complete**

## Project Structure

```
classic-tetris/
├── App.tsx                 # Entry: SafeAreaProvider + GameScreen
├── src/
│   ├── game/               # Pure TS engine (board, SRS, bag, campaign, …)
│   ├── components/         # BoardView, HudPanel, GestureTutorial, …
│   ├── hooks/              # useGameLoop, useSwipeActions, …
│   ├── feedback/           # Haptics
│   └── theme/              # colors, tetromino palette
├── __tests__/              # Jest unit tests
├── assets/                 # Icons, splash
├── android/                # Prebuild native project
└── eas.json                # EAS Build profiles
```

## Native Assets

After changing icons in `app.json` or `assets/`, regenerate native resources with prebuild:

```bash
npx expo prebuild --platform android --clean
npm run android:device
```

## EAS Build

[EAS Build](https://docs.expo.dev/build/introduction/) profiles are defined in `eas.json`:

- `development` — dev client
- `preview` — internal APK
- `production` — store build (auto increment)

```bash
npx eas build --platform android --profile preview
```

## Architecture

```
SwipeZone ──dispatch──► useReducer + engine ◄── tick ── useGameLoop (rAF)
                              │
BoardView / HudPanel ◄── GameState
```

UI components never mutate the board directly. All state changes go through `reduce(state, action)`.

## Roadmap

- [ ] High score persistence (AsyncStorage)
- [ ] HOLD piece (removed; optional re-add)
- [ ] Avatar & promotion system wiring
- [ ] Sound effects (`expo-audio` plugin present)

See [`.cursor/plans/classic-tetris-expo.mdc`](.cursor/plans/classic-tetris-expo.mdc) for the full implementation plan.

## License

MIT — see [LICENSE](LICENSE).
