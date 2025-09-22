# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a React Native mobile application built with Expo and TypeScript. The app uses modern React Native development patterns with:
- **Expo SDK 54** with router-based navigation
- **NativeWind** for Tailwind CSS styling
- **Zustand** for state management with MMKV persistence
- **TanStack Query** for data fetching and caching
- **React Native 0.81.4** with new architecture enabled

## Development Commands

```bash
# Start development server
npm start

# Platform-specific development
npm run android
npm run ios
npm run web

# Testing
npx jest                    # Run all tests
npx jest --watch           # Run tests in watch mode
npx jest Button.test.tsx   # Run specific test file
```

## Architecture

### State Management
- **Global State**: Zustand store (`src/store/useAppStore.ts`) with MMKV encryption for persistence
- **Server State**: TanStack Query client (`src/services/queryClient.ts`) with intelligent retry logic
- **Local State**: React hooks for component-level state

### Data Layer
- **API Service**: Centralized HTTP client (`src/services/apiService.ts`) with request deduplication and secure token storage
- **Image Optimization**: Expo Image with CDN integration (`src/services/imageService.ts`)
- **Persistent Storage**: MMKV with encryption for sensitive data

### UI Components
- **Design System**: Custom components in `src/components/ui/` following consistent patterns
- **Styling**: NativeWind (Tailwind CSS) with custom design tokens defined in `tailwind.config.js`
- **Typography**: System fonts with semantic color palette (primary, success, warning, error)

### Path Aliases
TypeScript path mapping is configured for clean imports:
- `@/*` → `./src/*`
- `@/components/*` → `./src/components/*`
- `@/services/*` → `./src/services/*`
- `@/store/*` → `./src/store/*`
- `@/utils/*` → `./src/utils/*`
- `@/types/*` → `./src/types/*`

## Testing

Jest configuration includes:
- **Coverage threshold**: 90% for branches, functions, lines, and statements
- **Setup file**: `src/__tests__/setup.ts`
- **Test patterns**: `src/**/*.test.{ts,tsx}`
- **Transform ignore**: Configured for Expo and React Native modules

## Key Files

- `app.json`: Expo configuration with typed routes and new architecture
- `tailwind.config.js`: Design system tokens and NativeWind preset
- `jest.config.js`: Testing configuration with coverage requirements
- `src/store/useAppStore.ts`: Global state with encrypted persistence
- `src/services/apiService.ts`: HTTP client with security and optimization features