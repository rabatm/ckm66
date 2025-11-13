# Phase 9 : Page Marketing / Promotion

## 📋 Vue d'ensemble

Création d'un espace marketing intégré à l'application pour:
- Promouvoir les événements spéciaux
- Afficher les actualités du club
- Proposer des offres de parrainage
- Mettre en avant les cours et instructeurs
- Encourager l'engagement des membres

## 🎯 Objectifs

1. Augmenter l'engagement des membres existants
2. Faciliter le parrainage et acquisition de nouveaux membres
3. Promouvoir les événements spéciaux (stages, compétitions)
4. Mettre en valeur les instructeurs et réussites
5. Créer un sentiment de communauté

## 📐 Architecture

### Structure des fichiers

```
src/features/marketing/
├── screens/
│   ├── NewsScreen.tsx              # Écran actualités et événements
│   ├── ReferralScreen.tsx          # Programme de parrainage
│   ├── EventDetailsScreen.tsx      # Détails d'un événement
│   └── InstructorsScreen.tsx       # Présentation des instructeurs
├── components/
│   ├── NewsCard.tsx                # Carte actualité
│   ├── EventCard.tsx               # Carte événement
│   ├── ReferralCard.tsx            # Carte de parrainage
│   ├── InstructorCard.tsx          # Carte instructeur
│   ├── PromoCarousel.tsx           # Carousel promotionnel
│   ├── ShareButton.tsx             # Bouton de partage
│   ├── SuccessStoryCard.tsx        # Témoignage/success story
│   └── index.ts
├── hooks/
│   ├── useNews.ts                  # Hook pour actualités
│   ├── useEvents.ts                # Hook pour événements
│   ├── useReferrals.ts             # Hook pour parrainage
│   └── useInstructors.ts           # Hook pour instructeurs
├── services/
│   └── marketing.service.ts        # Logique métier marketing
├── types/
│   └── marketing.types.ts          # Types TypeScript
└── index.ts
```

## 🗄️ Schéma de base de données

### Nouvelle table : `news_items`

```sql
CREATE TABLE news_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  subtitle TEXT,
  content TEXT NOT NULL,                     -- Markdown ou HTML
  category TEXT NOT NULL,                    -- 'news', 'achievement', 'announcement', 'tips'
  author_id UUID REFERENCES profiles(id),
  image_url TEXT,
  is_featured BOOLEAN DEFAULT false,
  is_published BOOLEAN DEFAULT false,
  published_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_news_published ON news_items(published_at DESC) WHERE is_published = true;
CREATE INDEX idx_news_featured ON news_items(is_featured) WHERE is_published = true;
CREATE INDEX idx_news_category ON news_items(category) WHERE is_published = true;

-- RLS: Tous peuvent lire les news publiées
ALTER TABLE news_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read published news" ON news_items
  FOR SELECT USING (is_published = true);

CREATE POLICY "Admins can manage news" ON news_items
  FOR ALL USING ((SELECT role FROM profiles WHERE id = auth.uid()) = 'admin');
```

### Nouvelle table : `events`

```sql
CREATE TABLE events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  event_type TEXT NOT NULL,                  -- 'workshop', 'seminar', 'competition', 'social', 'training_camp'
  location TEXT,
  location_address TEXT,
  start_date TIMESTAMP WITH TIME ZONE NOT NULL,
  end_date TIMESTAMP WITH TIME ZONE NOT NULL,
  max_participants INTEGER,
  current_participants INTEGER DEFAULT 0,
  price DECIMAL(10, 2),
  image_url TEXT,
  registration_deadline TIMESTAMP WITH TIME ZONE,
  is_published BOOLEAN DEFAULT false,
  is_featured BOOLEAN DEFAULT false,
  instructor_id UUID REFERENCES profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_events_start_date ON events(start_date) WHERE is_published = true;
CREATE INDEX idx_events_featured ON events(is_featured) WHERE is_published = true;
CREATE INDEX idx_events_type ON events(event_type) WHERE is_published = true;

ALTER TABLE events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read published events" ON events
  FOR SELECT USING (is_published = true);

CREATE POLICY "Admins can manage events" ON events
  FOR ALL USING ((SELECT role FROM profiles WHERE id = auth.uid()) = 'admin');
```

### Nouvelle table : `event_registrations`

