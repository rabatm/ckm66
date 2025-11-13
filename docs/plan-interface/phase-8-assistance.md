# Phase 8 : Page d'Assistance / Support

## 📋 Vue d'ensemble

Création d'une page d'assistance complète permettant aux membres de:
- Consulter la FAQ
- Contacter le support
- Accéder aux tutoriels
- Signaler un problème
- Consulter les conditions d'utilisation

## 🎯 Objectifs

1. Fournir une aide immédiate via FAQ
2. Faciliter le contact avec l'équipe
3. Améliorer l'expérience utilisateur
4. Réduire les demandes de support répétitives
5. Créer une base de connaissances accessible

## 📐 Architecture

### Structure des fichiers

```
src/features/support/
├── screens/
│   ├── SupportScreen.tsx          # Écran principal d'assistance
│   ├── FAQScreen.tsx              # FAQ détaillée
│   └── ContactScreen.tsx          # Formulaire de contact
├── components/
│   ├── FAQAccordion.tsx           # Accordéon pour questions/réponses
│   ├── SupportCard.tsx            # Carte d'option de support
│   ├── ContactForm.tsx            # Formulaire de contact
│   ├── TutorialCard.tsx           # Carte tutoriel
│   └── index.ts
├── hooks/
│   ├── useFAQ.ts                  # Hook pour récupérer FAQ
│   └── useContactForm.ts          # Hook pour soumettre formulaire
├── services/
│   └── support.service.ts         # Logique métier support
├── types/
│   └── support.types.ts           # Types TypeScript
└── index.ts
```

## 🗄️ Schéma de base de données

### Nouvelle table : `faq_items`

```sql
CREATE TABLE faq_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category TEXT NOT NULL,                    -- 'account', 'booking', 'subscription', 'technical', 'general'
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  order_index INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_faq_category ON faq_items(category) WHERE is_active = true;
CREATE INDEX idx_faq_order ON faq_items(order_index);
```

### Nouvelle table : `support_tickets`

```sql
CREATE TABLE support_tickets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  category TEXT NOT NULL,                    -- 'technical', 'billing', 'general', 'bug'
  priority TEXT DEFAULT 'normal',            -- 'low', 'normal', 'high', 'urgent'
  status TEXT DEFAULT 'open',                -- 'open', 'in_progress', 'resolved', 'closed'
  admin_response TEXT,
  admin_id UUID REFERENCES profiles(id),
  resolved_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_support_tickets_user ON support_tickets(user_id);
CREATE INDEX idx_support_tickets_status ON support_tickets(status);
CREATE INDEX idx_support_tickets_created ON support_tickets(created_at);

-- RLS Policies
ALTER TABLE support_tickets ENABLE ROW LEVEL SECURITY;

-- Users can view their own tickets
CREATE POLICY "Users can view own tickets" ON support_tickets
  FOR SELECT USING (user_id = auth.uid());

-- Users can create their own tickets
CREATE POLICY "Users can create own tickets" ON support_tickets
  FOR INSERT WITH CHECK (user_id = auth.uid());

-- Admins can view all tickets
CREATE POLICY "Admins can view all tickets" ON support_tickets
  FOR SELECT USING ((SELECT role FROM profiles WHERE id = auth.uid()) = 'admin');

-- Admins can update tickets
CREATE POLICY "Admins can update tickets" ON support_tickets
  FOR UPDATE USING ((SELECT role FROM profiles WHERE id = auth.uid()) = 'admin');
```

### Nouvelle table : `tutorials`

```sql
CREATE TABLE tutorials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL,                    -- 'getting_started', 'booking', 'profile', 'badges'
  video_url TEXT,
  thumbnail_url TEXT,
  content TEXT,                              -- Markdown ou HTML
  duration_minutes INTEGER,
  order_index INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_tutorials_category ON tutorials(category) WHERE is_active = true;
CREATE INDEX idx_tutorials_order ON tutorials(order_index);
```

## 🎨 Design des écrans

### 1. Écran principal d'assistance (SupportScreen)

**Composants principaux:**
- En-tête avec titre "Assistance"
- Grille d'options de support (cards cliquables)
- Section "Besoin d'aide rapide ?" avec FAQ populaire
- Informations de contact

**Options de support:**
```typescript
const supportOptions = [
  {
    id: 'faq',
    title: 'FAQ',
    description: 'Questions fréquentes',
    icon: 'help-circle-outline',
    screen: 'FAQScreen'
  },
  {
    id: 'contact',
    title: 'Nous contacter',
    description: 'Envoyez-nous un message',
    icon: 'mail-outline',
    screen: 'ContactScreen'
  },
  {
    id: 'tutorials',
    title: 'Tutoriels',
    description: 'Guides pas à pas',
    icon: 'book-outline',
    screen: 'TutorialsScreen'
  },
  {
    id: 'bug',
    title: 'Signaler un bug',
    description: 'Un problème technique ?',
    icon: 'bug-outline',
    screen: 'ContactScreen',
    params: { category: 'bug' }
  },
  {
    id: 'phone',
    title: 'Téléphone',
    description: '+33 X XX XX XX XX',
    icon: 'call-outline',
    action: 'phone'
  },
  {
    id: 'terms',
    title: 'CGU',
    description: 'Conditions d\'utilisation',
    icon: 'document-text-outline',
    action: 'terms'
  }
]
```

