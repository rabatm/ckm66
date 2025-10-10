# Phase 2 : Dashboard & Membres (Semaine 3-4)

## 🎯 Objectifs

Créer le dashboard multi-rôles et le module complet de gestion des membres.

---

## 📋 Tâches

### 2.1 Dashboard multi-rôles

**Structure**
```
app/(dashboard)/dashboard/
├── page.tsx                    # Router selon rôle
├── _components/
│   ├── AdminDashboard.tsx
│   ├── InstructorDashboard.tsx
│   └── SecretaryDashboard.tsx
```

**Router principal** (`app/(dashboard)/dashboard/page.tsx`)
```typescript
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { AdminDashboard } from './_components/AdminDashboard'
import { InstructorDashboard } from './_components/InstructorDashboard'
import { SecretaryDashboard } from './_components/SecretaryDashboard'

export default async function DashboardPage() {
  const supabase = createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  switch (profile?.role) {
    case 'admin':
      return <AdminDashboard profile={profile} />
    case 'instructor':
      return <InstructorDashboard profile={profile} />
    case 'secretary':
      return <SecretaryDashboard profile={profile} />
    default:
      redirect('/login')
  }
}
```

---

### 2.2 Dashboard Admin

**Composant** (`_components/AdminDashboard.tsx`)

**KPIs à afficher**
- Nombre total de membres actifs
- Revenus du mois
- Taux de remplissage moyen des cours
- Nouveaux membres ce mois
- Abonnements expirant sous 7 jours

**Composant exemple**
```typescript
'use client'

import { useQuery } from '@tanstack/react-query'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { createClient } from '@/lib/supabase/client'

export function AdminDashboard({ profile }: { profile: any }) {
  const supabase = createClient()

  // Fetch KPIs
  const { data: stats } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: async () => {
      // Membres actifs
      const { count: activeMembers } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('role', 'member')

      // Abonnements actifs
      const { count: activeSubscriptions } = await supabase
        .from('subscriptions')
        .select('*', { count: 'exact', head: true })
        .eq('is_active', true)

      // Revenus du mois
      const startOfMonth = new Date()
      startOfMonth.setDate(1)

      const { data: monthlyRevenue } = await supabase
        .from('subscriptions')
        .select('price')
        .eq('payment_status', 'paid')
        .gte('created_at', startOfMonth.toISOString())

      const totalRevenue = monthlyRevenue?.reduce((sum, sub) => sum + (sub.price || 0), 0) || 0

      // Abonnements expirant bientôt
      const in7Days = new Date()
      in7Days.setDate(in7Days.getDate() + 7)

      const { count: expiringSubscriptions } = await supabase
        .from('subscriptions')
        .select('*', { count: 'exact', head: true })
        .eq('is_active', true)
        .lte('end_date', in7Days.toISOString().split('T')[0])

      return {
        activeMembers,
        activeSubscriptions,
        totalRevenue,
        expiringSubscriptions,
      }
    },
  })

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Dashboard Admin</h1>
      <p className="text-gray-500">Bienvenue, {profile.first_name} !</p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Membres actifs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats?.activeMembers || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Abonnements actifs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats?.activeSubscriptions || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Revenus du mois</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats?.totalRevenue?.toFixed(2)}€</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Expirations à venir</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-orange-500">
              {stats?.expiringSubscriptions || 0}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Graphiques et autres widgets */}
    </div>
  )
}
```

---

### 2.3 Dashboard Instructeur

**KPIs à afficher**
- Mes cours aujourd'hui
- Mes cours cette semaine
- Nombre d'élèves total
- Taux de remplissage moyen de mes cours