```sql
CREATE TABLE event_registrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'pending',             -- 'pending', 'confirmed', 'cancelled', 'attended'
  payment_status TEXT DEFAULT 'pending',     -- 'pending', 'paid', 'refunded'
  notes TEXT,
  registered_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(event_id, user_id)
);

CREATE INDEX idx_event_registrations_event ON event_registrations(event_id);
CREATE INDEX idx_event_registrations_user ON event_registrations(user_id);

ALTER TABLE event_registrations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own registrations" ON event_registrations
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can create own registrations" ON event_registrations
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can cancel own registrations" ON event_registrations
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Admins can manage all registrations" ON event_registrations
  FOR ALL USING ((SELECT role FROM profiles WHERE id = auth.uid()) = 'admin');
```

### Nouvelle table : `referrals`

```sql
CREATE TABLE referrals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  referee_email TEXT NOT NULL,
  referee_id UUID REFERENCES profiles(id),   -- NULL jusqu'à inscription
  status TEXT DEFAULT 'pending',             -- 'pending', 'signed_up', 'subscribed', 'rewarded'
  reward_type TEXT,                          -- 'free_month', 'discount', 'credits'
  reward_given BOOLEAN DEFAULT false,
  sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  signed_up_at TIMESTAMP WITH TIME ZONE,
  rewarded_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_referrals_referrer ON referrals(referrer_id);
CREATE INDEX idx_referrals_status ON referrals(status);

ALTER TABLE referrals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own referrals" ON referrals
  FOR SELECT USING (referrer_id = auth.uid());

CREATE POLICY "Users can create referrals" ON referrals
  FOR INSERT WITH CHECK (referrer_id = auth.uid());

CREATE POLICY "Admins can manage referrals" ON referrals
  FOR ALL USING ((SELECT role FROM profiles WHERE id = auth.uid()) = 'admin');
```

### Nouvelle table : `instructors`

```sql
CREATE TABLE instructors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  title TEXT,                                -- 'Instructeur principal', 'Instructeur', 'Assistant'
  bio TEXT,
  specialties TEXT[],                        -- ['Krav Maga', 'Self Defense', 'Combat au sol']
  certifications TEXT[],
  experience_years INTEGER,
  photo_url TEXT,
  is_active BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_instructors_active ON instructors(display_order) WHERE is_active = true;

ALTER TABLE instructors ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active instructors" ON instructors
  FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage instructors" ON instructors
  FOR ALL USING ((SELECT role FROM profiles WHERE id = auth.uid()) = 'admin');
```

### Nouvelle table : `success_stories`

```sql
CREATE TABLE success_stories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  name TEXT NOT NULL,                        -- Peut être anonymisé
  story TEXT NOT NULL,
  achievement TEXT,                          -- 'Perte de poids', 'Compétition gagnée', etc.
  image_url TEXT,
  is_approved BOOLEAN DEFAULT false,
  is_featured BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  approved_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_success_stories_approved ON success_stories(created_at DESC) WHERE is_approved = true;

ALTER TABLE success_stories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read approved stories" ON success_stories
  FOR SELECT USING (is_approved = true);

CREATE POLICY "Users can submit own stories" ON success_stories
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Admins can manage stories" ON success_stories
  FOR ALL USING ((SELECT role FROM profiles WHERE id = auth.uid()) = 'admin');
```

## 🎨 Design des écrans

### 1. Écran Actualités (NewsScreen)

**Structure:**
- Carousel de news en vedette (featured)
- Filtres par catégorie (Actualités, Événements, Conseils)
- Liste de cartes news avec image, titre, date
- Pull-to-refresh

**Catégories:**
- 📰 Actualités (news du club)
- 🏆 Réussites (success stories)
- 📢 Annonces (announcements)
- 💡 Conseils (tips & tricks)
- 🎯 Événements (upcoming events)

### 2. Écran Parrainage (ReferralScreen)

**Sections:**
- En-tête explicatif du programme
- Code de parrainage unique (QR code + texte)
- Statistiques personnelles (invitations envoyées, inscriptions, récompenses)
- Formulaire d'invitation (email)
- Bouton de partage social
- Liste des récompenses disponibles

**Programme de parrainage:**
```typescript
const referralProgram = {
  rewards: [
    {
      level: 'signup',
      description: 'Votre filleul s\'inscrit',
      reward: '1 cours offert'
    },
    {
      level: 'subscription',
      description: 'Votre filleul prend un abonnement',
      reward: '1 mois gratuit'
    },
    {
      level: 'milestone_3',
      description: '3 filleuls abonnés',
      reward: '50€ de crédit'
    }
  ]
}
```

### 3. Écran Détails Événement (EventDetailsScreen)

