# AGENT.md - Guide pour le développement du site d'administration CKM66

Ce document contient les instructions pour un agent AI qui développera le site d'administration Next.js pour le club de Krav Maga CKM66.

---

## 📋 Contexte du projet

Le site d'administration est une interface web Next.js destinée aux coachs, secrétaires et administrateurs du club CKM66. Il partage la même base de données Supabase que l'application mobile React Native existante.

### Architecture existante (à respecter)

- **Base de données** : Supabase (PostgreSQL)
- **Types** : `../mobile/src/@types/database.types.ts` (à copier)
- **Tables principales** :
  - `profiles` : utilisateurs avec rôles (admin, instructor, secretary, member)
  - `courses` : cours récurrents
  - `course_instances` : instances spécifiques de cours (dates)
  - `reservations` : réservations des membres
  - `subscriptions` : abonnements
  - `badges` : système de badges
  - `user_badges` : badges débloqués
  - `attendance` : présences aux cours

### RLS (Row Level Security)

Les policies Supabase sont déjà en place. Le client Supabase côté Next.js respectera automatiquement ces règles :
- Les admins ont accès à tout
- Les instructeurs voient leurs cours et élèves
- Les secrétaires gèrent les membres et abonnements

---

## 🎯 Stack technique à utiliser

### Obligatoire
- **Framework** : Next.js 15 avec App Router
- **Language** : TypeScript (strict mode)
- **Backend** : Supabase (client SSR + client browser)
- **UI Library** : shadcn/ui + Tailwind CSS
- **State Management** :
  - TanStack Query (React Query) pour les appels API
  - Zustand pour l'état global (auth uniquement)
- **Forms** : React Hook Form + Zod
- **Charts** : Recharts

### Structure de projet

```
ckm-admin/
├── app/
│   ├── (auth)/
│   │   └── login/
│   ├── (dashboard)/
│   │   ├── dashboard/
│   │   ├── members/
│   │   ├── courses/
│   │   ├── reservations/
│   │   ├── subscriptions/
│   │   ├── badges/
│   │   ├── attendance/
│   │   └── analytics/
│   └── layout.tsx
├── components/
│   ├── ui/              # shadcn/ui
│   ├── features/        # Composants métier
│   └── layout/          # Sidebar, Header
├── lib/
│   ├── supabase/
│   │   ├── client.ts    # Client browser
│   │   └── server.ts    # Client server
│   ├── hooks/
│   └── utils/
├── types/
│   └── database.types.ts # Copié depuis mobile
└── middleware.ts
```

---

## 🔑 Principes de développement

### 1. Server Components First

**TOUJOURS** privilégier les React Server Components :

```typescript
// ✅ BON - Server Component
import { createClient } from '@/lib/supabase/server'

export default async function MembersPage() {
  const supabase = createClient()
  const { data } = await supabase.from('profiles').select('*')

  return <MembersList data={data} />
}

// ❌ MAUVAIS - Client inutile
'use client'
export default function MembersPage() {
  const { data } = useQuery(...)
  return <MembersList data={data} />
}
```

N'utiliser `'use client'` QUE pour :
- Composants avec hooks (`useState`, `useEffect`)
- Event handlers (`onClick`, `onChange`)
- Composants interactifs

### 2. Authentification et sécurité

**Middleware** (`middleware.ts`)
```typescript
// Protéger TOUTES les routes sauf /login
// Vérifier le rôle pour routes spécifiques
// Rediriger si non autorisé
```

**Vérifications**
- Admin : accès complet
- Instructor : ses cours, ses élèves, attribution badges
- Secretary : membres, abonnements, réservations

### 3. Supabase Client

**Server-side** (privilégier)
```typescript
import { createClient } from '@/lib/supabase/server'
const supabase = createClient() // Utilise cookies automatiquement
```

**Client-side** (uniquement si nécessaire)
```typescript
'use client'
import { createClient } from '@/lib/supabase/client'
const supabase = createClient()
```

### 4. Gestion d'état

**TanStack Query** pour les données serveur
```typescript
const { data, isLoading } = useQuery({
  queryKey: ['members', filter],
  queryFn: async () => {
    const { data } = await supabase.from('profiles').select('*')
    return data
  },
})
```

