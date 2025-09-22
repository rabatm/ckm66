# Agent de développement Claude - Guide des bonnes pratiques

## 🎯 Mission et objectifs

Cet agent Claude est spécialisé dans le développement React Native moderne avec les meilleures pratiques 2025. Il respecte les principes de Clean Code, TDD, et maintient une expertise constante sur l'écosystème React Native/Expo.

## 📋 Domaines d'expertise prioritaires

### Architecture et Performance
- **New Architecture React Native** (JSI, TurboModules, Fabric)
- **Optimisations performance** (MMKV, FlashList, lazy loading)
- **State management moderne** (Zustand, TanStack Query)
- **TypeScript strict** avec type safety maximale

### Outils et frameworks
- **Expo SDK 54+** avec New Architecture
- **NativeWind v4** pour styling performant
- **Jest + React Native Testing Library** pour testing
- **EAS Build** pour déploiement

## 🏗️ Principes Clean Code

### Structure de code
```typescript
// ✅ BON - Fonction pure, responsabilité unique
function formatUserName(user: User): string {
  if (!user.firstName && !user.lastName) return 'Utilisateur anonyme';
  return `${user.firstName ?? ''} ${user.lastName ?? ''}`.trim();
}

// ❌ MAUVAIS - Fonction impure, responsabilités multiples
function getUserDisplay(user: any) {
  console.log('Formatting user:', user); // Side effect
  if (user.firstName) {
    return user.firstName + ' ' + user.lastName; // Null/undefined unsafe
  }
  return 'Anonymous'; // Inconsistent language
}
```

### Nommage explicite
```typescript
// ✅ BON - Noms explicites et intentions claires
interface UserAuthenticationState {
  isAuthenticated: boolean;
  authenticationToken: string | null;
  lastAuthenticationAttempt: Date | null;
}

function authenticateUserWithCredentials(
  email: string, 
  password: string
): Promise<UserAuthenticationResult> {
  // Implementation
}

// ❌ MAUVAIS - Noms vagues et abréviations
interface AuthState {
  auth: boolean;
  tkn: string | null;
  lastAttempt: Date | null;
}

function doAuth(e: string, p: string): Promise<any> {
  // Implementation
}
```

### Gestion d'erreur robuste
```typescript
// ✅ BON - Gestion d'erreur explicite et typée
interface ApiError {
  message: string;
  code: string;
  status: number;
}

async function fetchUserProfile(userId: string): Promise<User | ApiError> {
  try {
    const response = await apiService.get(`/users/${userId}`);
    return response;
  } catch (error) {
    if (error instanceof Error) {
      return {
        message: error.message,
        code: 'NETWORK_ERROR',
        status: 0
      };
    }
    return {
      message: 'Unknown error occurred',
      code: 'UNKNOWN_ERROR',
      status: 500
    };
  }
}

// ❌ MAUVAIS - Gestion d'erreur vague
async function getUser(id: string): Promise<any> {
  try {
    return await api.get('/users/' + id);
  } catch (e) {
    console.log('Error:', e);
    return null; // Perte d'information sur l'erreur
  }
}
```

## 🧪 Test-Driven Development (TDD)

### Cycle Red-Green-Refactor

#### 1. RED - Écrire un test qui échoue
```typescript
// __tests__/userService.test.ts
import { formatUserDisplayName } from '../userService';

describe('formatUserDisplayName', () => {
  it('should return full name when both first and last names are provided', () => {
    // Arrange
    const user = {
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@example.com'
    };
    
    // Act
    const result = formatUserDisplayName(user);
    
    // Assert
    expect(result).toBe('John Doe');
  });
});
```

#### 2. GREEN - Écrire le code minimal qui passe
```typescript
// userService.ts
interface User {
  firstName?: string;
  lastName?: string;
  email: string;
}

export function formatUserDisplayName(user: User): string {
  return `${user.firstName} ${user.lastName}`;
}
```

#### 3. REFACTOR - Améliorer sans casser les tests
```typescript
// userService.ts - Version refactorisée
export function formatUserDisplayName(user: User): string {
  const firstName = user.firstName?.trim() ?? '';
  const lastName = user.lastName?.trim() ?? '';
  
  if (!firstName && !lastName) {
    return 'Utilisateur anonyme';
  }
  
  return `${firstName} ${lastName}`.trim();
}

// Tests supplémentaires
describe('formatUserDisplayName edge cases', () => {
  it('should handle missing first name', () => {
    const user = { lastName: 'Doe', email: 'doe@example.com' };
    expect(formatUserDisplayName(user)).toBe('Doe');
  });
  
  it('should handle missing last name', () => {
    const user = { firstName: 'John', email: 'john@example.com' };
    expect(formatUserDisplayName(user)).toBe('John');
  });
  
  it('should return anonymous user when both names are missing', () => {
    const user = { email: 'anonymous@example.com' };
    expect(formatUserDisplayName(user)).toBe('Utilisateur anonyme');
  });
});
```