```typescript
'use client'

export function InstructorDashboard({ profile }: { profile: any }) {
  const supabase = createClient()

  const { data: todayCourses } = useQuery({
    queryKey: ['instructor-today-courses', profile.id],
    queryFn: async () => {
      const today = new Date().toISOString().split('T')[0]

      return await supabase
        .from('course_instances')
        .select(`
          *,
          course:courses(name, level),
          reservations(count)
        `)
        .or(`instructor_id.eq.${profile.id},backup_instructor_id.eq.${profile.id}`)
        .eq('instance_date', today)
        .eq('status', 'scheduled')
    },
  })

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Dashboard Coach</h1>
      <p className="text-gray-500">Bienvenue, {profile.first_name} !</p>

      {/* Liste des cours du jour */}
      <Card>
        <CardHeader>
          <CardTitle>Mes cours aujourd'hui</CardTitle>
        </CardHeader>
        <CardContent>
          {todayCourses?.data?.length === 0 ? (
            <p className="text-gray-500">Aucun cours aujourd'hui</p>
          ) : (
            <ul className="space-y-2">
              {todayCourses?.data?.map((instance) => (
                <li key={instance.id} className="flex justify-between p-3 border rounded">
                  <div>
                    <p className="font-medium">{instance.course.name}</p>
                    <p className="text-sm text-gray-500">
                      {instance.start_time} - {instance.end_time}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">
                      {instance.current_reservations}/{instance.max_capacity}
                    </p>
                    <p className="text-sm text-gray-500">participants</p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
```

---

### 2.4 Dashboard Secrétaire

**KPIs à afficher**
- Nouveaux membres cette semaine
- Abonnements expirant sous 7 jours
- Réservations du jour
- Paiements en attente

```typescript
'use client'

export function SecretaryDashboard({ profile }: { profile: any }) {
  // Similar structure with secretary-specific data

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Dashboard Secrétaire</h1>
      {/* Secretary-specific widgets */}
    </div>
  )
}
```

---

### 2.5 Module Membres - Liste

**Structure**
```
app/(dashboard)/members/
├── page.tsx                    # Liste des membres
├── [id]/
│   └── page.tsx               # Détail membre
├── new/
│   └── page.tsx               # Créer membre
└── _components/
    ├── MembersList.tsx
    ├── MemberFilters.tsx
    ├── MemberCard.tsx
    └── MemberForm.tsx
```

**Liste avec filtres** (`page.tsx`)
```typescript
'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { MemberCard } from './_components/MemberCard'
import Link from 'next/link'

export default function MembersPage() {
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState<string>('all')
  const supabase = createClient()

  const { data: members, isLoading } = useQuery({
    queryKey: ['members', search, roleFilter],
    queryFn: async () => {
      let query = supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false })

      if (search) {
        query = query.or(`first_name.ilike.%${search}%,last_name.ilike.%${search}%,email.ilike.%${search}%`)
      }

      if (roleFilter !== 'all') {
        query = query.eq('role', roleFilter)
      }

      const { data } = await query
      return data
    },
  })

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Membres</h1>
        <Link href="/members/new">
          <Button>Nouveau membre</Button>
        </Link>
      </div>

      {/* Filtres */}
      <div className="flex gap-4">
        <Input
          placeholder="Rechercher un membre..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-sm"
        />

        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="px-3 py-2 border rounded"
        >
          <option value="all">Tous les rôles</option>
          <option value="member">Membres</option>
          <option value="instructor">Instructeurs</option>
          <option value="secretary">Secrétaires</option>
        </select>
      </div>

      {/* Liste */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {isLoading ? (
          <p>Chargement...</p>
        ) : (
          members?.map((member) => (
            <MemberCard key={member.id} member={member} />
          ))
        )}
      </div>
    </div>
  )
}
```

---

### 2.6 Module Membres - Détail

**Page détail** (`[id]/page.tsx`)

**Afficher**
- Informations personnelles
- Abonnement actif
- Statistiques (niveau, points, badges)
- Historique des cours
- Dernières présences