**Informations:**
- Image de l'événement
- Titre et type
- Date et horaires
- Lieu (avec carte)
- Description complète
- Instructeur(s)
- Prix
- Places disponibles
- Bouton d'inscription
- Partage sur réseaux sociaux

### 4. Écran Instructeurs (InstructorsScreen)

**Présentation:**
- Liste des instructeurs avec photos
- Nom, titre, spécialités
- Bio complète en modal
- Cours associés
- Certifications

## 📱 Types TypeScript

```typescript
// src/features/marketing/types/marketing.types.ts

export type NewsCategory = 'news' | 'achievement' | 'announcement' | 'tips'
export type EventType = 'workshop' | 'seminar' | 'competition' | 'social' | 'training_camp'
export type ReferralStatus = 'pending' | 'signed_up' | 'subscribed' | 'rewarded'
export type RegistrationStatus = 'pending' | 'confirmed' | 'cancelled' | 'attended'

export interface NewsItem {
  id: string
  title: string
  subtitle?: string
  content: string
  category: NewsCategory
  author_id?: string
  image_url?: string
  is_featured: boolean
  is_published: boolean
  published_at: string
  created_at: string
}

export interface Event {
  id: string
  title: string
  description: string
  event_type: EventType
  location?: string
  location_address?: string
  start_date: string
  end_date: string
  max_participants?: number
  current_participants: number
  price?: number
  image_url?: string
  registration_deadline?: string
  is_published: boolean
  is_featured: boolean
  instructor_id?: string
  instructor?: Instructor
}

export interface EventRegistration {
  id: string
  event_id: string
  user_id: string
  status: RegistrationStatus
  payment_status: 'pending' | 'paid' | 'refunded'
  notes?: string
  registered_at: string
  event?: Event
}

export interface Referral {
  id: string
  referrer_id: string
  referee_email: string
  referee_id?: string
  status: ReferralStatus
  reward_type?: string
  reward_given: boolean
  sent_at: string
  signed_up_at?: string
  rewarded_at?: string
}

export interface Instructor {
  id: string
  profile_id?: string
  name: string
  title?: string
  bio?: string
  specialties: string[]
  certifications: string[]
  experience_years?: number
  photo_url?: string
  is_active: boolean
  display_order: number
}

export interface SuccessStory {
  id: string
  user_id?: string
  name: string
  story: string
  achievement?: string
  image_url?: string
  is_approved: boolean
  is_featured: boolean
  created_at: string
}

export interface ReferralStats {
  total_referrals: number
  pending: number
  signed_up: number
  subscribed: number
  total_rewards: number
}
```

## 🔧 Services