**Mutations**
```typescript
const mutation = useMutation({
  mutationFn: async (newMember) => {
    await supabase.from('profiles').insert([newMember])
  },
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['members'] })
  },
})
```

---

## 📝 Règles de code

### TypeScript

```typescript
// ✅ Types stricts
interface MemberFormData {
  first_name: string
  last_name: string
  email: string
  phone?: string
}

// ✅ Validation Zod
const memberSchema = z.object({
  first_name: z.string().min(2),
  last_name: z.string().min(2),
  email: z.string().email(),
})

// ❌ Éviter any
const data: any = ... // NON
```

### Composants

```typescript
// ✅ Props typées
interface MemberCardProps {
  member: Profile
  onEdit?: (id: string) => void
}

export function MemberCard({ member, onEdit }: MemberCardProps) {
  // ...
}

// ✅ Nommage cohérent
// Composants : PascalCase
// Fonctions : camelCase
// Fichiers : kebab-case ou PascalCase (composants)
```

### Styling

```typescript
// ✅ Tailwind avec shadcn/ui
<Button variant="outline" size="sm">Éditer</Button>

// ✅ Classes conditionnelles avec clsx
import { cn } from '@/lib/utils'

<div className={cn(
  "p-4 rounded",
  isActive && "bg-blue-500",
  isDisabled && "opacity-50"
)} />
```

---

## 🚦 Workflow de développement

### Phase par phase

1. **Toujours commencer par lire le plan de la phase**
2. **Créer les fichiers dans l'ordre logique** :
   - Types/interfaces d'abord
   - Composants UI de base
   - Pages et logique métier
   - Tests (si demandé)

3. **Tester après chaque fonctionnalité majeure**

### Checklist avant de passer à la phase suivante

- [ ] Tous les fichiers de la phase sont créés
- [ ] Le code compile sans erreur TypeScript
- [ ] L'authentification fonctionne
- [ ] Les requêtes Supabase retournent des données
- [ ] Le responsive est fonctionnel
- [ ] Les erreurs sont gérées (try/catch, error boundaries)

---

## 🔧 Commandes utiles

```bash
# Développement
npm run dev

# Build (vérifier avant chaque phase)
npm run build

# Type check
npm run type-check

# Installation shadcn/ui
npx shadcn-ui@latest add button
npx shadcn-ui@latest add card
npx shadcn-ui@latest add dialog
# etc.
```

---

## 🐛 Gestion des erreurs

### Try/Catch systématique

```typescript
const createMember = async (data: MemberFormData) => {
  try {
    const { data: newMember, error } = await supabase
      .from('profiles')
      .insert([data])
      .select()
      .single()

    if (error) throw error

    toast.success('Membre créé avec succès')
    router.push('/members')
  } catch (error) {
    console.error('Error creating member:', error)
    toast.error('Erreur lors de la création du membre')
  }
}
```

### Error Boundaries

```typescript
// app/error.tsx
'use client'

export default function Error({
  error,
  reset,
}: {
  error: Error
  reset: () => void
}) {
  return (
    <div className="p-6">
      <h2>Une erreur est survenue</h2>
      <button onClick={reset}>Réessayer</button>
    </div>
  )
}
```

---

## 📊 Patterns à suivre

### 1. Séparation des responsabilités

```typescript
// ✅ BON
// app/(dashboard)/members/page.tsx
export default async function MembersPage() {
  const members = await getMembers()
  return <MembersList members={members} />
}

// components/features/members/MembersList.tsx
export function MembersList({ members }) {
  return members.map(m => <MemberCard key={m.id} member={m} />)
}

// components/features/members/MemberCard.tsx
export function MemberCard({ member }) {
  return <Card>...</Card>
}
```

### 2. Hooks personnalisés

```typescript
// lib/hooks/useMembers.ts
export function useMembers(filter?: string) {
  return useQuery({
    queryKey: ['members', filter],
    queryFn: async () => {
      const supabase = createClient()
      let query = supabase.from('profiles').select('*')

      if (filter) {
        query = query.ilike('first_name', `%${filter}%`)
      }

      const { data } = await query
      return data
    },
  })
}

// Usage
const { data: members, isLoading } = useMembers(searchTerm)
```

### 3. Loading States

