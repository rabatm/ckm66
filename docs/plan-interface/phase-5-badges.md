# Phase 5 : Badges & Gamification (Semaine 8)

## 🎯 Objectifs

Implémenter le système de badges complet avec attribution manuelle par les coachs et vérification automatique.

---

## 📋 Tâches

### 5.1 Module Badges - Catalogue

**Structure**
```
app/(dashboard)/badges/
├── page.tsx                    # Catalogue badges
├── new/
│   └── page.tsx               # Créer badge custom
├── award/
│   └── page.tsx               # Attribuer badge
└── _components/
    ├── BadgeCard.tsx
    ├── BadgeForm.tsx
    ├── AwardBadgeForm.tsx
    └── UserBadgesDisplay.tsx
```

**Catalogue des badges** (`page.tsx`)

```typescript
'use client'

import { useQuery } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import Link from 'next/link'

export default function BadgesPage() {
  const supabase = createClient()

  const { data: badges } = useQuery({
    queryKey: ['badges'],
    queryFn: async () => {
      const { data } = await supabase
        .from('badges')
        .select('*')
        .eq('is_active', true)
        .order('category')
        .order('display_order')

      return data
    },
  })

  const groupByCategory = (badges: any[]) => {
    return badges?.reduce((acc, badge) => {
      if (!acc[badge.category]) {
        acc[badge.category] = []
      }
      acc[badge.category].push(badge)
      return acc
    }, {} as Record<string, any[]>)
  }

  const badgesByCategory = groupByCategory(badges || [])

  const categoryLabels: Record<string, string> = {
    assiduity: 'Assiduité',
    presence: 'Présence',
    punctuality: 'Ponctualité',
    discipline: 'Discipline',
    longevity: 'Longévité',
    technical: 'Techniques',
    quality: 'Qualité',
    attitude: 'Attitude',
    custom: 'Personnalisés',
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Badges</h1>
        <div className="flex gap-2">
          <Link href="/badges/award">
            <Button>Attribuer un badge</Button>
          </Link>
          <Link href="/badges/new">
            <Button variant="outline">Créer un badge</Button>
          </Link>
        </div>
      </div>

      <Tabs defaultValue="assiduity">
        <TabsList>
          {Object.keys(badgesByCategory).map((category) => (
            <TabsTrigger key={category} value={category}>
              {categoryLabels[category] || category}
            </TabsTrigger>
          ))}
        </TabsList>

        {Object.entries(badgesByCategory).map(([category, categoryBadges]) => (
          <TabsContent key={category} value={category} className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {categoryBadges.map((badge) => (
                <Card key={badge.id} className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="text-4xl">{badge.icon_emoji}</div>

                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold">{badge.name}</h3>
                        <Badge variant={badge.type === 'automatic' ? 'default' : 'secondary'}>
                          {badge.type === 'automatic' ? 'Auto' : 'Manuel'}
                        </Badge>
                      </div>

                      <p className="text-sm text-gray-600 mb-3">{badge.description}</p>

                      <div className="flex items-center gap-4 text-sm">
                        <div>
                          <span className="text-gray-500">Points:</span>{' '}
                          <span className="font-medium">{badge.points}</span>
                        </div>

                        {badge.type === 'automatic' && badge.requirement_rule && (
                          <div className="text-xs text-gray-500">
                            Requis: {JSON.stringify(badge.requirement_rule)}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  )
}
```

---

### 5.2 Créer un badge personnalisé

**Formulaire** (`new/page.tsx`)

```typescript
'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

const badgeSchema = z.object({
  code: z.string().min(3).max(100),
  name: z.string().min(3).max(200),
  description: z.string().min(10),
  icon_emoji: z.string().min(1).max(10),
  points: z.coerce.number().min(1).max(200),
  category: z.enum(['technical', 'quality', 'attitude', 'custom']),
})

type BadgeFormData = z.infer<typeof badgeSchema>

export default function NewBadgePage() {
  const router = useRouter()
  const supabase = createClient()

  const form = useForm<BadgeFormData>({
    resolver: zodResolver(badgeSchema),
    defaultValues: {
      category: 'custom',
      points: 50,
    },
  })

  const onSubmit = async (data: BadgeFormData) => {
    const { data: user } = await supabase.auth.getUser()

    await supabase.from('badges').insert([
      {
        ...data,
        type: 'manual',
        is_system: false,
        created_by: user.user?.id,
      },
    ])

    router.push('/badges')
    router.refresh()
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold">Créer un badge personnalisé</h1>

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div>
          <label className="block text-sm font-medium mb-2">Code (unique)</label>
          <Input {...form.register('code')} placeholder="custom_excellence" />
          <p className="text-xs text-gray-500 mt-1">
            Identifiant unique en minuscules (ex: custom_excellence)
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Nom</label>
          <Input {...form.register('name')} placeholder="Excellence technique" />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Description</label>
          <Textarea
            {...form.register('description')}
            rows={3}
            placeholder="Décerné pour une excellence technique remarquable..."
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Emoji</label>
            <Input {...form.register('icon_emoji')} placeholder="🏆" maxLength={10} />
            <p className="text-xs text-gray-500 mt-1">Un emoji qui représente le badge</p>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Points</label>
            <Input {...form.register('points')} type="number" />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Catégorie</label>
          <select {...form.register('category')} className="w-full px-3 py-2 border rounded">
            <option value="technical">Technique</option>
            <option value="quality">Qualité</option>
            <option value="attitude">Attitude</option>
            <option value="custom">Personnalisé</option>
          </select>
        </div>

        <Button type="submit">Créer le badge</Button>
      </form>
    </div>
  )
}
```