```typescript
// src/features/marketing/services/marketing.service.ts

import { supabase } from '@/lib/supabase'
import type { NewsItem, Event, Referral, Instructor, SuccessStory, EventRegistration } from '../types/marketing.types'

export const marketingService = {
  // News & Announcements
  async getNews(category?: string, limit = 20): Promise<NewsItem[]> {
    let query = supabase
      .from('news_items')
      .select('*')
      .eq('is_published', true)
      .order('published_at', { ascending: false })
      .limit(limit)

    if (category) {
      query = query.eq('category', category)
    }

    const { data, error } = await query
    if (error) throw error
    return data || []
  },

  async getFeaturedNews(): Promise<NewsItem[]> {
    const { data, error } = await supabase
      .from('news_items')
      .select('*')
      .eq('is_published', true)
      .eq('is_featured', true)
      .order('published_at', { ascending: false })
      .limit(3)

    if (error) throw error
    return data || []
  },

  async getNewsById(id: string): Promise<NewsItem | null> {
    const { data, error } = await supabase
      .from('news_items')
      .select('*')
      .eq('id', id)
      .eq('is_published', true)
      .single()

    if (error) throw error
    return data
  },

  // Events
  async getEvents(eventType?: string): Promise<Event[]> {
    let query = supabase
      .from('events')
      .select(`
        *,
        instructor:instructors(name, photo_url)
      `)
      .eq('is_published', true)
      .gte('end_date', new Date().toISOString())
      .order('start_date', { ascending: true })

    if (eventType) {
      query = query.eq('event_type', eventType)
    }

    const { data, error } = await query
    if (error) throw error
    return data || []
  },

  async getFeaturedEvents(): Promise<Event[]> {
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .eq('is_published', true)
      .eq('is_featured', true)
      .gte('end_date', new Date().toISOString())
      .order('start_date', { ascending: true })
      .limit(3)

    if (error) throw error
    return data || []
  },

  async getEventById(id: string): Promise<Event | null> {
    const { data, error } = await supabase
      .from('events')
      .select(`
        *,
        instructor:instructors(*)
      `)
      .eq('id', id)
      .single()

    if (error) throw error
    return data
  },

  async registerForEvent(userId: string, eventId: string, notes?: string): Promise<EventRegistration> {
    const { data, error } = await supabase
      .from('event_registrations')
      .insert({
        user_id: userId,
        event_id: eventId,
        notes,
        status: 'pending'
      })
      .select()
      .single()

    if (error) throw error

    // Increment participant count
    await supabase.rpc('increment_event_participants', { event_id: eventId })

    return data
  },

  async cancelEventRegistration(registrationId: string): Promise<void> {
    const { error } = await supabase
      .from('event_registrations')
      .update({ status: 'cancelled' })
      .eq('id', registrationId)

    if (error) throw error
  },

  async getUserEventRegistrations(userId: string): Promise<EventRegistration[]> {
    const { data, error } = await supabase
      .from('event_registrations')
      .select(`
        *,
        event:events(*)
      `)
      .eq('user_id', userId)
      .order('registered_at', { ascending: false })

    if (error) throw error
    return data || []
  },

  // Referrals
  async createReferral(referrerId: string, refereeEmail: string): Promise<Referral> {
    const { data, error } = await supabase
      .from('referrals')
      .insert({
        referrer_id: referrerId,
        referee_email: refereeEmail,
        status: 'pending'
      })
      .select()
      .single()

    if (error) throw error
    return data
  },

  async getUserReferrals(userId: string): Promise<Referral[]> {
    const { data, error } = await supabase
      .from('referrals')
      .select('*')
      .eq('referrer_id', userId)
      .order('sent_at', { ascending: false })

    if (error) throw error
    return data || []
  },

  async getReferralStats(userId: string): Promise<ReferralStats> {
    const { data, error } = await supabase
      .from('referrals')
      .select('status, reward_given')
      .eq('referrer_id', userId)

    if (error) throw error

    const stats = {
      total_referrals: data?.length || 0,
      pending: data?.filter(r => r.status === 'pending').length || 0,
      signed_up: data?.filter(r => r.status === 'signed_up').length || 0,
      subscribed: data?.filter(r => r.status === 'subscribed').length || 0,
      total_rewards: data?.filter(r => r.reward_given).length || 0
    }

    return stats
  },

  // Instructors
  async getInstructors(): Promise<Instructor[]> {
    const { data, error } = await supabase
      .from('instructors')
      .select('*')
      .eq('is_active', true)
      .order('display_order')

    if (error) throw error
    return data || []
  },

  // Success Stories
  async getSuccessStories(): Promise<SuccessStory[]> {
    const { data, error } = await supabase
      .from('success_stories')
      .select('*')
      .eq('is_approved', true)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data || []
  },

  async submitSuccessStory(userId: string, story: string, achievement?: string): Promise<SuccessStory> {
    const { data, error } = await supabase
      .from('success_stories')
      .insert({
        user_id: userId,
        story,
        achievement,
        is_approved: false
      })
      .select()
      .single()

    if (error) throw error
    return data
  }
}
```

## 🪝 Hooks React

```typescript
// src/features/marketing/hooks/useNews.ts
import { useQuery } from '@tanstack/react-query'
import { marketingService } from '../services/marketing.service'

export function useNews(category?: string) {
  return useQuery({
    queryKey: ['news', category],
    queryFn: () => marketingService.getNews(category)
  })
}

export function useFeaturedNews() {
  return useQuery({
    queryKey: ['news', 'featured'],
    queryFn: () => marketingService.getFeaturedNews(),
    staleTime: 5 * 60 * 1000 // 5 minutes
  })
}

// src/features/marketing/hooks/useEvents.ts
export function useEvents(eventType?: string) {
  return useQuery({
    queryKey: ['events', eventType],
    queryFn: () => marketingService.getEvents(eventType)
  })
}

// src/features/marketing/hooks/useReferrals.ts
export function useReferrals(userId: string) {
  return useQuery({
    queryKey: ['referrals', userId],
    queryFn: () => marketingService.getUserReferrals(userId)
  })
}

export function useReferralStats(userId: string) {
  return useQuery({
    queryKey: ['referral-stats', userId],
    queryFn: () => marketingService.getReferralStats(userId)
  })
}
```

## 🎨 Composants UI principaux