### Structure de tests React Native
```typescript
// __tests__/components/UserProfile.test.tsx
import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { UserProfile } from '../UserProfile';

// Setup propre pour chaque test
const createTestQueryClient = () => new QueryClient({
  defaultOptions: {
    queries: { retry: false },
    mutations: { retry: false },
  },
});

const renderWithProviders = (component: React.ReactElement) => {
  const queryClient = createTestQueryClient();
  return render(
    <QueryClientProvider client={queryClient}>
      {component}
    </QueryClientProvider>
  );
};

describe('UserProfile Component', () => {
  beforeEach(() => {
    // Reset mocks before each test
    jest.clearAllMocks();
  });

  it('should display user information when loaded', async () => {
    // Arrange
    const mockUser = {
      id: '1',
      name: 'John Doe',
      email: 'john@example.com'
    };
    
    // Mock API call
    jest.spyOn(require('../services/api'), 'fetchUser')
      .mockResolvedValue(mockUser);
    
    // Act
    const { getByText, getByTestId } = renderWithProviders(
      <UserProfile userId="1" />
    );
    
    // Assert
    await waitFor(() => {
      expect(getByText('John Doe')).toBeTruthy();
      expect(getByText('john@example.com')).toBeTruthy();
    });
  });

  it('should handle loading state correctly', () => {
    // Test des états de chargement
    const { getByTestId } = renderWithProviders(
      <UserProfile userId="1" />
    );
    
    expect(getByTestId('loading-indicator')).toBeTruthy();
  });
});
```

## 📁 Git Best Practices

### Conventions de commit (Conventional Commits)
```bash
# Types de commits
feat:     Nouvelle fonctionnalité
fix:      Correction de bug
docs:     Documentation seulement
style:    Formatage, espaces, etc.
refactor: Refactoring sans ajout de fonctionnalité
test:     Ajout ou modification de tests
chore:    Maintenance (deps, config, etc.)
perf:     Amélioration de performance
ci:       Intégration continue
build:    Système de build

# Format : type(scope): description
# Exemples :
feat(auth): add OAuth login with Google
fix(navigation): resolve tab bar rendering issue
docs(api): update authentication endpoints
test(user): add unit tests for user service
refactor(store): migrate from Redux to Zustand
perf(list): implement FlashList for better performance
```

### Workflow Git recommandé
```bash
# 1. Créer une branche pour chaque feature
git checkout -b feat/oauth-integration

# 2. Commits atomiques et fréquents
git add src/services/authService.ts
git commit -m "feat(auth): add OAuth service basic structure"

git add src/hooks/useAuth.ts
git commit -m "feat(auth): create authentication hook"

git add __tests__/authService.test.ts
git commit -m "test(auth): add OAuth service unit tests"

# 3. Push et création de PR
git push origin feat/oauth-integration

# 4. Code review et merge
# Utiliser squash merge pour un historique propre
```

### Structure des branches
```
main/master     Production-ready code
develop         Development branch
feature/xxx     Feature branches
hotfix/xxx      Critical fixes
release/x.x.x   Release preparation
```

### .gitignore optimisé React Native
```gitignore
# Dependencies
node_modules/
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Expo
.expo/
dist/
web-build/

# Native builds
*.orig.*
*.jks
*.p8
*.p12
*.key
*.mobileprovision
*.keystore
!debug.keystore

# Metro
.metro-health-check*

# Debug
npm-debug.*
yarn-debug.*
yarn-error.*

# macOS
.DS_Store
*.pem

# Local env files
.env*.local

# TypeScript
*.tsbuildinfo

# IDE
.vscode/
.idea/
*.swp
*.swo

# Testing
coverage/
*.lcov

# Temporary
*.tmp
*.temp
```

## 🔧 Outils et configuration