```typescript
import { createClient } from '@/lib/supabase/server'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export default async function MemberDetailPage({
  params,
}: {
  params: { id: string }
}) {
  const supabase = createClient()

  const { data: member } = await supabase
    .from('profiles')
    .select(`
      *,
      subscriptions(*, active:is_active.eq.true),
      user_badges(
        *,
        badge:badges(*)
      )
    `)
    .eq('id', params.id)
    .single()

  const activeSubscription = member?.subscriptions?.find(s => s.is_active)

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">
        {member?.first_name} {member?.last_name}
      </h1>

      {/* Informations générales */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Informations</h2>
          <dl className="space-y-2">
            <div>
              <dt className="text-sm text-gray-500">Email</dt>
              <dd className="font-medium">{member?.email}</dd>
            </div>
            <div>
              <dt className="text-sm text-gray-500">Téléphone</dt>
              <dd className="font-medium">{member?.phone || 'Non renseigné'}</dd>
            </div>
            <div>
              <dt className="text-sm text-gray-500">Rôle</dt>
              <dd>
                <Badge>{member?.role}</Badge>
              </dd>
            </div>
          </dl>
        </Card>

        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Progression</h2>
          <dl className="space-y-2">
            <div>
              <dt className="text-sm text-gray-500">Niveau</dt>
              <dd className="font-medium">Niveau {member?.current_level}</dd>
            </div>
            <div>
              <dt className="text-sm text-gray-500">Points</dt>
              <dd className="font-medium">{member?.total_points} pts</dd>
            </div>
            <div>
              <dt className="text-sm text-gray-500">Cours suivis</dt>
              <dd className="font-medium">{member?.total_classes || 0}</dd>
            </div>
          </dl>
        </Card>
      </div>

      {/* Abonnement */}
      {activeSubscription && (
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Abonnement actif</h2>
          <p>Type : {activeSubscription.type}</p>
          <p>Expire le : {activeSubscription.end_date}</p>
        </Card>
      )}

      {/* Badges */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Badges débloqués</h2>
        <div className="flex flex-wrap gap-2">
          {member?.user_badges?.map((ub) => (
            <div
              key={ub.id}
              className="flex items-center gap-2 px-3 py-2 bg-gray-100 rounded"
            >
              <span className="text-2xl">{ub.badge.icon_emoji}</span>
              <span className="text-sm">{ub.badge.name}</span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}
```

---

### 2.7 Module Membres - Formulaire

**Créer/Éditer** (`_components/MemberForm.tsx`)

```typescript
'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

const memberSchema = z.object({
  email: z.string().email(),
  first_name: z.string().min(2),
  last_name: z.string().min(2),
  phone: z.string().optional(),
  role: z.enum(['member', 'instructor', 'secretary', 'admin']),
})

type MemberFormData = z.infer<typeof memberSchema>

export function MemberForm({ member }: { member?: any }) {
  const router = useRouter()
  const supabase = createClient()

  const form = useForm<MemberFormData>({
    resolver: zodResolver(memberSchema),
    defaultValues: member || {
      role: 'member',
    },
  })

  const onSubmit = async (data: MemberFormData) => {
    if (member) {
      // Update
      await supabase
        .from('profiles')
        .update(data)
        .eq('id', member.id)
    } else {
      // Create - need to create auth user first
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: data.email,
        email_confirm: true,
      })

      if (!authError && authData.user) {
        await supabase
          .from('profiles')
          .update(data)
          .eq('id', authData.user.id)
      }
    }

    router.push('/members')
    router.refresh()
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
      <Input {...form.register('email')} placeholder="Email" />
      <Input {...form.register('first_name')} placeholder="Prénom" />
      <Input {...form.register('last_name')} placeholder="Nom" />
      <Input {...form.register('phone')} placeholder="Téléphone" />

      <select {...form.register('role')} className="w-full px-3 py-2 border rounded">
        <option value="member">Membre</option>
        <option value="instructor">Instructeur</option>
        <option value="secretary">Secrétaire</option>
        <option value="admin">Admin</option>
      </select>

      <Button type="submit">
        {member ? 'Mettre à jour' : 'Créer'}
      </Button>
    </form>
  )
}
```

---

## ✅ Checklist Phase 2

- [ ] Dashboard Admin avec KPIs
- [ ] Dashboard Instructeur
- [ ] Dashboard Secrétaire
- [ ] Liste des membres avec filtres/recherche
- [ ] Carte membre (composant)
- [ ] Page détail membre
- [ ] Formulaire création membre
- [ ] Formulaire édition membre
- [ ] Affichage badges et statistiques
- [ ] Affichage abonnement actif

---

## 🚀 Résultat attendu

À la fin de la Phase 2 :
- Dashboards fonctionnels pour chaque rôle
- CRUD complet sur les membres
- Affichage riche des profils membres
- Navigation fluide

**Prochaine étape** : [Phase 3 - Cours & Planning](./phase-3-cours-planning.md)
