# Phase 4 : Abonnements & Paiements (Semaine 7)

## 🎯 Objectifs

Créer le module de gestion des abonnements avec suivi des paiements et alertes d'expiration.

---

## 📋 Tâches

### 4.1 Module Abonnements - Liste

**Structure**
```
app/(dashboard)/subscriptions/
├── page.tsx                    # Liste abonnements
├── [id]/
│   └── page.tsx               # Détail abonnement
├── new/
│   └── page.tsx               # Créer abonnement
└── _components/
    ├── SubscriptionsList.tsx
    ├── SubscriptionForm.tsx
    ├── ExpiringAlert.tsx
    └── PaymentStatus.tsx
```

**Liste des abonnements** (`page.tsx`)
```typescript
'use client'

import { useQuery } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import { useState } from 'react'

export default function SubscriptionsPage() {
  const [filter, setFilter] = useState<'all' | 'active' | 'expiring' | 'expired'>('active')
  const supabase = createClient()

  const { data: subscriptions } = useQuery({
    queryKey: ['subscriptions', filter],
    queryFn: async () => {
      let query = supabase
        .from('subscriptions')
        .select(`
          *,
          user:profiles!user_id(
            id,
            first_name,
            last_name,
            email
          )
        `)
        .order('end_date', { ascending: true })

      if (filter === 'active') {
        query = query.eq('is_active', true).eq('status', 'active')
      } else if (filter === 'expiring') {
        const in7Days = new Date()
        in7Days.setDate(in7Days.getDate() + 7)

        query = query
          .eq('is_active', true)
          .lte('end_date', in7Days.toISOString().split('T')[0])
      } else if (filter === 'expired') {
        query = query.eq('status', 'expired')
      }

      const { data } = await query
      return data
    },
  })

  const getStatusBadge = (sub: any) => {
    const endDate = new Date(sub.end_date)
    const today = new Date()
    const daysUntilExpiry = Math.ceil((endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))

    if (sub.status === 'expired') {
      return <Badge variant="destructive">Expiré</Badge>
    }

    if (daysUntilExpiry <= 7) {
      return <Badge variant="warning">Expire bientôt</Badge>
    }

    return <Badge variant="default">Actif</Badge>
  }

  const getTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      monthly: 'Mensuel',
      quarterly: 'Trimestriel',
      annual: 'Annuel',
      session_pack: 'Pack séances',
    }
    return labels[type] || type
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Abonnements</h1>
        <Link href="/subscriptions/new">
          <Button>Nouvel abonnement</Button>
        </Link>
      </div>

      {/* Filtres */}
      <div className="flex gap-2">
        <Button
          variant={filter === 'all' ? 'default' : 'outline'}
          onClick={() => setFilter('all')}
        >
          Tous
        </Button>
        <Button
          variant={filter === 'active' ? 'default' : 'outline'}
          onClick={() => setFilter('active')}
        >
          Actifs
        </Button>
        <Button
          variant={filter === 'expiring' ? 'default' : 'outline'}
          onClick={() => setFilter('expiring')}
        >
          Expirant bientôt
        </Button>
        <Button
          variant={filter === 'expired' ? 'default' : 'outline'}
          onClick={() => setFilter('expired')}
        >
          Expirés
        </Button>
      </div>

      {/* Liste */}
      <div className="space-y-4">
        {subscriptions?.map((sub) => (
          <Card key={sub.id} className="p-6">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-lg font-semibold">
                    {sub.user?.first_name} {sub.user?.last_name}
                  </h3>
                  {getStatusBadge(sub)}
                </div>

                <p className="text-sm text-gray-500 mb-3">{sub.user?.email}</p>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">Type:</span>{' '}
                    <span className="font-medium">{getTypeLabel(sub.type)}</span>
                  </div>

                  <div>
                    <span className="text-gray-500">Début:</span>{' '}
                    <span className="font-medium">
                      {new Date(sub.start_date).toLocaleDateString('fr-FR')}
                    </span>
                  </div>

                  <div>
                    <span className="text-gray-500">Fin:</span>{' '}
                    <span className="font-medium">
                      {new Date(sub.end_date).toLocaleDateString('fr-FR')}
                    </span>
                  </div>

                  <div>
                    <span className="text-gray-500">Prix:</span>{' '}
                    <span className="font-medium">{sub.price}€</span>
                  </div>
                </div>

                {sub.type === 'session_pack' && (
                  <div className="mt-3">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full"
                          style={{
                            width: `${(sub.remaining_sessions / sub.initial_sessions) * 100}%`,
                          }}
                        />
                      </div>
                      <span className="text-sm font-medium">
                        {sub.remaining_sessions}/{sub.initial_sessions} séances
                      </span>
                    </div>
                  </div>
                )}

                {sub.payment_status !== 'paid' && (
                  <div className="mt-3">
                    <Badge variant="warning">Paiement {sub.payment_status}</Badge>
                  </div>
                )}
              </div>

              <Link href={`/subscriptions/${sub.id}`}>
                <Button variant="outline" size="sm">
                  Détails
                </Button>
              </Link>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}
```

