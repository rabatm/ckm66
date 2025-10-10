# Phase 6 : Présences & Analytics (Semaine 9)

## 🎯 Objectifs

Implémenter la gestion des présences et les tableaux de bord analytiques avancés.

---

## 📋 Tâches

### 6.1 Module Présences

**Structure**
```
app/(dashboard)/attendance/
├── page.tsx                    # Liste des cours pour prise de présence
├── [instanceId]/
│   └── page.tsx               # Prise de présence d'un cours
└── _components/
    ├── AttendanceSheet.tsx
    ├── AttendanceHistory.tsx
    └── AttendanceStats.tsx
```

**Liste des cours du jour** (`page.tsx`)

```typescript
'use client'

import { useQuery } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import { useState } from 'react'

export default function AttendancePage() {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])
  const supabase = createClient()

  const { data: instances } = useQuery({
    queryKey: ['attendance-instances', selectedDate],
    queryFn: async () => {
      const { data } = await supabase
        .from('course_instances')
        .select(`
          *,
          course:courses(name, level),
          instructor:profiles!instructor_id(first_name, last_name),
          reservations(count)
        `)
        .eq('instance_date', selectedDate)
        .eq('status', 'scheduled')
        .order('start_time')

      return data
    },
  })

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Gestion des présences</h1>

        <input
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          className="px-3 py-2 border rounded"
        />
      </div>

      {instances && instances.length === 0 ? (
        <Card className="p-6">
          <p className="text-gray-500 text-center">Aucun cours prévu ce jour</p>
        </Card>
      ) : (
        <div className="space-y-4">
          {instances?.map((instance) => (
            <Card key={instance.id} className="p-6">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h3 className="text-xl font-semibold">{instance.course.name}</h3>
                  <p className="text-gray-500 mt-1">
                    {instance.start_time} - {instance.end_time} • {instance.location}
                  </p>
                  <p className="text-sm text-gray-600 mt-2">
                    Instructeur: {instance.instructor?.first_name}{' '}
                    {instance.instructor?.last_name}
                  </p>
                  <p className="text-sm mt-1">
                    {instance.current_reservations} participant(s) inscrit(s)
                  </p>
                </div>

                <Link href={`/attendance/${instance.id}`}>
                  <Button>Prendre les présences</Button>
                </Link>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
```

---

### 6.2 Feuille de présence

**Prise de présence** (`[instanceId]/page.tsx`)

