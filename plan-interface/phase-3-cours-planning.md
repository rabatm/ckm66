# Phase 3 : Cours & Planning (Semaine 5-6)

## 🎯 Objectifs

Créer le système complet de gestion des cours, génération d'instances et gestion des réservations.

---

## 📋 Tâches

### 3.1 Module Cours - Liste

**Structure**
```
app/(dashboard)/courses/
├── page.tsx                    # Liste des cours
├── [id]/
│   └── page.tsx               # Détail cours
├── new/
│   └── page.tsx               # Créer cours
└── _components/
    ├── CoursesList.tsx
    ├── CourseForm.tsx
    ├── CourseCalendar.tsx
    └── InstanceManager.tsx
```

**Liste des cours** (`page.tsx`)
```typescript
'use client'

import { useQuery } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import Link from 'next/link'

export default function CoursesPage() {
  const supabase = createClient()

  const { data: courses } = useQuery({
    queryKey: ['courses'],
    queryFn: async () => {
      const { data } = await supabase
        .from('courses')
        .select(`
          *,
          instructor:profiles!instructor_id(first_name, last_name),
          backup_instructor:profiles!backup_instructor_id(first_name, last_name)
        `)
        .eq('is_active', true)
        .order('day_of_week')

      return data
    },
  })

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Cours</h1>
        <Link href="/courses/new">
          <Button>Créer un cours</Button>
        </Link>
      </div>

      <div className="grid gap-4">
        {courses?.map((course) => (
          <Card key={course.id} className="p-6">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <h3 className="text-xl font-semibold">{course.name}</h3>
                <p className="text-gray-500">{course.description}</p>

                <div className="mt-4 flex gap-6 text-sm">
                  <div>
                    <span className="text-gray-500">Jour:</span>{' '}
                    <span className="font-medium">{getDayName(course.day_of_week)}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Horaire:</span>{' '}
                    <span className="font-medium">
                      {course.start_time} - {course.end_time}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-500">Capacité:</span>{' '}
                    <span className="font-medium">{course.max_capacity}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Instructeur:</span>{' '}
                    <span className="font-medium">
                      {course.instructor?.first_name} {course.instructor?.last_name}
                    </span>
                  </div>
                </div>
              </div>

              <Link href={`/courses/${course.id}`}>
                <Button variant="outline">Détails</Button>
              </Link>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}

function getDayName(day: number) {
  const days = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi']
  return days[day]
}
```

---

### 3.2 Module Cours - Formulaire

**Créer/Éditer cours** (`_components/CourseForm.tsx`)

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
import { useQuery } from '@tanstack/react-query'

const courseSchema = z.object({
  name: z.string().min(3),
  description: z.string().optional(),
  level: z.enum(['beginner', 'intermediate', 'advanced', 'all']),
  day_of_week: z.coerce.number().min(0).max(6),
  start_time: z.string(),
  end_time: z.string(),
  duration_minutes: z.coerce.number(),
  max_capacity: z.coerce.number(),
  location: z.string(),
  instructor_id: z.string().uuid(),
  backup_instructor_id: z.string().uuid().optional(),
  is_recurring: z.boolean(),
})

type CourseFormData = z.infer<typeof courseSchema>

