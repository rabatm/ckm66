# 📱 Cours CKM66 - Guide pour l'Application Mobile

## 📚 Table des Matières
1. [Vue d'ensemble](#vue-densemble)
2. [Architecture de la base de données](#architecture-de-la-base-de-données)
3. [Types de cours](#types-de-cours)
4. [Système de réservation](#système-de-réservation)
5. [API et Requêtes](#api-et-requêtes)
6. [Cas d'usage Mobile](#cas-dusage-mobile)
7. [Exemples de code](#exemples-de-code)

---

## 🎯 Vue d'ensemble

Le système de cours CKM66 gère **deux types de cours** :

### 1️⃣ **Cours Réguliers** (Récurrents)
- Cours planifiés de manière récurrente (ex: tous les lundis à 19h)
- Génèrent automatiquement des **instances** chaque semaine
- Exemple: "Krav Maga Adultes - Lundi 19h"

### 2️⃣ **Cours Ponctuels** (Exceptionnels / One-time)
- Événements uniques, non récurrents
- Créés manuellement pour une date/heure spécifique
- Exemple: "Stage intensif weekend", "Cours de rattrapage", "Événement spécial"

---

## 🗄️ Architecture de la Base de Données

### Table 1: `courses` (Cours Réguliers)

**Description**: Définit les cours récurrents et leurs horaires hebdomadaires.

```sql
CREATE TABLE courses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Informations de base
  name VARCHAR(255) NOT NULL,
  description TEXT,
  course_type VARCHAR(50) DEFAULT 'regular', -- 'regular' ou 'one_time'

  -- Planification (pour cours réguliers uniquement)
  day_of_week INTEGER,  -- 0=Dimanche, 1=Lundi, ..., 6=Samedi (NULL pour ponctuel)
  start_time TIME,      -- Heure de début (NULL pour ponctuel)
  end_time TIME,        -- Heure de fin (NULL pour ponctuel)

  -- Capacité
  max_participants INTEGER DEFAULT 20,

  -- Instructeur
  instructor_id UUID REFERENCES profiles(id),

  -- Statut
  is_active BOOLEAN DEFAULT true,

  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

**Champs clés** :
- `course_type`:
  - `'regular'` = cours récurrent hebdomadaire
  - `'one_time'` = cours ponctuel (cette valeur existe mais on utilise plutôt `course_instances` direct)
- `day_of_week`: Jour de la semaine (NULL si ponctuel)
- `start_time` / `end_time`: Horaires (NULL si ponctuel)

**Index recommandés** :
```sql
CREATE INDEX idx_courses_active ON courses(is_active);
CREATE INDEX idx_courses_instructor ON courses(instructor_id);
CREATE INDEX idx_courses_day ON courses(day_of_week) WHERE course_type = 'regular';
```

---

### Table 2: `course_instances` (Instances de Cours)

**Description**: Représente chaque séance concrète (qu'elle soit générée automatiquement ou créée manuellement).

```sql
CREATE TABLE course_instances (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Référence au cours parent (NULL si cours ponctuel)
  course_id UUID REFERENCES courses(id) ON DELETE CASCADE,

  -- Date et heure de la séance
  scheduled_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,

  -- Type d'instance
  is_one_time BOOLEAN DEFAULT false, -- true si cours ponctuel

  -- Informations spécifiques (pour cours ponctuels)
  one_time_title VARCHAR(255),       -- Titre du cours ponctuel
  one_time_description TEXT,         -- Description du cours ponctuel
  one_time_max_participants INTEGER, -- Capacité du cours ponctuel

  -- Statut
  status VARCHAR(50) DEFAULT 'scheduled', -- 'scheduled', 'cancelled', 'completed'

  -- Instructeur (peut overrider celui du cours parent)
  instructor_id UUID REFERENCES profiles(id),

  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

**Champs clés** :
- `course_id`:
  - NOT NULL pour instances de cours réguliers
  - NULL pour cours ponctuels (instances autonomes)
- `is_one_time`: Flag pour identifier les cours ponctuels
- `one_time_*`: Champs utilisés uniquement si `is_one_time = true`
- `status`: Gérer annulations et complétions

**Index recommandés** :
```sql
CREATE INDEX idx_instances_date ON course_instances(scheduled_date);
CREATE INDEX idx_instances_course ON course_instances(course_id);
CREATE INDEX idx_instances_instructor ON course_instances(instructor_id);
CREATE INDEX idx_instances_status ON course_instances(status);
CREATE INDEX idx_instances_one_time ON course_instances(is_one_time);
```

---

### Table 3: `reservations` (Réservations)

**Description**: Gère les inscriptions des membres aux instances de cours.

```sql
CREATE TABLE reservations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Références
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  course_instance_id UUID NOT NULL REFERENCES course_instances(id) ON DELETE CASCADE,

  -- Statut de la réservation
  status VARCHAR(50) DEFAULT 'confirmed', -- 'confirmed', 'cancelled', 'waitlist', 'attended'

  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),

  -- Contrainte unique : un utilisateur ne peut réserver qu'une fois une instance
  UNIQUE(user_id, course_instance_id)
);
```

**Champs clés** :
- `status`:
  - `'confirmed'` = réservation confirmée
  - `'cancelled'` = annulée par le membre
  - `'waitlist'` = liste d'attente (si cours complet)
  - `'attended'` = le membre a assisté (marqué après le cours)

**Index recommandés** :
```sql
CREATE INDEX idx_reservations_user ON reservations(user_id);
CREATE INDEX idx_reservations_instance ON reservations(course_instance_id);
CREATE INDEX idx_reservations_status ON reservations(status);
```

---

## 📋 Types de Cours

### 🔁 Cours Réguliers (Récurrents)

#### Caractéristiques
- Planifiés pour un jour/heure fixe chaque semaine
- Génèrent automatiquement des instances chaque semaine
- Un seul enregistrement dans `courses`, plusieurs dans `course_instances`

#### Exemple
```sql
-- Cours régulier: Krav Maga Adultes - Lundi 19h
INSERT INTO courses (
  name,
  description,
  course_type,
  day_of_week,  -- 1 = Lundi
  start_time,
  end_time,
  max_participants,
  instructor_id,
  is_active
) VALUES (
  'Krav Maga Adultes',
  'Cours de Krav Maga niveau débutant à avancé',
  'regular',
  1,  -- Lundi
  '19:00:00',
  '20:30:00',
  25,
  'instructor-uuid-here',
  true
);
```

#### Génération automatique d'instances
- L'admin génère les instances pour les 2-4 prochaines semaines
- Chaque lundi, une nouvelle instance est créée :

```sql
-- Instance générée automatiquement pour le 13 janvier 2025
INSERT INTO course_instances (
  course_id,           -- UUID du cours parent
  scheduled_date,
  start_time,
  end_time,
  is_one_time,
  instructor_id,
  status
) VALUES (
  'course-uuid-here',
  '2025-01-13',        -- Lundi prochain
  '19:00:00',
  '20:30:00',
  false,               -- Pas un cours ponctuel
  'instructor-uuid-here',
  'scheduled'
);
```

---

### ⚡ Cours Ponctuels (One-time)

#### Caractéristiques
- Événements uniques, non récurrents
- Créés directement comme `course_instances` (sans cours parent)
- Peuvent avoir leur propre titre, description, capacité

#### Exemple
```sql
-- Cours ponctuel: Stage intensif weekend
INSERT INTO course_instances (
  course_id,                    -- NULL (pas de cours parent)
  scheduled_date,
  start_time,
  end_time,
  is_one_time,                  -- true
  one_time_title,
  one_time_description,
  one_time_max_participants,
  instructor_id,
  status
) VALUES (
  NULL,                         -- Pas de cours parent
  '2025-01-25',                 -- Samedi 25 janvier
  '14:00:00',
  '17:00:00',
  true,                         -- Cours ponctuel
  'Stage intensif - Techniques de défense',
  'Stage de 3h pour perfectionner les techniques de défense contre couteau et bâton',
  15,                           -- Capacité limitée
  'instructor-uuid-here',
  'scheduled'
);
```

---

## 🎫 Système de Réservation

### Flux de réservation

#### 1. **Membre consulte les cours disponibles**

L'app mobile affiche :
- Les instances de cours réguliers (générées automatiquement)
- Les cours ponctuels (créés manuellement)

```sql
-- Récupérer toutes les instances disponibles pour la semaine
SELECT
  ci.id,
  ci.scheduled_date,
  ci.start_time,
  ci.end_time,
  ci.status,
  ci.is_one_time,

  -- Si cours régulier, récupérer les infos du cours parent
  CASE
    WHEN ci.is_one_time = false THEN c.name
    ELSE ci.one_time_title
  END as title,

  CASE
    WHEN ci.is_one_time = false THEN c.description
    ELSE ci.one_time_description
  END as description,

  CASE
    WHEN ci.is_one_time = false THEN c.max_participants
    ELSE ci.one_time_max_participants
  END as max_participants,

  -- Instructeur
  p.first_name || ' ' || p.last_name as instructor_name,

  -- Nombre de places prises
  (SELECT COUNT(*) FROM reservations
   WHERE course_instance_id = ci.id
   AND status = 'confirmed') as current_participants

FROM course_instances ci
LEFT JOIN courses c ON ci.course_id = c.id
LEFT JOIN profiles p ON ci.instructor_id = p.id

WHERE ci.scheduled_date >= CURRENT_DATE
  AND ci.scheduled_date <= CURRENT_DATE + INTERVAL '7 days'
  AND ci.status = 'scheduled'

ORDER BY ci.scheduled_date, ci.start_time;
```

#### 2. **Membre réserve un cours**

```sql
-- Vérifier la disponibilité
SELECT
  CASE
    WHEN ci.is_one_time = false THEN c.max_participants
    ELSE ci.one_time_max_participants
  END as max_capacity,
  (SELECT COUNT(*) FROM reservations
   WHERE course_instance_id = :instance_id
   AND status = 'confirmed') as current_count
FROM course_instances ci
LEFT JOIN courses c ON ci.course_id = c.id
WHERE ci.id = :instance_id;

-- Si des places disponibles, créer la réservation
INSERT INTO reservations (
  user_id,
  course_instance_id,
  status
) VALUES (
  :user_id,
  :instance_id,
  'confirmed'
);
```

#### 3. **Membre annule sa réservation**

```sql
UPDATE reservations
SET
  status = 'cancelled',
  updated_at = NOW()
WHERE user_id = :user_id
  AND course_instance_id = :instance_id
  AND status = 'confirmed';
```

---

## 🔌 API et Requêtes

### Endpoints recommandés pour l'app mobile

#### 1. **GET /api/mobile/courses/upcoming**
Récupère tous les cours à venir (réguliers + ponctuels)

**Query params** :
- `from_date` (default: today)
- `to_date` (default: today + 7 days)
- `limit` (default: 50)

**Response** :
```json
{
  "courses": [
    {
      "id": "uuid",
      "type": "regular", // ou "one_time"
      "title": "Krav Maga Adultes",
      "description": "Cours de Krav Maga...",
      "scheduled_date": "2025-01-13",
      "start_time": "19:00:00",
      "end_time": "20:30:00",
      "instructor": {
        "id": "uuid",
        "name": "Jean Dupont"
      },
      "capacity": {
        "max": 25,
        "current": 18,
        "available": 7
      },
      "status": "scheduled",
      "user_reservation": null // ou { "id": "uuid", "status": "confirmed" }
    },
    {
      "id": "uuid",
      "type": "one_time",
      "title": "Stage intensif weekend",
      "description": "Stage de 3h...",
      "scheduled_date": "2025-01-25",
      "start_time": "14:00:00",
      "end_time": "17:00:00",
      "instructor": {
        "id": "uuid",
        "name": "Marie Martin"
      },
      "capacity": {
        "max": 15,
        "current": 8,
        "available": 7
      },
      "status": "scheduled",
      "user_reservation": null
    }
  ]
}
```

---

#### 2. **POST /api/mobile/reservations**
Créer une réservation

**Body** :
```json
{
  "course_instance_id": "uuid",
  "user_id": "uuid"
}
```

**Response** :
```json
{
  "success": true,
  "reservation": {
    "id": "uuid",
    "course_instance_id": "uuid",
    "user_id": "uuid",
    "status": "confirmed",
    "created_at": "2025-01-10T10:30:00Z"
  }
}
```

---

#### 3. **DELETE /api/mobile/reservations/:id**
Annuler une réservation

**Response** :
```json
{
  "success": true,
  "message": "Réservation annulée avec succès"
}
```

---

#### 4. **GET /api/mobile/users/:id/reservations**
Récupère toutes les réservations d'un utilisateur

**Query params** :
- `status` (optional: 'confirmed', 'cancelled', 'attended')
- `from_date` (optional)
- `to_date` (optional)

**Response** :
```json
{
  "reservations": [
    {
      "id": "uuid",
      "status": "confirmed",
      "created_at": "2025-01-10T10:30:00Z",
      "course": {
        "id": "uuid",
        "type": "regular",
        "title": "Krav Maga Adultes",
        "scheduled_date": "2025-01-13",
        "start_time": "19:00:00",
        "end_time": "20:30:00",
        "instructor": "Jean Dupont"
      }
    }
  ]
}
```

---

## 📱 Cas d'usage Mobile

### Cas 1: Vue Calendrier / Planning

**Objectif** : Afficher tous les cours disponibles pour la semaine

**Requête Supabase** :
```typescript
const { data: instances, error } = await supabase
  .from('course_instances')
  .select(`
    id,
    scheduled_date,
    start_time,
    end_time,
    status,
    is_one_time,
    one_time_title,
    one_time_description,
    one_time_max_participants,
    course:courses(
      id,
      name,
      description,
      max_participants
    ),
    instructor:profiles!instructor_id(
      id,
      first_name,
      last_name
    )
  `)
  .gte('scheduled_date', startOfWeek)
  .lte('scheduled_date', endOfWeek)
  .eq('status', 'scheduled')
  .order('scheduled_date', { ascending: true })
  .order('start_time', { ascending: true });
```

**Traitement** :
```typescript
const formattedCourses = instances?.map(instance => ({
  id: instance.id,
  type: instance.is_one_time ? 'one_time' : 'regular',
  title: instance.is_one_time
    ? instance.one_time_title
    : instance.course?.name,
  description: instance.is_one_time
    ? instance.one_time_description
    : instance.course?.description,
  date: instance.scheduled_date,
  startTime: instance.start_time,
  endTime: instance.end_time,
  instructor: `${instance.instructor.first_name} ${instance.instructor.last_name}`,
  maxCapacity: instance.is_one_time
    ? instance.one_time_max_participants
    : instance.course?.max_participants,
}));
```

---

### Cas 2: Réservation d'un cours

**Objectif** : Permettre à un utilisateur de réserver une place

**Étapes** :

1. **Vérifier la disponibilité** :
```typescript
const { data: instance } = await supabase
  .from('course_instances')
  .select(`
    id,
    is_one_time,
    one_time_max_participants,
    course:courses(max_participants),
    reservations:reservations(count)
  `)
  .eq('id', instanceId)
  .eq('reservations.status', 'confirmed')
  .single();

const maxCapacity = instance.is_one_time
  ? instance.one_time_max_participants
  : instance.course.max_participants;

const currentCount = instance.reservations?.length || 0;

if (currentCount >= maxCapacity) {
  throw new Error('Cours complet');
}
```

2. **Créer la réservation** :
```typescript
const { data, error } = await supabase
  .from('reservations')
  .insert({
    user_id: userId,
    course_instance_id: instanceId,
    status: 'confirmed'
  })
  .select()
  .single();

if (error) {
  if (error.code === '23505') { // Unique violation
    throw new Error('Vous avez déjà réservé ce cours');
  }
  throw error;
}
```

---

### Cas 3: Mes Réservations

**Objectif** : Afficher toutes les réservations d'un utilisateur

**Requête** :
```typescript
const { data: reservations, error } = await supabase
  .from('reservations')
  .select(`
    id,
    status,
    created_at,
    course_instance:course_instances(
      id,
      scheduled_date,
      start_time,
      end_time,
      status,
      is_one_time,
      one_time_title,
      course:courses(
        id,
        name
      ),
      instructor:profiles!instructor_id(
        first_name,
        last_name
      )
    )
  `)
  .eq('user_id', userId)
  .eq('status', 'confirmed')
  .gte('course_instance.scheduled_date', new Date().toISOString())
  .order('course_instance.scheduled_date', { ascending: true });
```

---

### Cas 4: Annulation de réservation

**Objectif** : Annuler une réservation existante

**Requête** :
```typescript
// Option 1: Soft delete (changement de statut)
const { error } = await supabase
  .from('reservations')
  .update({
    status: 'cancelled',
    updated_at: new Date().toISOString()
  })
  .eq('id', reservationId)
  .eq('user_id', userId) // Sécurité: vérifier que c'est bien l'utilisateur
  .eq('status', 'confirmed'); // Ne peut annuler que les confirmées

// Option 2: Hard delete
const { error } = await supabase
  .from('reservations')
  .delete()
  .eq('id', reservationId)
  .eq('user_id', userId);
```

---

## 💻 Exemples de code

### React Native / Expo

#### Hook personnalisé pour les cours à venir

```typescript
// hooks/useCourses.ts
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { startOfWeek, endOfWeek, format } from 'date-fns';

interface CourseInstance {
  id: string;
  type: 'regular' | 'one_time';
  title: string;
  description: string;
  date: string;
  startTime: string;
  endTime: string;
  instructor: string;
  capacity: {
    max: number;
    current: number;
    available: number;
  };
  userReservation?: {
    id: string;
    status: string;
  };
}

export function useUpcomingCourses(userId?: string) {
  return useQuery({
    queryKey: ['courses', 'upcoming', userId],
    queryFn: async () => {
      const today = new Date();
      const weekStart = format(startOfWeek(today, { weekStartsOn: 1 }), 'yyyy-MM-dd');
      const weekEnd = format(endOfWeek(today, { weekStartsOn: 1 }), 'yyyy-MM-dd');

      // Récupérer les instances
      const { data: instances, error } = await supabase
        .from('course_instances')
        .select(`
          id,
          scheduled_date,
          start_time,
          end_time,
          status,
          is_one_time,
          one_time_title,
          one_time_description,
          one_time_max_participants,
          course:courses(
            id,
            name,
            description,
            max_participants
          ),
          instructor:profiles!instructor_id(
            id,
            first_name,
            last_name
          ),
          reservations:reservations(
            id,
            user_id,
            status
          )
        `)
        .gte('scheduled_date', weekStart)
        .lte('scheduled_date', weekEnd)
        .eq('status', 'scheduled')
        .order('scheduled_date', { ascending: true })
        .order('start_time', { ascending: true });

      if (error) throw error;

      // Formatter les données
      const formatted: CourseInstance[] = instances.map(instance => {
        const confirmedReservations = instance.reservations.filter(
          r => r.status === 'confirmed'
        );

        const maxCapacity = instance.is_one_time
          ? instance.one_time_max_participants
          : instance.course?.max_participants || 20;

        const userReservation = userId
          ? confirmedReservations.find(r => r.user_id === userId)
          : undefined;

        return {
          id: instance.id,
          type: instance.is_one_time ? 'one_time' : 'regular',
          title: instance.is_one_time
            ? instance.one_time_title
            : instance.course?.name || '',
          description: instance.is_one_time
            ? instance.one_time_description || ''
            : instance.course?.description || '',
          date: instance.scheduled_date,
          startTime: instance.start_time,
          endTime: instance.end_time,
          instructor: `${instance.instructor.first_name} ${instance.instructor.last_name}`,
          capacity: {
            max: maxCapacity,
            current: confirmedReservations.length,
            available: maxCapacity - confirmedReservations.length,
          },
          userReservation: userReservation ? {
            id: userReservation.id,
            status: userReservation.status,
          } : undefined,
        };
      });

      return formatted;
    },
  });
}
```

---

#### Composant de carte de cours

```typescript
// components/CourseCard.tsx
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { format, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';

interface CourseCardProps {
  course: CourseInstance;
  onBook?: () => void;
  onCancel?: () => void;
}

export function CourseCard({ course, onBook, onCancel }: CourseCardProps) {
  const isBooked = !!course.userReservation;
  const isFull = course.capacity.available === 0;

  const dateObj = parseISO(course.date);
  const dayName = format(dateObj, 'EEEE', { locale: fr });
  const dateFormatted = format(dateObj, 'd MMMM', { locale: fr });

  return (
    <View style={styles.card}>
      {/* Badge type de cours */}
      {course.type === 'one_time' && (
        <View style={styles.badgeContainer}>
          <Text style={styles.badgeText}>⚡ Cours ponctuel</Text>
        </View>
      )}

      {/* En-tête */}
      <View style={styles.header}>
        <Text style={styles.title}>{course.title}</Text>
        <Text style={styles.instructor}>👤 {course.instructor}</Text>
      </View>

      {/* Description */}
      <Text style={styles.description} numberOfLines={2}>
        {course.description}
      </Text>

      {/* Date et heure */}
      <View style={styles.dateTimeRow}>
        <View style={styles.dateTime}>
          <Text style={styles.label}>📅</Text>
          <Text style={styles.value}>
            {dayName} {dateFormatted}
          </Text>
        </View>
        <View style={styles.dateTime}>
          <Text style={styles.label}>🕐</Text>
          <Text style={styles.value}>
            {course.startTime.substring(0, 5)} - {course.endTime.substring(0, 5)}
          </Text>
        </View>
      </View>

      {/* Capacité */}
      <View style={styles.capacityRow}>
        <Text style={styles.capacityText}>
          👥 {course.capacity.current}/{course.capacity.max} places
        </Text>
        {course.capacity.available > 0 && course.capacity.available <= 3 && (
          <Text style={styles.limitedText}>
            ⚠️ Plus que {course.capacity.available} place(s)
          </Text>
        )}
      </View>

      {/* Actions */}
      <View style={styles.actions}>
        {isBooked ? (
          <TouchableOpacity
            style={[styles.button, styles.cancelButton]}
            onPress={onCancel}
          >
            <Text style={styles.cancelButtonText}>Annuler ma réservation</Text>
          </TouchableOpacity>
        ) : isFull ? (
          <View style={[styles.button, styles.fullButton]}>
            <Text style={styles.fullButtonText}>Complet</Text>
          </View>
        ) : (
          <TouchableOpacity
            style={[styles.button, styles.bookButton]}
            onPress={onBook}
          >
            <Text style={styles.bookButtonText}>Réserver</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#1f2533',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#374151',
  },
  badgeContainer: {
    alignSelf: 'flex-start',
    backgroundColor: '#fbbf24',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginBottom: 8,
  },
  badgeText: {
    color: '#000',
    fontSize: 12,
    fontWeight: '600',
  },
  header: {
    marginBottom: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  instructor: {
    fontSize: 14,
    color: '#9ca3af',
  },
  description: {
    fontSize: 14,
    color: '#d1d5db',
    marginBottom: 12,
  },
  dateTimeRow: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 8,
  },
  dateTime: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  label: {
    fontSize: 14,
  },
  value: {
    fontSize: 14,
    color: '#fff',
  },
  capacityRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  capacityText: {
    fontSize: 14,
    color: '#9ca3af',
  },
  limitedText: {
    fontSize: 12,
    color: '#fbbf24',
    fontWeight: '600',
  },
  actions: {
    marginTop: 8,
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  bookButton: {
    backgroundColor: '#ef4444',
  },
  bookButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  cancelButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#6b7280',
  },
  cancelButtonText: {
    color: '#9ca3af',
    fontWeight: '600',
    fontSize: 16,
  },
  fullButton: {
    backgroundColor: '#374151',
  },
  fullButtonText: {
    color: '#6b7280',
    fontWeight: '600',
    fontSize: 16,
  },
});
```

---

#### Hook pour la réservation

```typescript
// hooks/useReservation.ts
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

export function useCreateReservation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      courseInstanceId,
      userId
    }: {
      courseInstanceId: string;
      userId: string;
    }) => {
      const { data, error } = await supabase
        .from('reservations')
        .insert({
          course_instance_id: courseInstanceId,
          user_id: userId,
          status: 'confirmed',
        })
        .select()
        .single();

      if (error) {
        if (error.code === '23505') {
          throw new Error('Vous avez déjà réservé ce cours');
        }
        throw error;
      }

      return data;
    },
    onSuccess: () => {
      // Rafraîchir les cours et réservations
      queryClient.invalidateQueries({ queryKey: ['courses'] });
      queryClient.invalidateQueries({ queryKey: ['reservations'] });
    },
  });
}

export function useCancelReservation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      reservationId,
      userId
    }: {
      reservationId: string;
      userId: string;
    }) => {
      const { error } = await supabase
        .from('reservations')
        .update({ status: 'cancelled' })
        .eq('id', reservationId)
        .eq('user_id', userId)
        .eq('status', 'confirmed');

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['courses'] });
      queryClient.invalidateQueries({ queryKey: ['reservations'] });
    },
  });
}
```

---

## 📊 Schéma Visuel

```
┌─────────────────────────────────────────────────────────────┐
│                     SYSTÈME DE COURS                         │
└─────────────────────────────────────────────────────────────┘
                              │
                 ┌────────────┴────────────┐
                 │                         │
        ┌────────▼─────────┐     ┌────────▼─────────┐
        │ COURS RÉGULIERS  │     │ COURS PONCTUELS  │
        │  (Récurrents)    │     │   (One-time)     │
        └────────┬─────────┘     └────────┬─────────┘
                 │                         │
                 │  Stockage dans DB       │
                 │                         │
        ┌────────▼─────────┐               │
        │  TABLE: courses  │               │
        │                  │               │
        │ - name           │               │
        │ - day_of_week    │               │
        │ - start_time     │               │
        │ - end_time       │               │
        │ - instructor_id  │               │
        │ - max_participants│              │
        └────────┬─────────┘               │
                 │                         │
                 │  Génère                 │
                 │  automatiquement        │
                 │                         │
        ┌────────▼─────────────────────────▼─────────┐
        │   TABLE: course_instances                  │
        │                                            │
        │ INSTANCE RÉGULIÈRE:                        │
        │ - course_id: UUID (NOT NULL)               │
        │ - is_one_time: false                       │
        │ - scheduled_date, start_time, end_time     │
        │                                            │
        │ INSTANCE PONCTUELLE:                       │
        │ - course_id: NULL                          │
        │ - is_one_time: true                        │
        │ - one_time_title: "Stage weekend"          │
        │ - one_time_description: "..."              │
        │ - one_time_max_participants: 15            │
        │ - scheduled_date, start_time, end_time     │
        └────────┬───────────────────────────────────┘
                 │
                 │  Les membres réservent
                 │
        ┌────────▼─────────┐
        │ TABLE: reservations │
        │                     │
        │ - user_id           │
        │ - course_instance_id│
        │ - status            │
        └─────────────────────┘
```

---

## 🎯 Résumé des Différences

| Aspect | Cours Réguliers | Cours Ponctuels |
|--------|----------------|-----------------|
| **Fréquence** | Récurrent (hebdomadaire) | Unique (one-time) |
| **Table principale** | `courses` | Direct `course_instances` |
| **course_id** | NOT NULL | NULL |
| **is_one_time** | false | true |
| **Planification** | day_of_week, start_time, end_time | scheduled_date, start_time, end_time |
| **Titre/Description** | Dans `courses` | Dans `one_time_*` de `course_instances` |
| **Capacité** | Dans `courses.max_participants` | Dans `one_time_max_participants` |
| **Génération** | Automatique (admin) | Manuelle (admin) |
| **Cas d'usage** | Cours habituels du club | Stages, événements spéciaux |
| **Exemple** | "Krav Maga Adultes - Lundi 19h" | "Stage intensif weekend" |

---

## ✅ Checklist d'implémentation Mobile

- [ ] Créer les hooks `useCourses`, `useReservation`
- [ ] Implémenter le composant `CourseCard`
- [ ] Créer l'écran de planning/calendrier
- [ ] Créer l'écran "Mes réservations"
- [ ] Ajouter la gestion des erreurs (cours complet, déjà réservé, etc.)
- [ ] Implémenter les notifications (rappel avant cours)
- [ ] Ajouter un système de filtres (type, instructeur, jour)
- [ ] Gérer les états de chargement et erreurs
- [ ] Tester les requêtes RLS (Row Level Security)
- [ ] Optimiser les requêtes (pagination, cache)

---

## 🔐 Sécurité (RLS - Row Level Security)

### Policies recommandées

```sql
-- course_instances: Tout le monde peut voir les cours programmés
CREATE POLICY "Tous peuvent voir les cours programmés"
ON course_instances FOR SELECT
USING (status = 'scheduled');

-- reservations: Les utilisateurs ne peuvent voir que leurs réservations
CREATE POLICY "Utilisateurs voient leurs réservations"
ON reservations FOR SELECT
USING (auth.uid() = user_id);

-- reservations: Les utilisateurs peuvent créer leurs réservations
CREATE POLICY "Utilisateurs créent leurs réservations"
ON reservations FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- reservations: Les utilisateurs peuvent annuler leurs réservations
CREATE POLICY "Utilisateurs annulent leurs réservations"
ON reservations FOR UPDATE
USING (auth.uid() = user_id);
```

---

## 📞 Support et Questions

Pour toute question sur l'implémentation :
1. Consulter ce guide
2. Vérifier les exemples de code
3. Tester les requêtes dans Supabase Dashboard
4. Vérifier les RLS policies

**Bonne implémentation ! 🥋**