---

### 4.2 Formulaire Abonnement

**Créer/Renouveler** (`_components/SubscriptionForm.tsx`)

```typescript
'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { addMonths, addDays } from 'date-fns'

const subscriptionSchema = z.object({
  user_id: z.string().uuid(),
  type: z.enum(['monthly', 'quarterly', 'annual', 'session_pack']),
  start_date: z.string(),
  end_date: z.string(),
  price: z.coerce.number().min(0),
  payment_status: z.enum(['paid', 'pending', 'failed']),
  initial_sessions: z.coerce.number().optional(),
  remaining_sessions: z.coerce.number().optional(),
})

type SubscriptionFormData = z.infer<typeof subscriptionSchema>

export function SubscriptionForm({ subscription, userId }: { subscription?: any; userId?: string }) {
  const router = useRouter()
  const supabase = createClient()

  // Fetch members for dropdown
  const { data: members } = useQuery({
    queryKey: ['members-dropdown'],
    queryFn: async () => {
      const { data } = await supabase
        .from('profiles')
        .select('id, first_name, last_name, email')
        .eq('role', 'member')
        .order('first_name')

      return data
    },
  })

  const form = useForm<SubscriptionFormData>({
    resolver: zodResolver(subscriptionSchema),
    defaultValues: subscription || {
      user_id: userId || '',
      type: 'monthly',
      start_date: new Date().toISOString().split('T')[0],
      payment_status: 'pending',
    },
  })

  const selectedType = form.watch('type')
  const startDate = form.watch('start_date')

  // Auto-calculate end date based on type
  const calculateEndDate = (type: string, start: string) => {
    const startDateObj = new Date(start)

    switch (type) {
      case 'monthly':
        return addMonths(startDateObj, 1).toISOString().split('T')[0]
      case 'quarterly':
        return addMonths(startDateObj, 3).toISOString().split('T')[0]
      case 'annual':
        return addMonths(startDateObj, 12).toISOString().split('T')[0]
      case 'session_pack':
        return addMonths(startDateObj, 3).toISOString().split('T')[0]
      default:
        return start
    }
  }

  // Update end_date when type or start_date changes
  const handleTypeChange = (type: string) => {
    form.setValue('type', type as any)
    form.setValue('end_date', calculateEndDate(type, startDate))
  }

  const onSubmit = async (data: SubscriptionFormData) => {
    const subData = {
      ...data,
      is_active: true,
      status: 'active',
    }

    if (data.type === 'session_pack') {
      subData.remaining_sessions = data.initial_sessions
    }

    if (subscription) {
      await supabase
        .from('subscriptions')
        .update(subData)
        .eq('id', subscription.id)
    } else {
      await supabase.from('subscriptions').insert([subData])
    }

    router.push('/subscriptions')
    router.refresh()
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 max-w-2xl">
      {!userId && (
        <div>
          <label className="block text-sm font-medium mb-2">Membre</label>
          <select {...form.register('user_id')} className="w-full px-3 py-2 border rounded">
            <option value="">Sélectionner un membre</option>
            {members?.map((member) => (
              <option key={member.id} value={member.id}>
                {member.first_name} {member.last_name} ({member.email})
              </option>
            ))}
          </select>
        </div>
      )}

      <div>
        <label className="block text-sm font-medium mb-2">Type d'abonnement</label>
        <select
          {...form.register('type')}
          onChange={(e) => handleTypeChange(e.target.value)}
          className="w-full px-3 py-2 border rounded"
        >
          <option value="monthly">Mensuel</option>
          <option value="quarterly">Trimestriel</option>
          <option value="annual">Annuel</option>
          <option value="session_pack">Pack séances</option>
        </select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-2">Date de début</label>
          <Input
            {...form.register('start_date')}
            type="date"
            onChange={(e) => {
              form.setValue('start_date', e.target.value)
              form.setValue('end_date', calculateEndDate(selectedType, e.target.value))
            }}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Date de fin</label>
          <Input {...form.register('end_date')} type="date" />
        </div>
      </div>

      {selectedType === 'session_pack' && (
        <div>
          <label className="block text-sm font-medium mb-2">Nombre de séances</label>
          <Input
            {...form.register('initial_sessions')}
            type="number"
            placeholder="10"
          />
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-2">Prix (€)</label>
          <Input {...form.register('price')} type="number" step="0.01" />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Statut paiement</label>
          <select {...form.register('payment_status')} className="w-full px-3 py-2 border rounded">
            <option value="paid">Payé</option>
            <option value="pending">En attente</option>
            <option value="failed">Échoué</option>
          </select>
        </div>
      </div>

      <Button type="submit">
        {subscription ? 'Mettre à jour' : 'Créer l\'abonnement'}
      </Button>
    </form>
  )
}
```

---

### 4.3 Alertes d'expiration

**Widget d'alertes** (`_components/ExpiringAlert.tsx`)