export function CourseForm({ course }: { course?: any }) {
  const router = useRouter()
  const supabase = createClient()

  // Fetch instructors
  const { data: instructors } = useQuery({
    queryKey: ['instructors'],
    queryFn: async () => {
      const { data } = await supabase
        .from('profiles')
        .select('id, first_name, last_name')
        .eq('role', 'instructor')

      return data
    },
  })

  const form = useForm<CourseFormData>({
    resolver: zodResolver(courseSchema),
    defaultValues: course || {
      level: 'all',
      is_recurring: true,
      max_capacity: 20,
    },
  })

  const onSubmit = async (data: CourseFormData) => {
    const recurrencePattern = {
      days: [data.day_of_week],
      frequency: 'weekly',
    }

    const courseData = {
      ...data,
      recurrence_pattern: recurrencePattern,
      recurrence_start: new Date().toISOString().split('T')[0],
    }

    if (course) {
      await supabase
        .from('courses')
        .update(courseData)
        .eq('id', course.id)
    } else {
      const { data: newCourse } = await supabase
        .from('courses')
        .insert([courseData])
        .select()
        .single()

      // Générer les instances pour les 4 prochaines semaines
      if (newCourse) {
        await supabase.rpc('generate_course_instances', {
          p_course_id: newCourse.id,
          p_weeks_ahead: 4,
        })
      }
    }

    router.push('/courses')
    router.refresh()
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 max-w-2xl">
      <div>
        <label className="block text-sm font-medium mb-2">Nom du cours</label>
        <Input {...form.register('name')} placeholder="Krav Maga Débutants" />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Description</label>
        <Textarea {...form.register('description')} rows={3} />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-2">Niveau</label>
          <select {...form.register('level')} className="w-full px-3 py-2 border rounded">
            <option value="all">Tous niveaux</option>
            <option value="beginner">Débutant</option>
            <option value="intermediate">Intermédiaire</option>
            <option value="advanced">Avancé</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Jour de la semaine</label>
          <select {...form.register('day_of_week')} className="w-full px-3 py-2 border rounded">
            <option value="1">Lundi</option>
            <option value="2">Mardi</option>
            <option value="3">Mercredi</option>
            <option value="4">Jeudi</option>
            <option value="5">Vendredi</option>
            <option value="6">Samedi</option>
            <option value="0">Dimanche</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium mb-2">Heure début</label>
          <Input {...form.register('start_time')} type="time" />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Heure fin</label>
          <Input {...form.register('end_time')} type="time" />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Durée (min)</label>
          <Input {...form.register('duration_minutes')} type="number" />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-2">Capacité max</label>
          <Input {...form.register('max_capacity')} type="number" />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Lieu</label>
          <Input {...form.register('location')} placeholder="Salle principale" />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-2">Instructeur principal</label>
          <select {...form.register('instructor_id')} className="w-full px-3 py-2 border rounded">
            <option value="">Sélectionner un instructeur</option>
            {instructors?.map((instructor) => (
              <option key={instructor.id} value={instructor.id}>
                {instructor.first_name} {instructor.last_name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Instructeur de secours</label>
          <select {...form.register('backup_instructor_id')} className="w-full px-3 py-2 border rounded">
            <option value="">Aucun</option>
            {instructors?.map((instructor) => (
              <option key={instructor.id} value={instructor.id}>
                {instructor.first_name} {instructor.last_name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <Button type="submit">
        {course ? 'Mettre à jour' : 'Créer le cours'}
      </Button>
    </form>
  )
}
```

---

### 3.3 Calendrier des cours

**Vue calendrier** (`_components/CourseCalendar.tsx`)

```typescript
'use client'

import { useQuery } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { addDays, startOfWeek, format } from 'date-fns'
import { fr } from 'date-fns/locale'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useState } from 'react'

export function CourseCalendar() {
  const [currentWeek, setCurrentWeek] = useState(new Date())
  const supabase = createClient()

  const weekStart = startOfWeek(currentWeek, { weekStartsOn: 1 })
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i))

  const { data: instances } = useQuery({
    queryKey: ['course-instances', format(weekStart, 'yyyy-MM-dd')],
    queryFn: async () => {
      const endDate = addDays(weekStart, 7)

      const { data } = await supabase
        .from('course_instances')
        .select(`
          *,
          course:courses(name, level),
          instructor:profiles!instructor_id(first_name, last_name)
        `)
        .gte('instance_date', format(weekStart, 'yyyy-MM-dd'))
        .lt('instance_date', format(endDate, 'yyyy-MM-dd'))
        .eq('status', 'scheduled')
        .order('start_time')

      return data
    },
  })

  const getInstancesForDay = (day: Date) => {
    const dayStr = format(day, 'yyyy-MM-dd')
    return instances?.filter((i) => i.instance_date === dayStr) || []
  }

  return (
    <div className="space-y-4">
      {/* Navigation semaine */}
      <div className="flex justify-between items-center">
        <Button
          variant="outline"
          onClick={() => setCurrentWeek(addDays(currentWeek, -7))}
        >
          ← Semaine précédente
        </Button>

        <h2 className="text-xl font-semibold">
          Semaine du {format(weekStart, 'd MMMM yyyy', { locale: fr })}
        </h2>

        <Button
          variant="outline"
          onClick={() => setCurrentWeek(addDays(currentWeek, 7))}
        >
          Semaine suivante →
        </Button>
      </div>

      {/* Grille calendrier */}
      <div className="grid grid-cols-7 gap-4">
        {weekDays.map((day) => (
          <div key={day.toString()}>
            <div className="text-center font-medium mb-2">
              {format(day, 'EEEE', { locale: fr })}
              <div className="text-sm text-gray-500">
                {format(day, 'd MMM', { locale: fr })}
              </div>
            </div>

            <div className="space-y-2">
              {getInstancesForDay(day).map((instance) => (
                <Card
                  key={instance.id}
                  className="p-3 hover:shadow-md transition cursor-pointer"
                >
                  <div className="text-sm font-medium">{instance.course.name}</div>
                  <div className="text-xs text-gray-500 mt-1">
                    {instance.start_time} - {instance.end_time}
                  </div>
                  <div className="text-xs mt-1">
                    {instance.current_reservations}/{instance.max_capacity} places
                  </div>
                  <div className="text-xs text-gray-500">
                    {instance.instructor?.first_name} {instance.instructor?.last_name}
                  </div>
                </Card>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
```

---

### 3.4 Gestion des instances

**Manager d'instances** (`_components/InstanceManager.tsx`)

Permet de :
- Voir les instances générées
- Annuler une instance
- Modifier instructeur d'une instance
- Créer une instance exceptionnelle

```typescript
'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { useState } from 'react'

export function InstanceManager({ courseId }: { courseId: string }) {
  const supabase = createClient()
  const queryClient = useQueryClient()
  const [cancelDialog, setCancelDialog] = useState<string | null>(null)

  const { data: instances } = useQuery({
    queryKey: ['course-instances', courseId],
    queryFn: async () => {
      const { data } = await supabase
        .from('course_instances')
        .select('*')
        .eq('course_id', courseId)
        .gte('instance_date', new Date().toISOString().split('T')[0])
        .order('instance_date')
        .limit(20)

      return data
    },
  })

  const cancelInstance = useMutation({
    mutationFn: async ({ instanceId, reason }: { instanceId: string; reason: string }) => {
      await supabase
        .from('course_instances')
        .update({
          status: 'cancelled',
          cancellation_reason: reason,
        })
        .eq('id', instanceId)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['course-instances', courseId] })
      setCancelDialog(null)
    },
  })

  const generateMoreInstances = useMutation({
    mutationFn: async () => {
      await supabase.rpc('generate_course_instances', {
        p_course_id: courseId,
        p_weeks_ahead: 4,
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['course-instances', courseId] })
    },
  })

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-semibold">Instances à venir</h3>
        <Button onClick={() => generateMoreInstances.mutate()}>
          Générer plus d'instances
        </Button>
      </div>

      <div className="space-y-2">
        {instances?.map((instance) => (
          <Card key={instance.id} className="p-4">
            <div className="flex justify-between items-center">
              <div>
                <p className="font-medium">
                  {new Date(instance.instance_date).toLocaleDateString('fr-FR', {
                    weekday: 'long',
                    day: 'numeric',
                    month: 'long',
                  })}
                </p>
                <p className="text-sm text-gray-500">
                  {instance.start_time} - {instance.end_time}
                </p>
                <p className="text-sm">
                  {instance.current_reservations}/{instance.max_capacity} réservations
                </p>
                {instance.status === 'cancelled' && (
                  <p className="text-red-500 text-sm">
                    Annulé : {instance.cancellation_reason}
                  </p>
                )}
              </div>

              {instance.status !== 'cancelled' && (
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => setCancelDialog(instance.id)}
                >
                  Annuler
                </Button>
              )}
            </div>
          </Card>
        ))}
      </div>

      {/* Dialog annulation */}
      {cancelDialog && (
        <Dialog open={!!cancelDialog} onOpenChange={() => setCancelDialog(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Annuler l'instance</DialogTitle>
            </DialogHeader>

            <div className="space-y-4">
              <Input
                placeholder="Raison de l'annulation"
                onChange={(e) => {
                  // Store reason
                }}
              />

              <Button
                onClick={() =>
                  cancelInstance.mutate({
                    instanceId: cancelDialog,
                    reason: 'Raison ici',
                  })
                }
              >
                Confirmer l'annulation
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
```

---

### 3.5 Module Réservations

**Structure**
```
app/(dashboard)/reservations/
├── page.tsx                    # Liste réservations
└── _components/
    ├── ReservationsList.tsx
    └── WaitingListManager.tsx
```

**Liste réservations** (`page.tsx`)
```typescript
'use client'

import { useQuery } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export default function ReservationsPage() {
  const supabase = createClient()

  const { data: reservations } = useQuery({
    queryKey: ['reservations'],
    queryFn: async () => {
      const { data } = await supabase
        .from('reservations')
        .select(`
          *,
          user:profiles!user_id(first_name, last_name, email),
          instance:course_instances!course_instance_id(
            instance_date,
            start_time,
            course:courses(name)
          )
        `)
        .order('created_at', { ascending: false })
        .limit(50)

      return data
    },
  })

  const getStatusBadge = (status: string) => {
    const variants: Record<string, any> = {
      confirmed: 'default',
      waiting_list: 'secondary',
      cancelled: 'destructive',
    }

    return <Badge variant={variants[status] || 'default'}>{status}</Badge>
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Réservations</h1>

      <div className="space-y-4">
        {reservations?.map((reservation) => (
          <Card key={reservation.id} className="p-4">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <p className="font-medium">
                  {reservation.user?.first_name} {reservation.user?.last_name}
                </p>
                <p className="text-sm text-gray-500">{reservation.user?.email}</p>

                <div className="mt-2">
                  <p className="text-sm">{reservation.instance?.course?.name}</p>
                  <p className="text-sm text-gray-500">
                    {new Date(reservation.instance?.instance_date).toLocaleDateString('fr-FR')} à{' '}
                    {reservation.instance?.start_time}
                  </p>
                </div>
              </div>

              <div className="text-right">
                {getStatusBadge(reservation.status)}
                {reservation.status === 'waiting_list' && (
                  <p className="text-sm text-gray-500 mt-1">
                    Position: {reservation.waiting_list_position}
                  </p>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}
```

---

## ✅ Checklist Phase 3

- [ ] Liste des cours récurrents
- [ ] Formulaire création/édition cours
- [ ] Génération automatique d'instances
- [ ] Calendrier hebdomadaire
- [ ] Gestion des instances (annulation, modification)
- [ ] Liste des réservations
- [ ] Gestion liste d'attente
- [ ] Filtres par date/cours/statut
- [ ] Export CSV des réservations

---

## 🚀 Résultat attendu

À la fin de la Phase 3 :
- CRUD complet sur les cours
- Système d'instances fonctionnel
- Calendrier visuel
- Gestion complète des réservations

**Prochaine étape** : [Phase 4 - Abonnements](./phase-4-abonnements.md)