### 2. Écran FAQ (FAQScreen)

**Structure:**
- Barre de recherche pour filtrer les questions
- Tabs par catégorie (Compte, Réservations, Abonnements, Technique)
- Accordéons avec questions/réponses
- Lien vers contact si question non trouvée

**Catégories FAQ:**
- **Compte**: Création, modification profil, mot de passe
- **Réservations**: Réserver, annuler, gérer ses cours
- **Abonnements**: Types, renouvellement, crédits
- **Technique**: App bugs, notifications, connexion
- **Général**: Horaires, localisation, contact

### 3. Écran Contact (ContactScreen)

**Formulaire:**
```typescript
interface ContactFormData {
  category: 'technical' | 'billing' | 'general' | 'bug'
  subject: string
  message: string
  priority?: 'normal' | 'high'
}
```

**Champs:**
- Catégorie (dropdown)
- Sujet (input)
- Message (textarea)
- Pièce jointe optionnelle (capture d'écran)
- Bouton "Envoyer"

**Validation:**
- Sujet minimum 5 caractères
- Message minimum 20 caractères
- Catégorie obligatoire

### 4. Écran Tutoriels (TutorialsScreen)

**Structure:**
- Liste de tutoriels par catégorie
- Cartes avec miniature, titre, durée
- Recherche et filtres
- Vidéos intégrées ou liens externes

## 📱 Types TypeScript

```typescript
// src/features/support/types/support.types.ts

export type SupportCategory = 'technical' | 'billing' | 'general' | 'bug'
export type TicketStatus = 'open' | 'in_progress' | 'resolved' | 'closed'
export type TicketPriority = 'low' | 'normal' | 'high' | 'urgent'

export interface FAQItem {
  id: string
  category: string
  question: string
  answer: string
  order_index: number
  is_active: boolean
}

export interface SupportTicket {
  id: string
  user_id: string
  subject: string
  message: string
  category: SupportCategory
  priority: TicketPriority
  status: TicketStatus
  admin_response?: string
  admin_id?: string
  resolved_at?: string
  created_at: string
  updated_at: string
}

export interface Tutorial {
  id: string
  title: string
  description: string
  category: string
  video_url?: string
  thumbnail_url?: string
  content?: string
  duration_minutes?: number
  order_index: number
  is_active: boolean
}

export interface ContactFormData {
  category: SupportCategory
  subject: string
  message: string
  priority?: TicketPriority
}
```

## 🔧 Services

```typescript
// src/features/support/services/support.service.ts

import { supabase } from '@/lib/supabase'
import type { FAQItem, SupportTicket, Tutorial, ContactFormData } from '../types/support.types'

export const supportService = {
  // FAQ
  async getFAQItems(category?: string): Promise<FAQItem[]> {
    let query = supabase
      .from('faq_items')
      .select('*')
      .eq('is_active', true)
      .order('order_index')

    if (category) {
      query = query.eq('category', category)
    }

    const { data, error } = await query
    if (error) throw error
    return data || []
  },

  async searchFAQ(searchTerm: string): Promise<FAQItem[]> {
    const { data, error } = await supabase
      .from('faq_items')
      .select('*')
      .eq('is_active', true)
      .or(`question.ilike.%${searchTerm}%,answer.ilike.%${searchTerm}%`)
      .order('order_index')

    if (error) throw error
    return data || []
  },

  // Support Tickets
  async createSupportTicket(userId: string, formData: ContactFormData): Promise<SupportTicket> {
    const { data, error } = await supabase
      .from('support_tickets')
      .insert({
        user_id: userId,
        subject: formData.subject,
        message: formData.message,
        category: formData.category,
        priority: formData.priority || 'normal',
        status: 'open'
      })
      .select()
      .single()

    if (error) throw error
    return data
  },

  async getUserTickets(userId: string): Promise<SupportTicket[]> {
    const { data, error } = await supabase
      .from('support_tickets')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data || []
  },

  async getTicketById(ticketId: string): Promise<SupportTicket | null> {
    const { data, error } = await supabase
      .from('support_tickets')
      .select('*')
      .eq('id', ticketId)
      .single()

    if (error) throw error
    return data
  },

  // Tutorials
  async getTutorials(category?: string): Promise<Tutorial[]> {
    let query = supabase
      .from('tutorials')
      .select('*')
      .eq('is_active', true)
      .order('order_index')

    if (category) {
      query = query.eq('category', category)
    }

    const { data, error } = await query
    if (error) throw error
    return data || []
  }
}
```

## 🪝 Hooks React

```typescript
// src/features/support/hooks/useFAQ.ts
import { useQuery } from '@tanstack/react-query'
import { supportService } from '../services/support.service'

export function useFAQ(category?: string) {
  return useQuery({
    queryKey: ['faq', category],
    queryFn: () => supportService.getFAQItems(category)
  })
}

// src/features/support/hooks/useContactForm.ts
import { useMutation } from '@tanstack/react-query'
import { supportService } from '../services/support.service'
import { useAuth } from '@/features/auth/hooks/useAuth'

export function useContactForm() {
  const { user } = useAuth()

  return useMutation({
    mutationFn: (formData: ContactFormData) => {
      if (!user?.id) throw new Error('User not authenticated')
      return supportService.createSupportTicket(user.id, formData)
    }
  })
}
```

## 🎨 Composants UI

### SupportCard.tsx
```typescript
interface SupportCardProps {
  title: string
  description: string
  icon: string
  onPress: () => void
}

export function SupportCard({ title, description, icon, onPress }: SupportCardProps) {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      <Ionicons name={icon} size={32} color={colors.primary[500]} />
      <View style={styles.cardContent}>
        <Text style={styles.cardTitle}>{title}</Text>
        <Text style={styles.cardDescription}>{description}</Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color={colors.text.tertiary} />
    </TouchableOpacity>
  )
}
```

### FAQAccordion.tsx
```typescript
interface FAQAccordionProps {
  item: FAQItem
}

export function FAQAccordion({ item }: FAQAccordionProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  return (
    <View style={styles.accordion}>
      <TouchableOpacity
        style={styles.accordionHeader}
        onPress={() => setIsExpanded(!isExpanded)}
      >
        <Text style={styles.question}>{item.question}</Text>
        <Ionicons
          name={isExpanded ? 'chevron-up' : 'chevron-down'}
          size={20}
          color={colors.text.secondary}
        />
      </TouchableOpacity>
      {isExpanded && (
        <View style={styles.accordionContent}>
          <Text style={styles.answer}>{item.answer}</Text>
        </View>
      )}
    </View>
  )
}
```

## 🚀 Plan d'implémentation

### Étape 1: Base de données (1h)
- [ ] Créer migration pour table `faq_items`
- [ ] Créer migration pour table `support_tickets`
- [ ] Créer migration pour table `tutorials`
- [ ] Ajouter RLS policies
- [ ] Peupler FAQ avec questions initiales

### Étape 2: Types et services (1h)
- [ ] Définir types TypeScript
- [ ] Implémenter `support.service.ts`
- [ ] Créer hooks React Query

### Étape 3: Composants UI (2h)
- [ ] Créer `SupportCard.tsx`
- [ ] Créer `FAQAccordion.tsx`
- [ ] Créer `ContactForm.tsx`
- [ ] Créer `TutorialCard.tsx`

### Étape 4: Écrans (3h)
- [ ] Implémenter `SupportScreen.tsx`
- [ ] Implémenter `FAQScreen.tsx`
- [ ] Implémenter `ContactScreen.tsx`
- [ ] Implémenter `TutorialsScreen.tsx`

### Étape 5: Navigation (30min)
- [ ] Ajouter onglet "Support" dans la navigation principale
- [ ] Configurer routing entre écrans support
- [ ] Tester navigation

### Étape 6: Tests et polish (1h)
- [ ] Tester tous les formulaires
- [ ] Vérifier responsive design
- [ ] Tester accessibilité
- [ ] Optimiser performances

**Temps total estimé: 8.5 heures**

## 📊 Données initiales FAQ

```sql
-- Questions fréquentes initiales
INSERT INTO faq_items (category, question, answer, order_index) VALUES
  ('account', 'Comment modifier mon profil ?', 'Allez dans l''onglet Profil, puis cliquez sur "Modifier mes informations".', 1),
  ('account', 'J''ai oublié mon mot de passe', 'Sur l''écran de connexion, cliquez sur "Mot de passe oublié ?" et suivez les instructions.', 2),
  ('booking', 'Comment réserver un cours ?', 'Allez dans l''onglet Planning, sélectionnez un cours et cliquez sur "Réserver".', 1),
  ('booking', 'Puis-je annuler une réservation ?', 'Oui, allez dans "Mes réservations" et cliquez sur "Annuler" jusqu''à 4h avant le cours.', 2),
  ('subscription', 'Quels sont les types d''abonnement ?', 'Nous proposons 3 formules: Découverte (4 cours/mois), Régulier (8 cours/mois) et Illimité.', 1),
  ('subscription', 'Comment renouveler mon abonnement ?', 'Votre abonnement se renouvelle automatiquement. Vous pouvez le modifier dans votre profil.', 2),
  ('technical', 'L''application ne se charge pas', 'Vérifiez votre connexion internet et essayez de redémarrer l''application.', 1),
  ('technical', 'Je ne reçois pas les notifications', 'Vérifiez que les notifications sont activées dans vos paramètres de profil et dans les paramètres de votre téléphone.', 2);
```

## 🎯 Métriques de succès

- Taux d'utilisation de la FAQ > 60%
- Temps de réponse aux tickets < 24h
- Réduction des emails de support de 30%
- Note de satisfaction > 4/5
- Taux de résolution FAQ > 70%

## 🔄 Améliorations futures

- Chat en direct avec support
- Base de connaissances recherchable
- Vidéos tutoriels intégrées
- Historique des tickets avec statut
- Notifications push pour réponses tickets
- Système de rating pour articles FAQ
- Traduction multilingue