```typescript
'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Textarea } from '@/components/ui/textarea'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function AttendanceSheetPage({ params }: { params: { instanceId: string } }) {
  const supabase = createClient()
  const queryClient = useQueryClient()
  const router = useRouter()

  const [attendanceData, setAttendanceData] = useState<Record<string, { attended: boolean; notes: string }>>({})

  // Fetch instance details
  const { data: instance } = useQuery({
    queryKey: ['course-instance', params.instanceId],
    queryFn: async () => {
      const { data } = await supabase
        .from('course_instances')
        .select(`
          *,
          course:courses(name, level)
        `)
        .eq('id', params.instanceId)
        .single()

      return data
    },
  })

  // Fetch reservations
  const { data: reservations } = useQuery({
    queryKey: ['instance-reservations', params.instanceId],
    queryFn: async () => {
      const { data } = await supabase
        .from('reservations')
        .select(`
          *,
          user:profiles!user_id(
            id,
            first_name,
            last_name,
            email
          )
        `)
        .eq('course_instance_id', params.instanceId)
        .eq('status', 'confirmed')
        .order('user(last_name)')

      return data
    },
  })

  // Fetch existing attendance
  const { data: existingAttendance } = useQuery({
    queryKey: ['existing-attendance', params.instanceId],
    queryFn: async () => {
      const { data } = await supabase
        .from('attendance')
        .select('*')
        .eq('course_id', instance?.course_id)
        .eq('attendance_date', instance?.instance_date)

      return data
    },
    enabled: !!instance,
  })

  // Initialize attendance data
  useState(() => {
    if (existingAttendance && existingAttendance.length > 0) {
      const initialData: Record<string, { attended: boolean; notes: string }> = {}
      existingAttendance.forEach((att) => {
        initialData[att.user_id] = {
          attended: att.attended,
          notes: att.notes || '',
        }
      })
      setAttendanceData(initialData)
    }
  })

  const saveAttendance = useMutation({
    mutationFn: async () => {
      const attendanceRecords = reservations?.map((reservation) => ({
        user_id: reservation.user_id,
        course_id: instance?.course_id,
        reservation_id: reservation.id,
        attendance_date: instance?.instance_date,
        attended: attendanceData[reservation.user_id]?.attended || false,
        notes: attendanceData[reservation.user_id]?.notes || null,
      }))

      // Delete existing attendance
      await supabase
        .from('attendance')
        .delete()
        .eq('course_id', instance?.course_id)
        .eq('attendance_date', instance?.instance_date)

      // Insert new attendance
      await supabase.from('attendance').insert(attendanceRecords || [])
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['existing-attendance'] })
      router.push('/attendance')
    },
  })

  const handleToggle = (userId: string, attended: boolean) => {
    setAttendanceData((prev) => ({
      ...prev,
      [userId]: {
        ...prev[userId],
        attended,
      },
    }))
  }

  const handleNotes = (userId: string, notes: string) => {
    setAttendanceData((prev) => ({
      ...prev,
      [userId]: {
        ...prev[userId],
        notes,
      },
    }))
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">{instance?.course.name}</h1>
        <p className="text-gray-500 mt-1">
          {instance?.instance_date} • {instance?.start_time} - {instance?.end_time}
        </p>
      </div>

      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Liste de présence</h2>

        <div className="space-y-4">
          {reservations?.map((reservation) => (
            <div key={reservation.id} className="flex items-start gap-4 p-4 border rounded">
              <Checkbox
                checked={attendanceData[reservation.user_id]?.attended || false}
                onCheckedChange={(checked) => handleToggle(reservation.user_id, checked as boolean)}
              />

              <div className="flex-1">
                <p className="font-medium">
                  {reservation.user?.first_name} {reservation.user?.last_name}
                </p>
                <p className="text-sm text-gray-500">{reservation.user?.email}</p>

                <Textarea
                  placeholder="Notes (optionnel)"
                  value={attendanceData[reservation.user_id]?.notes || ''}
                  onChange={(e) => handleNotes(reservation.user_id, e.target.value)}
                  rows={2}
                  className="mt-2"
                />
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 flex gap-3">
          <Button onClick={() => saveAttendance.mutate()} disabled={saveAttendance.isPending}>
            Enregistrer les présences
          </Button>

          <Button variant="outline" onClick={() => router.back()}>
            Annuler
          </Button>
        </div>
      </Card>
    </div>
  )
}
```

---

### 6.3 Historique des présences

**Composant historique** (`_components/AttendanceHistory.tsx`)

```typescript
'use client'

import { useQuery } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export function AttendanceHistory({ userId }: { userId: string }) {
  const supabase = createClient()

  const { data: attendance } = useQuery({
    queryKey: ['user-attendance', userId],
    queryFn: async () => {
      const { data } = await supabase
        .from('attendance')
        .select(`
          *,
          course:courses(name)
        `)
        .eq('user_id', userId)
        .order('attendance_date', { ascending: false })
        .limit(20)

      return data
    },
  })

  const attendanceRate =
    attendance && attendance.length > 0
      ? (attendance.filter((a) => a.attended).length / attendance.length) * 100
      : 0

  return (
    <Card className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-semibold">Historique de présence</h3>
        <Badge variant={attendanceRate >= 80 ? 'default' : 'secondary'}>
          {attendanceRate.toFixed(0)}% de présence
        </Badge>
      </div>

      <div className="space-y-2">
        {attendance?.map((record) => (
          <div
            key={record.id}
            className="flex justify-between items-center p-3 border rounded"
          >
            <div>
              <p className="font-medium">{record.course?.name}</p>
              <p className="text-sm text-gray-500">
                {new Date(record.attendance_date).toLocaleDateString('fr-FR')}
              </p>
              {record.notes && <p className="text-sm text-gray-600 mt-1">{record.notes}</p>}
            </div>

            {record.attended ? (
              <Badge variant="default">✓ Présent</Badge>
            ) : (
              <Badge variant="destructive">✗ Absent</Badge>
            )}
          </div>
        ))}
      </div>
    </Card>
  )
}
```

---

### 6.4 Analytics Admin

**Structure**
```
app/(dashboard)/analytics/
├── page.tsx                    # Dashboard analytics
└── _components/
    ├── MembershipGrowth.tsx
    ├── CourseAttendance.tsx
    ├── RevenueChart.tsx
    └── TopPerformers.tsx
```

**Dashboard Analytics** (`page.tsx`)

