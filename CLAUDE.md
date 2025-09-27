# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview
This is a React Native Expo app for a Krav Maga club (CKM66) with authentication, course scheduling, and member management features. The app uses modern React Native architecture with TypeScript, Expo Router, and Supabase backend.

## Essential Commands

### Development
- `npm start` or `expo start` - Start the development server
- `npm run android` - Start on Android device/emulator
- `npm run ios` - Start on iOS device/simulator
- `npm run web` - Start web version

### Code Quality
- `npm run type-check` - Run TypeScript type checking
- `npm run lint` - Run ESLint and auto-fix issues
- `npm run lint:check` - Run ESLint without fixing

### Testing
- `npm test` - Run all tests once
- `npm run test:watch` - Run tests in watch mode
- `npm run test:coverage` - Generate test coverage report

## Architecture

### Tech Stack
- **Framework**: React Native with Expo (New Architecture enabled)
- **Language**: TypeScript with strict configuration
- **Navigation**: Expo Router with typed routes
- **State Management**:
  - Zustand for global UI state (auth, user data)
  - TanStack Query for server state (API calls, caching)
- **Backend**: Supabase (PostgreSQL, Auth, Real-time)
- **Storage**: Expo SecureStore for sensitive data
- **Styling**: NativeWind (Tailwind CSS for React Native)
- **Testing**: Jest with Testing Library

### Project Structure
```
src/
├── @types/           # TypeScript type definitions
├── assets/           # Images, icons, fonts
├── components/ui/    # Reusable UI components
├── features/         # Feature-based organization
│   ├── auth/         # Authentication (login, register, hooks)
│   └── main/         # Main app screens
├── lib/              # External service configurations (Supabase)
├── constants/        # Design tokens (Colors, Spacing, Typography)
└── utils/            # Utility functions
```

### Key Architectural Patterns

**Feature-Based Organization**: Code is organized by features rather than file type. Each feature contains its own components, hooks, services, and types.

**Authentication Flow**: Uses Supabase Auth with Expo SecureStore for token persistence. The app checks auth state on startup and conditionally renders LoginForm or MainApp.

**State Management Strategy**:
- Zustand store for auth state (persisted to SecureStore)
- TanStack Query for API data fetching and caching
- Local component state for UI-only concerns

**Type Safety**: Strict TypeScript configuration with path aliases configured in both tsconfig.json and babel.config.js for consistent imports.

## Path Aliases
- `@/*` → `src/*`
- `@components/*` → `src/components/*`
- `@features/*` → `src/features/*`
- `@lib/*` → `src/lib/*`
- `@constants/*` → `src/constants/*`
- `@utils/*` → `src/utils/*`
- `@types/*` → `src/@types/*`

## Environment Setup
- Requires `.env` file with Supabase credentials:
  - `EXPO_PUBLIC_SUPABASE_URL`
  - `EXPO_PUBLIC_SUPABASE_ANON_KEY`

## Testing
- Jest configuration includes coverage thresholds (80% minimum)
- Tests should be placed alongside components in `__tests__` folders
- Testing setup file: `src/__tests__/setup.ts`

## Code Style
- Use TypeScript strict mode
- Follow existing component patterns in `src/components/ui/`
- Use Zustand for global state, TanStack Query for server state
- Prefer feature-based file organization
- Use path aliases for cleaner imports