# Copilot Instructions for Duelist Private Main

## Project Overview
- This is a React Native game using Expo and expo-router for navigation.
- Main app code is in `app/`, with game logic in `game/` and shared hooks/types in `hooks/` and `types/`.
- Navigation is handled via expo-router layouts and tabs (`app/(tabs)/`).
- Assets are in `assets/images/`.

## Architecture & Data Flow
- Game logic is modularized: `game/logic/` (abilities, AI, combat, characters), `game/components/` (UI components for game screens).
- State management is handled via custom hooks (see `game/hooks/useGameState.ts`).
- UI screens are React components, often using Expo and React Native primitives.
- Routing follows expo-router conventions: files in `app/` map to screens/routes.

## Developer Workflows
- **Start the app:**
  - Open terminal in `duelist-private-main`.
  - Run: `npm install` then `npx expo start` (do not use global expo-cli).
- **Lint:** `npm run lint`
- **Build for web:** `npm run build:web`
- **Debugging:**
  - Use Expo Go app or web preview for live reload.
  - Errors about missing files usually mean you are in the wrong directory.

## Conventions & Patterns
- Use TypeScript throughout; types are in `types/game.ts`.
- Use `@/*` path alias for imports (see `tsconfig.json`).
- UI components are in `game/components/`, logic in `game/logic/`.
- Navigation is declarative via expo-router; use `<Stack.Screen />` and `<Link />` for navigation.
- Not-found screens are handled in `app/+not-found.tsx`.

## Integration Points
- External dependencies are managed in `package.json` (see Expo, React Native, navigation, icons, etc.).
- No backend integration is present; all logic is client-side.
- Images and assets are loaded from `assets/images/`.

## Examples
- To add a new game screen, create a new file in `app/` or `app/(tabs)/` and export a React component.
- To add a new ability, update `game/logic/abilities.ts` and relevant UI in `game/components/AbilityCard.tsx`.

---
If any section is unclear or missing, please provide feedback or specify which workflow/pattern needs more detail.