### ESLint + Prettier configuration
```json
// .eslintrc.json
{
  "extends": [
    "expo",
    "@typescript-eslint/recommended",
    "prettier"
  ],
  "plugins": ["@typescript-eslint"],
  "rules": {
    "@typescript-eslint/no-unused-vars": "error",
    "@typescript-eslint/explicit-function-return-type": "warn",
    "@typescript-eslint/no-explicit-any": "error",
    "@typescript-eslint/prefer-const": "error",
    "prefer-const": "off",
    "no-var": "error",
    "object-shorthand": "error",
    "prefer-destructuring": "error"
  }
}
```

```json
// .prettierrc
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "printWidth": 80,
  "tabWidth": 2,
  "useTabs": false
}
```

### Scripts package.json optimisés
```json
{
  "scripts": {
    "start": "expo start --clear",
    "android": "expo start --android",
    "ios": "expo start --ios",
    "web": "expo start --web",
    "build:android": "eas build --platform android",
    "build:ios": "eas build --platform ios",
    "test": "jest --watchAll",
    "test:ci": "jest --coverage --watchAll=false --passWithNoTests",
    "test:e2e": "maestro test",
    "lint": "eslint . --ext .ts,.tsx --fix",
    "lint:check": "eslint . --ext .ts,.tsx",
    "type-check": "tsc --noEmit",
    "clean": "expo r -c && rm -rf node_modules && npm install",
    "prebuild": "npm run lint:check && npm run type-check && npm run test:ci"
  }
}
```

### Configuration Husky pour hooks Git
```bash
# Installation
npm install --save-dev husky lint-staged

# Configuration .husky/pre-commit
#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

npx lint-staged

# Configuration .husky/commit-msg
#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

npx commitlint --edit $1
```

```json
// package.json - lint-staged
{
  "lint-staged": {
    "*.{ts,tsx}": [
      "eslint --fix",
      "prettier --write",
      "jest --bail --findRelatedTests --passWithNoTests"
    ],
    "*.{json,md}": [
      "prettier --write"
    ]
  }
}
```

## 📊 Métriques et qualité

### Coverage objectives
- **Unit tests**: > 90% line coverage
- **Integration tests**: > 80% path coverage
- **E2E tests**: Critical user journeys covered

### Performance metrics
- **App startup**: < 3s on mid-range devices
- **Navigation**: < 200ms screen transitions
- **Memory usage**: < 150MB baseline
- **Bundle size**: < 50MB (optimized)

### Code quality metrics
- **Cyclomatic complexity**: < 10 per function
- **Function length**: < 50 lines
- **File length**: < 300 lines
- **Dependency depth**: < 5 levels

## 🚀 Workflow de développement

### 1. Planification
- Définir les critères d'acceptation
- Créer les tests d'acceptance
- Estimer la complexité

### 2. Développement TDD
- RED: Écrire le test qui échoue
- GREEN: Code minimal qui passe
- REFACTOR: Améliorer sans casser

### 3. Code Review
- Vérifier les tests
- Valider l'architecture
- Confirmer les bonnes pratiques

### 4. Intégration
- Tests automatisés passent
- Build successful
- Performance metrics OK

## ⚡ Checklist avant commit

### Code
- [ ] Tests unitaires écrits et passants
- [ ] Gestion d'erreur implémentée
- [ ] Types TypeScript stricts
- [ ] Pas de console.log oubliés
- [ ] Optimisations performance appliquées

### Architecture
- [ ] Responsabilités séparées
- [ ] Dépendances minimales
- [ ] Interfaces bien définies
- [ ] Code réutilisable

### Documentation
- [ ] Fonctions documentées
- [ ] README mis à jour si nécessaire
- [ ] Types exportés correctement

### Performance
- [ ] Lazy loading implémenté
- [ ] Images optimisées
- [ ] Listes performantes (FlashList)
- [ ] State management optimisé

## 📚 Ressources de référence

### Documentation officielle
- [React Native Documentation](https://reactnative.dev/)
- [Expo Documentation](https://docs.expo.dev/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)

### Performance et optimisation
- [React Native Performance](https://reactnative.dev/docs/performance)
- [New Architecture Guide](https://reactnative.dev/docs/the-new-architecture/landing-page)
- [FlashList Documentation](https://shopify.github.io/flash-list/)

### Testing
- [React Native Testing Library](https://testing-library.com/docs/react-native-testing-library/intro/)
- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [Maestro E2E Testing](https://maestro.mobile.dev/)

Ce guide évolutif s'enrichit avec les dernières pratiques de l'écosystème React Native et maintient un focus sur la qualité, la performance et la maintenabilité du code.