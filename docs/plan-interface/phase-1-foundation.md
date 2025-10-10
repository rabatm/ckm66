# Phase 1 : Foundation (Semaine 1-2)

## 🎯 Objectifs

Mettre en place les fondations du projet Next.js avec authentification, architecture de base et système de routing protégé.

---

## 📋 Tâches

### 1.1 Setup du projet Next.js

**Commandes**
```bash
npx create-next-app@latest ckm-admin --typescript --tailwind --app --use-npm
cd ckm-admin
npm install @supabase/supabase-js @supabase/ssr
npm install zustand @tanstack/react-query
npm install date-fns clsx class-variance-authority
```

**Configuration**
- TypeScript strict mode activé
- ESLint + Prettier configurés
- Path aliases (`@/`, `@components/`, etc.)

**Fichiers à créer**
```
ckm-admin/
├── tsconfig.json (configurer paths)
├── next.config.js
├── .env.local
└── .eslintrc.json
```

**.env.local**
```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

---

### 1.2 Configuration Supabase

**Client-side** (`lib/supabase/client.ts`)
```typescript
import { createBrowserClient } from '@supabase/ssr'
import { Database } from '@/types/database.types'

export const createClient = () =>
  createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
```

**Server-side** (`lib/supabase/server.ts`)
```typescript
import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { Database } from '@/types/database.types'

export const createClient = () => {
  const cookieStore = cookies()

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
      },
    }
  )
}
```

**Copier les types**
```bash
cp ../mobile/src/@types/database.types.ts ./types/database.types.ts
```

---

### 1.3 Authentification

**Store Zustand** (`lib/stores/auth-store.ts`)
```typescript
import { create } from 'zustand'
import { User } from '@supabase/supabase-js'

interface Profile {
  id: string
  email: string
  role: 'admin' | 'instructor' | 'secretary' | 'member'
  first_name: string | null
  last_name: string | null
}

interface AuthState {
  user: User | null
  profile: Profile | null
  setUser: (user: User | null) => void
  setProfile: (profile: Profile | null) => void
  logout: () => void
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  profile: null,
  setUser: (user) => set({ user }),
  setProfile: (profile) => set({ profile }),
  logout: () => set({ user: null, profile: null }),
}))
```

**Page de login** (`app/(auth)/login/page.tsx`)
```typescript
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClient()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    // Récupérer le profil
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', data.user.id)
      .single()

    // Vérifier le rôle
    if (!['admin', 'instructor', 'secretary'].includes(profile?.role)) {
      setError('Accès non autorisé')
      await supabase.auth.signOut()
      setLoading(false)
      return
    }

    router.push('/dashboard')
    router.refresh()
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <form onSubmit={handleLogin} className="w-full max-w-md space-y-4">
        <h1 className="text-2xl font-bold">CKM66 - Administration</h1>

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full px-4 py-2 border rounded"
        />

        <input
          type="password"
          placeholder="Mot de passe"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full px-4 py-2 border rounded"
        />

        {error && <p className="text-red-500">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full py-2 bg-blue-600 text-white rounded"
        >
          {loading ? 'Connexion...' : 'Se connecter'}
        </button>
      </form>
    </div>
  )
}
```

---

### 1.4 Middleware de protection

**middleware.ts** (à la racine)
```typescript
import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          response.cookies.set({ name, value, ...options })
        },
        remove(name: string, options: CookieOptions) {
          response.cookies.set({ name, value: '', ...options })
        },
      },
    }
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Rediriger vers login si pas authentifié
  if (!user && !request.nextUrl.pathname.startsWith('/login')) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // Récupérer le profil pour vérifier le rôle
  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    const role = profile?.role

    // Protections par route selon rôle
    if (request.nextUrl.pathname.startsWith('/analytics')) {
      if (role !== 'admin') {
        return NextResponse.redirect(new URL('/dashboard', request.url))
      }
    }

    if (request.nextUrl.pathname.startsWith('/badges/create')) {
      if (!['admin', 'instructor'].includes(role || '')) {
        return NextResponse.redirect(new URL('/dashboard', request.url))
      }
    }

    // Rediriger vers dashboard si déjà connecté et sur /login
    if (request.nextUrl.pathname === '/login') {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }
  }

  return response
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
```

---

### 1.5 Layout de base avec Sidebar

**Layout dashboard** (`app/(dashboard)/layout.tsx`)
```typescript
import { Sidebar } from '@/components/layout/Sidebar'
import { Header } from '@/components/layout/Header'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex h-screen">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Header />
        <main className="flex-1 overflow-auto p-6 bg-gray-50">
          {children}
        </main>
      </div>
    </div>
  )
}
```

**Sidebar** (`components/layout/Sidebar.tsx`)
```typescript
'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: '📊' },
  { name: 'Membres', href: '/members', icon: '👥' },
  { name: 'Cours', href: '/courses', icon: '📅' },
  { name: 'Réservations', href: '/reservations', icon: '🎫' },
  { name: 'Abonnements', href: '/subscriptions', icon: '💳' },
  { name: 'Badges', href: '/badges', icon: '🏆' },
  { name: 'Présences', href: '/attendance', icon: '✅' },
  { name: 'Analytics', href: '/analytics', icon: '📈', adminOnly: true },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="w-64 bg-gray-900 text-white p-4">
      <div className="mb-8">
        <h1 className="text-xl font-bold">CKM66 Admin</h1>
      </div>

      <nav className="space-y-2">
        {navigation.map((item) => (
          <Link
            key={item.name}
            href={item.href}
            className={cn(
              'flex items-center space-x-3 px-3 py-2 rounded-lg transition',
              pathname === item.href
                ? 'bg-blue-600'
                : 'hover:bg-gray-800'
            )}
          >
            <span>{item.icon}</span>
            <span>{item.name}</span>
          </Link>
        ))}
      </nav>
    </aside>
  )
}
```

---

### 1.6 Installation shadcn/ui

```bash
npx shadcn-ui@latest init
```

Configuration recommandée :
- Style : Default
- Color : Slate
- CSS variables : Yes

**Installer les composants de base**
```bash
npx shadcn-ui@latest add button
npx shadcn-ui@latest add input
npx shadcn-ui@latest add label
npx shadcn-ui@latest add card
npx shadcn-ui@latest add dialog
npx shadcn-ui@latest add table
npx shadcn-ui@latest add dropdown-menu
npx shadcn-ui@latest add toast
```

---

## ✅ Checklist Phase 1

- [ ] Projet Next.js créé et configuré
- [ ] Supabase configuré (client + server)
- [ ] Types database.types.ts copiés
- [ ] Authentification fonctionnelle
- [ ] Middleware de protection des routes
- [ ] Layout avec Sidebar et Header
- [ ] shadcn/ui installé
- [ ] Page de login fonctionnelle
- [ ] Redirection selon rôle opérationnelle
- [ ] Variables d'environnement configurées

---

## 🚀 Résultat attendu

À la fin de la Phase 1, vous avez :
- Une application Next.js fonctionnelle
- Un système d'authentification sécurisé
- Un layout professionnel avec navigation
- Les bases pour construire les fonctionnalités métier

**Prochaine étape** : [Phase 2 - Dashboard & Membres](./phase-2-dashboard-membres.md)