---

### 5.3 Attribuer un badge

**Formulaire d'attribution** (`award/page.tsx`)

```typescript
'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { useRouter } from 'next/navigation'

export default function AwardBadgePage() {
  const [selectedUser, setSelectedUser] = useState('')
  const [selectedBadge, setSelectedBadge] = useState('')
  const [coachMessage, setCoachMessage] = useState('')
  const [searchTerm, setSearchTerm] = useState('')

  const supabase = createClient()
  const router = useRouter()
  const queryClient = useQueryClient()

  // Fetch members
  const { data: members } = useQuery({
    queryKey: ['members-for-badges', searchTerm],
    queryFn: async () => {
      let query = supabase
        .from('profiles')
        .select('id, first_name, last_name, email')
        .eq('role', 'member')
        .order('first_name')

      if (searchTerm) {
        query = query.or(
          `first_name.ilike.%${searchTerm}%,last_name.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%`
        )
      }

      const { data } = await query.limit(20)
      return data
    },
  })

  // Fetch manual badges
  const { data: badges } = useQuery({
    queryKey: ['manual-badges'],
    queryFn: async () => {
      const { data } = await supabase
        .from('badges')
        .select('*')
        .eq('type', 'manual')
        .eq('is_active', true)
        .order('category')
        .order('name')

      return data
    },
  })

  // Fetch user's current badges
  const { data: userBadges } = useQuery({
    queryKey: ['user-badges', selectedUser],
    queryFn: async () => {
      if (!selectedUser) return []

      const { data } = await supabase
        .from('user_badges')
        .select('badge_id')
        .eq('user_id', selectedUser)

      return data?.map((ub) => ub.badge_id) || []
    },
    enabled: !!selectedUser,
  })

  const awardBadge = useMutation({
    mutationFn: async () => {
      const { data: user } = await supabase.auth.getUser()

      await supabase.from('user_badges').insert([
        {
          user_id: selectedUser,
          badge_id: selectedBadge,
          awarded_by: user.user?.id,
          coach_message: coachMessage || null,
        },
      ])
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-badges'] })
      router.push(`/members/${selectedUser}`)
    },
  })

  const availableBadges = badges?.filter((b) => !userBadges?.includes(b.id))

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold">Attribuer un badge</h1>

      <div className="space-y-6">
        {/* Recherche membre */}
        <div>
          <label className="block text-sm font-medium mb-2">Rechercher un membre</label>
          <Input
            placeholder="Nom, prénom ou email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />

          {searchTerm && members && members.length > 0 && (
            <div className="mt-2 border rounded divide-y max-h-60 overflow-y-auto">
              {members.map((member) => (
                <button
                  key={member.id}
                  onClick={() => {
                    setSelectedUser(member.id)
                    setSearchTerm('')
                  }}
                  className="w-full px-4 py-2 text-left hover:bg-gray-50"
                >
                  <p className="font-medium">
                    {member.first_name} {member.last_name}
                  </p>
                  <p className="text-sm text-gray-500">{member.email}</p>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Membre sélectionné */}
        {selectedUser && (
          <div className="p-4 bg-blue-50 rounded">
            <p className="text-sm text-gray-600">Membre sélectionné:</p>
            <p className="font-medium">
              {members?.find((m) => m.id === selectedUser)?.first_name}{' '}
              {members?.find((m) => m.id === selectedUser)?.last_name}
            </p>
          </div>
        )}

        {/* Sélection badge */}
        {selectedUser && (
          <div>
            <label className="block text-sm font-medium mb-2">Badge à attribuer</label>
            <select
              value={selectedBadge}
              onChange={(e) => setSelectedBadge(e.target.value)}
              className="w-full px-3 py-2 border rounded"
            >
              <option value="">Sélectionner un badge</option>
              {availableBadges?.map((badge) => (
                <option key={badge.id} value={badge.id}>
                  {badge.icon_emoji} {badge.name} ({badge.points} pts)
                </option>
              ))}
            </select>

            {userBadges && userBadges.length > 0 && (
              <p className="text-xs text-gray-500 mt-1">
                Les badges déjà débloqués sont masqués
              </p>
            )}
          </div>
        )}

        {/* Message du coach */}
        {selectedBadge && (
          <div>
            <label className="block text-sm font-medium mb-2">
              Message personnel (optionnel)
            </label>
            <Textarea
              value={coachMessage}
              onChange={(e) => setCoachMessage(e.target.value)}
              rows={4}
              placeholder="Félicitations pour ton excellente progression..."
            />
          </div>
        )}

        {/* Bouton validation */}
        {selectedUser && selectedBadge && (
          <Button
            onClick={() => awardBadge.mutate()}
            disabled={awardBadge.isPending}
            className="w-full"
          >
            Attribuer le badge
          </Button>
        )}
      </div>
    </div>
  )
}
```

