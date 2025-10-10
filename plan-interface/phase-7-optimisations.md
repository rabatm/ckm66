# Phase 7 : Optimisations & Polish (Semaine 10)

## 🎯 Objectifs

Finaliser l'application avec optimisations de performance, responsive design, tests et déploiement.

---

## 📋 Tâches

### 7.1 Optimisations Performance

#### React Server Components
- Maximiser l'utilisation des Server Components
- Limiter les "use client" aux composants interactifs uniquement
- Déplacer la logique de fetch en Server Components

**Avant (Client)**
```typescript
'use client'

export default function MembersPage() {
  const { data } = useQuery({ ... })
  return <MembersList data={data} />
}
```

**Après (Server)**
```typescript
import { createClient } from '@/lib/supabase/server'

export default async function MembersPage() {
  const supabase = createClient()
  const { data } = await supabase.from('profiles').select('*')

  return <MembersList data={data} />
}
```

#### Caching Strategies

**next.config.js**
```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: true,
  },
}

module.exports = nextConfig
```

**Revalidation**
```typescript
// Revalidate toutes les 60 secondes
export const revalidate = 60

// Ou revalidation on-demand
import { revalidatePath } from 'next/cache'

export async function updateMember() {
  // Update member...
  revalidatePath('/members')
}
```

#### Image Optimization

```typescript
import Image from 'next/image'

<Image
  src={profile.profile_picture_url}
  alt="Profile"
  width={100}
  height={100}
  className="rounded-full"
  priority // Pour les images above-the-fold
/>
```

#### Lazy Loading

```typescript
import dynamic from 'next/dynamic'

const HeavyChart = dynamic(() => import('@/components/HeavyChart'), {
  loading: () => <p>Chargement du graphique...</p>,
  ssr: false, // Désactiver SSR si nécessaire
})
```

---

### 7.2 Responsive Design

#### Breakpoints Tailwind

Assurer que tous les composants sont responsive :

```typescript
<div className="
  grid
  grid-cols-1           // Mobile
  md:grid-cols-2        // Tablet
  lg:grid-cols-3        // Desktop
  xl:grid-cols-4        // Large desktop
  gap-4
">
  {/* Content */}
</div>
```

#### Sidebar responsive

```typescript
'use client'

import { useState } from 'react'
import { Menu, X } from 'lucide-react'

export function Sidebar() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      {/* Mobile menu button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="md:hidden fixed top-4 left-4 z-50"
      >
        {isOpen ? <X /> : <Menu />}
      </button>

      {/* Sidebar */}
      <aside className={`
        fixed md:sticky
        top-0 left-0
        h-screen w-64
        bg-gray-900 text-white
        transform transition-transform duration-200
        ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        z-40
      `}>
        {/* Sidebar content */}
      </aside>

      {/* Overlay */}
      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          className="md:hidden fixed inset-0 bg-black/50 z-30"
        />
      )}
    </>
  )
}
```

#### Tables responsive

```typescript
<div className="overflow-x-auto">
  <table className="min-w-full">
    <thead>
      <tr>
        <th className="px-4 py-2">Nom</th>
        <th className="px-4 py-2 hidden md:table-cell">Email</th>
        <th className="px-4 py-2 hidden lg:table-cell">Téléphone</th>
      </tr>
    </thead>
    {/* ... */}
  </table>
</div>
```

---

### 7.3 Mode Sombre

**Configurer Tailwind** (`tailwind.config.js`)
```javascript
module.exports = {
  darkMode: 'class',
  // ...
}
```

**Provider de thème** (`components/ThemeProvider.tsx`)
```typescript
'use client'

import { createContext, useContext, useEffect, useState } from 'react'

type Theme = 'light' | 'dark' | 'system'

const ThemeContext = createContext<{
  theme: Theme
  setTheme: (theme: Theme) => void
}>({ theme: 'system', setTheme: () => {} })

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>('system')

  useEffect(() => {
    const root = window.document.documentElement
    root.classList.remove('light', 'dark')

    if (theme === 'system') {
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches
        ? 'dark'
        : 'light'
      root.classList.add(systemTheme)
    } else {
      root.classList.add(theme)
    }
  }, [theme])

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export const useTheme = () => useContext(ThemeContext)
```

**Toggle de thème**
```typescript
'use client'

import { useTheme } from './ThemeProvider'
import { Moon, Sun } from 'lucide-react'

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()

  return (
    <button
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
      className="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-800"
    >
      {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
    </button>
  )
}
```

---

### 7.4 Système de Notifications

**Toast notifications** (avec sonner)

```bash
npm install sonner
```

```typescript
import { Toaster, toast } from 'sonner'

// Dans le layout
export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <Toaster position="top-right" />
      </body>
    </html>
  )
}

// Usage
toast.success('Membre créé avec succès')
toast.error('Une erreur est survenue')
toast.loading('Chargement...')
```

**Notifications par email** (optionnel)

```typescript
// lib/email.ts
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function sendExpirationReminder(email: string, endDate: string) {
  await resend.emails.send({
    from: 'CKM66 <noreply@ckm66.com>',
    to: email,
    subject: 'Votre abonnement expire bientôt',
    html: `
      <p>Bonjour,</p>
      <p>Votre abonnement CKM66 expire le ${endDate}.</p>
      <p>Pensez à le renouveler pour continuer à profiter des cours.</p>
    `,
  })
}
```