```typescript
'use client'

import { useQuery } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from 'recharts'
import { subMonths, format, startOfMonth, endOfMonth } from 'date-fns'
import { fr } from 'date-fns/locale'

export default function AnalyticsPage() {
  const supabase = createClient()

  // Growth chart data
  const { data: membershipGrowth } = useQuery({
    queryKey: ['membership-growth'],
    queryFn: async () => {
      const last6Months = Array.from({ length: 6 }, (_, i) => {
        const date = subMonths(new Date(), 5 - i)
        return {
          month: format(date, 'MMM yyyy', { locale: fr }),
          start: startOfMonth(date),
          end: endOfMonth(date),
        }
      })

      const growthData = await Promise.all(
        last6Months.map(async ({ month, end }) => {
          const { count } = await supabase
            .from('profiles')
            .select('*', { count: 'exact', head: true })
            .eq('role', 'member')
            .lte('created_at', end.toISOString())

          return {
            month,
            members: count || 0,
          }
        })
      )

      return growthData
    },
  })

  // Course attendance stats
  const { data: courseStats } = useQuery({
    queryKey: ['course-attendance-stats'],
    queryFn: async () => {
      const { data: courses } = await supabase
        .from('courses')
        .select('id, name')
        .eq('is_active', true)

      const statsData = await Promise.all(
        courses?.map(async (course) => {
          const { data: instances } = await supabase
            .from('course_instances')
            .select('current_reservations, max_capacity')
            .eq('course_id', course.id)
            .eq('status', 'completed')

          const avgFillRate =
            instances && instances.length > 0
              ? instances.reduce(
                  (sum, i) => sum + (i.current_reservations / i.max_capacity) * 100,
                  0
                ) / instances.length
              : 0

          return {
            courseName: course.name,
            fillRate: Math.round(avgFillRate),
          }
        }) || []
      )

      return statsData
    },
  })

  // Top performers
  const { data: topPerformers } = useQuery({
    queryKey: ['top-performers'],
    queryFn: async () => {
      const { data } = await supabase
        .from('profiles')
        .select('first_name, last_name, total_points, current_level')
        .eq('role', 'member')
        .order('total_points', { ascending: false })
        .limit(10)

      return data
    },
  })

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Analytics</h1>

      {/* Membership Growth */}
      <Card>
        <CardHeader>
          <CardTitle>Croissance des membres</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={membershipGrowth}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Area type="monotone" dataKey="members" stroke="#3b82f6" fill="#93c5fd" />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Course Fill Rates */}
      <Card>
        <CardHeader>
          <CardTitle>Taux de remplissage par cours</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={courseStats}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="courseName" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="fillRate" fill="#10b981" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Top Performers */}
      <Card>
        <CardHeader>
          <CardTitle>Top 10 membres (points)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {topPerformers?.map((member, index) => (
              <div
                key={index}
                className="flex justify-between items-center p-3 border rounded"
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl font-bold text-gray-400">#{index + 1}</span>
                  <div>
                    <p className="font-medium">
                      {member.first_name} {member.last_name}
                    </p>
                    <p className="text-sm text-gray-500">Niveau {member.current_level}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xl font-bold text-blue-600">{member.total_points}</p>
                  <p className="text-xs text-gray-500">points</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
```

---

### 6.5 Export CSV

**Utilitaire export** (`lib/export-csv.ts`)

```typescript
export function exportToCSV(data: any[], filename: string) {
  if (!data || data.length === 0) return

  const headers = Object.keys(data[0])
  const csvContent = [
    headers.join(','),
    ...data.map((row) =>
      headers.map((header) => JSON.stringify(row[header] || '')).join(',')
    ),
  ].join('\n')

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  const url = URL.createObjectURL(blob)

  link.setAttribute('href', url)
  link.setAttribute('download', filename)
  link.style.visibility = 'hidden'

  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}
```

**Bouton export**
```typescript
<Button onClick={() => exportToCSV(attendanceData, 'presences.csv')}>
  Exporter CSV
</Button>
```

---

## ✅ Checklist Phase 6

- [ ] Liste des cours pour prise de présence
- [ ] Feuille de présence interactive
- [ ] Enregistrement présences/absences
- [ ] Notes par participant
- [ ] Historique de présence par membre
- [ ] Calcul taux de présence
- [ ] Dashboard analytics (admin)
- [ ] Graphique croissance membres
- [ ] Stats taux de remplissage cours
- [ ] Top performers
- [ ] Export CSV présences

---

## 🚀 Résultat attendu

À la fin de la Phase 6 :
- Système de présences complet
- Historiques détaillés
- Analytics puissants pour l'admin
- Exports de données

**Prochaine étape** : [Phase 7 - Optimisations](./phase-7-optimisations.md)