---

### 5.4 Vérification automatique des badges

**Trigger manuel** (`_components/CheckBadgesButton.tsx`)

```typescript
'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { useToast } from '@/components/ui/use-toast'

export function CheckBadgesButton({ userId }: { userId: string }) {
  const supabase = createClient()
  const queryClient = useQueryClient()
  const { toast } = useToast()

  const checkBadges = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.rpc('check_and_unlock_badges', {
        p_user_id: userId,
      })

      if (error) throw error
      return data
    },
    onSuccess: (data) => {
      const result = data?.[0]

      if (result?.newly_unlocked_count > 0) {
        toast({
          title: `${result.newly_unlocked_count} nouveau(x) badge(s) débloqué(s) !`,
          description: 'Les badges ont été automatiquement attribués.',
        })
      } else {
        toast({
          title: 'Aucun nouveau badge',
          description: 'Tous les badges automatiques ont déjà été débloqués.',
        })
      }

      queryClient.invalidateQueries({ queryKey: ['user-badges', userId] })
      queryClient.invalidateQueries({ queryKey: ['members'] })
    },
  })

  return (
    <Button
      onClick={() => checkBadges.mutate()}
      disabled={checkBadges.isPending}
      variant="outline"
    >
      Vérifier les badges
    </Button>
  )
}
```

---

### 5.5 Affichage badges utilisateur

**Composant d'affichage** (`_components/UserBadgesDisplay.tsx`)

```typescript
'use client'

import { useQuery } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { Card } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

export function UserBadgesDisplay({ userId }: { userId: string }) {
  const supabase = createClient()

  const { data: userBadges } = useQuery({
    queryKey: ['user-badges-full', userId],
    queryFn: async () => {
      const { data } = await supabase
        .from('user_badges')
        .select(`
          *,
          badge:badges(*),
          awarded_by_user:profiles!awarded_by(first_name, last_name)
        `)
        .eq('user_id', userId)
        .order('unlocked_at', { ascending: false })

      return data
    },
  })

  const groupByCategory = (badges: any[]) => {
    return badges?.reduce((acc, ub) => {
      const category = ub.badge.category
      if (!acc[category]) {
        acc[category] = []
      }
      acc[category].push(ub)
      return acc
    }, {} as Record<string, any[]>)
  }

  const badgesByCategory = groupByCategory(userBadges || [])

  return (
    <Card className="p-6">
      <h3 className="text-xl font-semibold mb-4">
        Badges débloqués ({userBadges?.length || 0})
      </h3>

      {userBadges && userBadges.length > 0 ? (
        <Tabs defaultValue={Object.keys(badgesByCategory)[0]}>
          <TabsList>
            {Object.keys(badgesByCategory).map((category) => (
              <TabsTrigger key={category} value={category}>
                {category} ({badgesByCategory[category].length})
              </TabsTrigger>
            ))}
          </TabsList>

          {Object.entries(badgesByCategory).map(([category, badges]) => (
            <TabsContent key={category} value={category}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                {badges.map((ub) => (
                  <div key={ub.id} className="flex items-start gap-3 p-4 border rounded">
                    <div className="text-3xl">{ub.badge.icon_emoji}</div>
                    <div className="flex-1">
                      <p className="font-semibold">{ub.badge.name}</p>
                      <p className="text-sm text-gray-600">{ub.badge.description}</p>
                      <p className="text-sm text-gray-500 mt-2">
                        +{ub.badge.points} pts •{' '}
                        {new Date(ub.unlocked_at).toLocaleDateString('fr-FR')}
                      </p>

                      {ub.coach_message && (
                        <div className="mt-2 p-2 bg-blue-50 rounded text-sm">
                          <p className="text-gray-600 italic">"{ub.coach_message}"</p>
                          {ub.awarded_by_user && (
                            <p className="text-xs text-gray-500 mt-1">
                              - {ub.awarded_by_user.first_name} {ub.awarded_by_user.last_name}
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>
          ))}
        </Tabs>
      ) : (
        <p className="text-gray-500">Aucun badge débloqué pour le moment.</p>
      )}
    </Card>
  )
}
```

---

## ✅ Checklist Phase 5

- [ ] Catalogue complet des badges par catégorie
- [ ] Formulaire création badge personnalisé
- [ ] Formulaire attribution manuelle
- [ ] Message personnalisé du coach
- [ ] Vérification automatique badges
- [ ] Affichage badges par utilisateur
- [ ] Filtrer badges déjà débloqués
- [ ] Historique d'attribution
- [ ] Statistiques badges globales

---

## 🚀 Résultat attendu

À la fin de la Phase 5 :
- Système de badges complet et fonctionnel
- Coachs peuvent attribuer badges avec messages
- Vérification automatique opérationnelle
- Affichage riche des accomplissements

**Prochaine étape** : [Phase 6 - Présences & Analytics](./phase-6-presences-analytics.md)