```typescript
'use client'

import { useQuery } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export function ExpiringAlert() {
  const supabase = createClient()

  const { data: expiringSubscriptions } = useQuery({
    queryKey: ['expiring-subscriptions'],
    queryFn: async () => {
      const in7Days = new Date()
      in7Days.setDate(in7Days.getDate() + 7)

      const { data } = await supabase
        .from('subscriptions')
        .select(`
          *,
          user:profiles!user_id(first_name, last_name, email)
        `)
        .eq('is_active', true)
        .lte('end_date', in7Days.toISOString().split('T')[0])
        .order('end_date')

      return data
    },
  })

  if (!expiringSubscriptions || expiringSubscriptions.length === 0) {
    return null
  }

  return (
    <Alert variant="warning">
      <AlertTitle>⚠️ {expiringSubscriptions.length} abonnement(s) expirant bientôt</AlertTitle>
      <AlertDescription className="mt-2">
        <ul className="space-y-1">
          {expiringSubscriptions.slice(0, 5).map((sub) => (
            <li key={sub.id} className="text-sm">
              <strong>
                {sub.user?.first_name} {sub.user?.last_name}
              </strong>{' '}
              - Expire le {new Date(sub.end_date).toLocaleDateString('fr-FR')}
            </li>
          ))}
        </ul>

        <Link href="/subscriptions?filter=expiring" className="mt-3 inline-block">
          <Button variant="outline" size="sm">
            Voir tous
          </Button>
        </Link>
      </AlertDescription>
    </Alert>
  )
}
```

---

### 4.4 Statistiques revenus (Admin)

**Composant revenus** (`_components/RevenueStats.tsx`)

```typescript
'use client'

import { useQuery } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { startOfMonth, endOfMonth, subMonths, format } from 'date-fns'
import { fr } from 'date-fns/locale'

export function RevenueStats() {
  const supabase = createClient()

  const { data: monthlyRevenue } = useQuery({
    queryKey: ['monthly-revenue'],
    queryFn: async () => {
      const last6Months = Array.from({ length: 6 }, (_, i) => {
        const date = subMonths(new Date(), 5 - i)
        return {
          month: format(date, 'MMM yyyy', { locale: fr }),
          start: startOfMonth(date),
          end: endOfMonth(date),
        }
      })

      const revenueData = await Promise.all(
        last6Months.map(async ({ month, start, end }) => {
          const { data } = await supabase
            .from('subscriptions')
            .select('price')
            .eq('payment_status', 'paid')
            .gte('created_at', start.toISOString())
            .lte('created_at', end.toISOString())

          const total = data?.reduce((sum, sub) => sum + (sub.price || 0), 0) || 0

          return {
            month,
            revenue: total,
          }
        })
      )

      return revenueData
    },
  })

  const totalRevenue = monthlyRevenue?.reduce((sum, m) => sum + m.revenue, 0) || 0

  return (
    <Card>
      <CardHeader>
        <CardTitle>Revenus (6 derniers mois)</CardTitle>
        <p className="text-2xl font-bold">{totalRevenue.toFixed(2)}€</p>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={monthlyRevenue}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="revenue" fill="#3b82f6" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
```

---

### 4.5 Actions rapides

**Renouvellement automatique** (`_components/RenewButton.tsx`)

```typescript
'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { addMonths } from 'date-fns'

export function RenewButton({ subscription }: { subscription: any }) {
  const supabase = createClient()
  const queryClient = useQueryClient()

  const renewSubscription = useMutation({
    mutationFn: async () => {
      const newStartDate = new Date(subscription.end_date)
      newStartDate.setDate(newStartDate.getDate() + 1)

      const duration = subscription.type === 'monthly' ? 1 : subscription.type === 'quarterly' ? 3 : 12
      const newEndDate = addMonths(newStartDate, duration)

      await supabase.from('subscriptions').insert([
        {
          user_id: subscription.user_id,
          type: subscription.type,
          start_date: newStartDate.toISOString().split('T')[0],
          end_date: newEndDate.toISOString().split('T')[0],
          price: subscription.price,
          payment_status: 'pending',
          initial_sessions: subscription.type === 'session_pack' ? subscription.initial_sessions : null,
          remaining_sessions: subscription.type === 'session_pack' ? subscription.initial_sessions : null,
        },
      ])
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscriptions'] })
    },
  })

  return (
    <Button
      onClick={() => renewSubscription.mutate()}
      disabled={renewSubscription.isPending}
    >
      Renouveler
    </Button>
  )
}
```

---

## ✅ Checklist Phase 4

- [ ] Liste des abonnements avec filtres
- [ ] Formulaire création/édition abonnement
- [ ] Calcul automatique date fin
- [ ] Gestion packs de séances
- [ ] Alertes d'expiration
- [ ] Widget d'alertes dashboard
- [ ] Statistiques revenus (graphique)
- [ ] Bouton renouvellement rapide
- [ ] Export CSV abonnements
- [ ] Historique paiements

---

## 🚀 Résultat attendu

À la fin de la Phase 4 :
- CRUD complet sur les abonnements
- Suivi des paiements
- Alertes proactives
- Statistiques financières (admin)
- Renouvellements simplifiés

**Prochaine étape** : [Phase 5 - Badges](./phase-5-badges.md)