```typescript
// ✅ Toujours gérer le loading
{isLoading ? (
  <Skeleton />
) : (
  <MembersList data={data} />
)}

// ✅ Ou avec Suspense
<Suspense fallback={<Skeleton />}>
  <MembersList />
</Suspense>
```

---

## 🎨 Design System

### Couleurs (cohérence avec l'app mobile)

```typescript
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: '#3b82f6',    // Blue
        secondary: '#8b5cf6',  // Purple
        success: '#10b981',    // Green
        warning: '#f59e0b',    // Orange
        danger: '#ef4444',     // Red
      },
    },
  },
}
```

### Composants UI (shadcn/ui)

Installer au fur et à mesure :
- `button`, `input`, `label` (Phase 1)
- `card`, `dialog`, `table` (Phase 2)
- `tabs`, `badge`, `select` (Phase 3-5)
- `chart` via Recharts (Phase 6)

---

## 📚 Ressources

### Documentation officielle
- [Next.js 15](https://nextjs.org/docs)
- [Supabase SSR](https://supabase.com/docs/guides/auth/server-side/nextjs)
- [shadcn/ui](https://ui.shadcn.com)
- [TanStack Query](https://tanstack.com/query/latest)

### Exemples de code

Consulter les phases détaillées :
- [Phase 1 - Foundation](./phase-1-foundation.md)
- [Phase 2 - Dashboard & Membres](./phase-2-dashboard-membres.md)
- [Phase 3 - Cours & Planning](./phase-3-cours-planning.md)
- [Phase 4 - Abonnements](./phase-4-abonnements.md)
- [Phase 5 - Badges](./phase-5-badges.md)
- [Phase 6 - Présences & Analytics](./phase-6-presences-analytics.md)
- [Phase 7 - Optimisations](./phase-7-optimisations.md)

---

## ⚠️ Pièges à éviter

### 1. Supabase Client

```typescript
// ❌ MAUVAIS - Créer le client à chaque fois
function Component() {
  const supabase = createClient() // Recrée à chaque render !
  // ...
}

// ✅ BON - Hook ou Server Component
function Component() {
  const { data } = useQuery({
    queryKey: ['data'],
    queryFn: async () => {
      const supabase = createClient()
      return supabase.from('table').select()
    }
  })
}
```

### 2. Hydration Errors

```typescript
// ❌ Peut causer des erreurs d'hydratation
<div>{new Date().toISOString()}</div>

// ✅ Utiliser useEffect ou server component
'use client'
const [date, setDate] = useState('')
useEffect(() => setDate(new Date().toISOString()), [])
```

### 3. Mutations sans invalidation

```typescript
// ❌ Le cache n'est pas mis à jour
await supabase.from('profiles').insert([data])

// ✅ Invalider le cache après mutation
await supabase.from('profiles').insert([data])
queryClient.invalidateQueries({ queryKey: ['members'] })
```

---

## 🚀 Commencer le développement

### Étape 1 : Setup initial

```bash
# Créer le projet
npx create-next-app@latest ckm-admin --typescript --tailwind --app --use-npm

cd ckm-admin

# Installer les dépendances
npm install @supabase/supabase-js @supabase/ssr
npm install zustand @tanstack/react-query
npm install react-hook-form @hookform/resolvers zod
npm install date-fns clsx tailwindcss-animate
npm install lucide-react

# Installer shadcn/ui
npx shadcn-ui@latest init
```

### Étape 2 : Configuration

1. Copier `database.types.ts` depuis `../mobile/src/@types/`
2. Créer `.env.local` avec les credentials Supabase
3. Configurer `middleware.ts`
4. Créer les clients Supabase (server + client)

### Étape 3 : Développer phase par phase

Suivre l'ordre des phases 1 à 7.

---

## ✅ Critères de succès

Une phase est terminée quand :
- ✅ Tous les fichiers sont créés
- ✅ TypeScript compile sans erreur
- ✅ L'application fonctionne en mode dev
- ✅ Les requêtes Supabase retournent des données
- ✅ L'UI est responsive
- ✅ Les erreurs sont gérées
- ✅ Le code suit les conventions établies

---

## 🎯 Objectif final

Une application Next.js complète, performante et sécurisée permettant aux administrateurs, coachs et secrétaires de gérer efficacement le club CKM66.

**Bonne chance ! 🥋**