---

### 7.5 Tests

#### Tests unitaires (Jest)

```bash
npm install -D jest @testing-library/react @testing-library/jest-dom
```

**jest.config.js**
```javascript
const nextJest = require('next/jest')

const createJestConfig = nextJest({
  dir: './',
})

const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testEnvironment: 'jest-environment-jsdom',
}

module.exports = createJestConfig(customJestConfig)
```

**Exemple de test**
```typescript
import { render, screen } from '@testing-library/react'
import { MemberCard } from '@/components/MemberCard'

describe('MemberCard', () => {
  it('renders member name', () => {
    const member = {
      first_name: 'John',
      last_name: 'Doe',
      email: 'john@example.com',
    }

    render(<MemberCard member={member} />)

    expect(screen.getByText('John Doe')).toBeInTheDocument()
  })
})
```

#### Tests E2E (Playwright) - Optionnel

```bash
npm install -D @playwright/test
```

```typescript
import { test, expect } from '@playwright/test'

test('login flow', async ({ page }) => {
  await page.goto('http://localhost:3000/login')

  await page.fill('input[type="email"]', 'admin@example.com')
  await page.fill('input[type="password"]', 'password')
  await page.click('button[type="submit"]')

  await expect(page).toHaveURL('http://localhost:3000/dashboard')
})
```

---

### 7.6 Accessibilité (a11y)

- Labels sur tous les inputs
- Contraste suffisant
- Navigation au clavier
- ARIA attributes

```typescript
<button
  aria-label="Fermer le modal"
  onClick={onClose}
>
  <X />
</button>

<input
  id="email"
  type="email"
  aria-describedby="email-error"
/>
{error && <p id="email-error" role="alert">{error}</p>}
```

---

### 7.7 Sécurité

#### Variables d'environnement

```bash
# .env.local
NEXT_PUBLIC_SUPABASE_URL=your_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key
SUPABASE_SERVICE_ROLE_KEY=your_service_key # Jamais exposer côté client !
```

#### Rate Limiting (optionnel)

```typescript
import rateLimit from 'express-rate-limit'

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Max 100 requêtes par IP
})
```

#### Headers de sécurité

**next.config.js**
```javascript
const nextConfig = {
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
        ],
      },
    ]
  },
}
```

---

### 7.8 Documentation

**README.md**
```markdown
# CKM66 Admin

Site d'administration pour le club de Krav Maga CKM66.

## Installation

\`\`\`bash
npm install
cp .env.example .env.local
npm run dev
\`\`\`

## Structure

- `/app` - Routes Next.js
- `/components` - Composants réutilisables
- `/lib` - Utilitaires et configurations

## Scripts

- `npm run dev` - Dev server
- `npm run build` - Build production
- `npm run test` - Lancer les tests
```

**CONTRIBUTING.md**
```markdown
# Guide de contribution

## Convention de commits

- `feat:` nouvelle fonctionnalité
- `fix:` correction de bug
- `refactor:` refactoring
- `docs:` documentation

## Workflow

1. Créer une branche depuis `main`
2. Développer la feature
3. Créer une PR
4. Review et merge
```

---

### 7.9 Déploiement

#### Vercel (recommandé)

```bash
npm install -g vercel
vercel login
vercel
```

**vercel.json**
```json
{
  "buildCommand": "npm run build",
  "outputDirectory": ".next",
  "env": {
    "NEXT_PUBLIC_SUPABASE_URL": "@supabase-url",
    "NEXT_PUBLIC_SUPABASE_ANON_KEY": "@supabase-anon-key"
  }
}
```

#### Variables d'environnement

Sur Vercel dashboard :
1. Settings > Environment Variables
2. Ajouter toutes les variables `.env.local`
3. Redéployer

---

### 7.10 Monitoring & Logs

**Sentry (error tracking)**

```bash
npm install @sentry/nextjs
```

```typescript
// sentry.client.config.ts
import * as Sentry from '@sentry/nextjs'

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  tracesSampleRate: 1.0,
})
```

**Vercel Analytics**

```typescript
import { Analytics } from '@vercel/analytics/react'

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  )
}
```

---

## ✅ Checklist Phase 7

- [ ] Optimisations React Server Components
- [ ] Caching et revalidation
- [ ] Images optimisées
- [ ] Lazy loading composants lourds
- [ ] Responsive design complet
- [ ] Mode sombre
- [ ] Système de notifications (toast)
- [ ] Tests unitaires (composants clés)
- [ ] Accessibilité (a11y)
- [ ] Headers de sécurité
- [ ] Documentation (README, CONTRIBUTING)
- [ ] Déploiement Vercel
- [ ] Monitoring (Sentry)
- [ ] Variables d'environnement production

---

## 🚀 Résultat final

À la fin de la Phase 7 :
- Application optimisée et performante
- Design responsive sur tous devices
- Mode sombre fonctionnel
- Tests en place
- Documentation complète
- Application déployée en production
- Monitoring actif

**L'application est prête pour la production ! 🎉**

---

## 📈 Prochaines évolutions possibles

- Multi-langue (i18n)
- Notifications push
- Integration paiement en ligne (Stripe)
- Application mobile (React Native)
- API publique pour intégrations tierces
- Dashboard temps réel avec WebSockets