### PromoCarousel.tsx
```typescript
export function PromoCarousel({ items }: { items: NewsItem[] }) {
  return (
    <ScrollView horizontal pagingEnabled showsHorizontalScrollIndicator={false}>
      {items.map((item) => (
        <View key={item.id} style={styles.carouselItem}>
          <Image source={{ uri: item.image_url }} style={styles.image} />
          <View style={styles.overlay}>
            <Text style={styles.title}>{item.title}</Text>
            <Text style={styles.subtitle}>{item.subtitle}</Text>
          </View>
        </View>
      ))}
    </ScrollView>
  )
}
```

### ReferralCard.tsx
```typescript
export function ReferralCard({ userId }: { userId: string }) {
  const { data: stats } = useReferralStats(userId)

  return (
    <View style={styles.card}>
      <Text style={styles.title}>Parrainez vos amis</Text>
      <QRCode value={`https://app.ckm.com/register?ref=${userId}`} size={150} />
      <Text style={styles.code}>Code: {userId.slice(0, 8)}</Text>

      <View style={styles.stats}>
        <StatItem label="Invités" value={stats?.total_referrals || 0} />
        <StatItem label="Inscrits" value={stats?.signed_up || 0} />
        <StatItem label="Récompenses" value={stats?.total_rewards || 0} />
      </View>
    </View>
  )
}
```

## 🚀 Plan d'implémentation

### Étape 1: Base de données (2h)
- [ ] Créer migrations pour toutes les tables marketing
- [ ] Ajouter RLS policies
- [ ] Créer fonction `increment_event_participants`
- [ ] Peupler données de test (news, events, instructors)

### Étape 2: Types et services (2h)
- [ ] Définir tous les types TypeScript
- [ ] Implémenter `marketing.service.ts`
- [ ] Créer tous les hooks React Query
- [ ] Tester les services

### Étape 3: Composants UI (3h)
- [ ] Créer `NewsCard.tsx`
- [ ] Créer `EventCard.tsx`
- [ ] Créer `PromoCarousel.tsx`
- [ ] Créer `ReferralCard.tsx` avec QR code
- [ ] Créer `InstructorCard.tsx`
- [ ] Créer `SuccessStoryCard.tsx`

### Étape 4: Écrans principaux (4h)
- [ ] Implémenter `NewsScreen.tsx`
- [ ] Implémenter `ReferralScreen.tsx`
- [ ] Implémenter `EventDetailsScreen.tsx`
- [ ] Implémenter `InstructorsScreen.tsx`

### Étape 5: Fonctionnalités de partage (1.5h)
- [ ] Intégrer `expo-sharing` pour partage social
- [ ] Intégrer `react-native-qrcode-svg` pour QR codes
- [ ] Implémenter deep linking pour parrainage
- [ ] Tester partage sur différentes plateformes

### Étape 6: Navigation et intégration (1h)
- [ ] Ajouter onglet "Actualités" dans navigation
- [ ] Configurer routing entre écrans
- [ ] Ajouter notifications pour nouveaux événements
- [ ] Tester navigation complète

### Étape 7: Tests et optimisations (1.5h)
- [ ] Optimiser images (lazy loading)
- [ ] Ajouter animations transitions
- [ ] Tester accessibilité
- [ ] Vérifier performances
- [ ] Polish UI/UX

**Temps total estimé: 15 heures**

## 📦 Dépendances supplémentaires

```bash
npm install react-native-qrcode-svg
npm install expo-sharing
npm install @react-native-clipboard/clipboard
npm install react-native-share
```

## 🎯 Métriques de succès

- Taux d'engagement actualités > 40%
- Taux de conversion parrainage > 15%
- Inscriptions événements > 60% de taux de remplissage
- Partages sociaux > 20 par mois
- Nouveaux membres via parrainage > 10%

## 📊 Analytics à tracker

```typescript
// Events à tracker
const marketingEvents = {
  news_viewed: { newsId: string, category: string },
  news_shared: { newsId: string, platform: string },
  event_viewed: { eventId: string, eventType: string },
  event_registered: { eventId: string },
  referral_sent: { method: string },
  referral_code_copied: {},
  instructor_viewed: { instructorId: string }
}
```

## 🔄 Améliorations futures

- Push notifications pour nouveaux événements
- Système de likes/comments sur news
- Galerie photos d'événements passés
- Témoignages vidéo
- Leaderboard de parrainage
- Intégration calendrier (Google/Apple)
- Gamification du parrainage
- Stories/Reels format
- Chat communautaire
- Marketplace (équipement, merchandise)
