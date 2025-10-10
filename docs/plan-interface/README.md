# Plan Site d'Administration CKM66 (Next.js)

## 📋 Vue d'ensemble

Site d'administration web pour la gestion complète du club de Krav Maga CKM66, avec interfaces différenciées par rôle (Admin, Coach, Secrétaire).

---

## 🎯 Stack Technique Recommandée

### Framework & Core
- **Next.js 15** (App Router) avec TypeScript
- **React Server Components** pour performance optimale
- **Supabase** (même backend que l'app mobile)

### UI & Styling
- **shadcn/ui** (composants Radix UI + Tailwind CSS)
- **Tailwind CSS** pour le styling
- **Recharts** ou **Chart.js** pour les graphiques/statistiques

### State Management
- **TanStack Query** (React Query) pour les appels API
- **Zustand** pour l'état global (auth, UI)

### Autres outils
- **React Hook Form** + **Zod** pour les formulaires
- **date-fns** pour la gestion des dates
- **Supabase Realtime** pour les mises à jour en temps réel

---

## 👥 Fonctionnalités par Rôle

### **Admin (Accès complet)**

1. **Gestion des utilisateurs**
   - CRUD complet sur les profils (membres, coachs, secrétaires)
   - Modification des rôles et permissions
   - Consultation des statistiques membres

2. **Gestion des cours**
   - Créer/modifier/supprimer des cours récurrents
   - Gérer les instances de cours (annulations, modifications)
   - Assigner/réassigner les instructeurs

3. **Gestion des abonnements**
   - Créer/modifier les abonnements membres
   - Suivi des paiements et expirations
   - Statistiques de revenus

4. **Système de badges**
   - Créer des badges personnalisés
   - Attribuer des badges manuels
   - Gérer le système de points

5. **Dashboard & Analytics**
   - Vue d'ensemble du club (KPIs)
   - Statistiques d'assiduité globales
   - Rapports financiers

### **Coach/Instructeur**

1. **Gestion de ses cours**
   - Voir planning personnel
   - Marquer les présences/absences
   - Annuler/modifier ses instances de cours

2. **Gestion des réservations**
   - Voir les listes de participants
   - Gérer les listes d'attente
   - Valider les présences

3. **Suivi des élèves**
   - Voir profils et progressions
   - Attribuer badges manuels (techniques, attitude)
   - Ajouter des notes/commentaires

4. **Dashboard coach**
   - Ses cours à venir
   - Taux de remplissage de ses cours
   - Stats de ses élèves

### **Secrétaire**

1. **Gestion des membres**
   - Inscription de nouveaux membres
   - Mise à jour des profils
   - Gestion des coordonnées

2. **Gestion des abonnements**
   - Créer/renouveler les abonnements
   - Suivi des paiements
   - Relances pour expirations

3. **Gestion des réservations**
   - Réserver pour un membre
   - Gérer les annulations
   - Voir les plannings

4. **Tableau de bord**
   - Abonnements expirant bientôt
   - Nouveaux membres
   - Réservations du jour

---

## 🗂️ Structure de Projet Proposée

```
ckm-admin/
├── app/
│   ├── (auth)/                 # Routes authentification
│   │   ├── login/
│   │   └── layout.tsx
│   ├── (dashboard)/            # Routes protégées
│   │   ├── dashboard/          # Page d'accueil selon rôle
│   │   ├── members/            # Gestion membres
│   │   ├── courses/            # Gestion cours
│   │   ├── reservations/       # Gestion réservations
│   │   ├── subscriptions/      # Gestion abonnements
│   │   ├── badges/             # Gestion badges
│   │   ├── attendance/         # Gestion présences
│   │   ├── analytics/          # Statistiques (admin)
│   │   └── layout.tsx          # Layout avec sidebar
│   ├── api/                    # API routes si besoin
│   └── layout.tsx
├── components/
│   ├── ui/                     # shadcn/ui components
│   ├── features/               # Composants métier
│   │   ├── members/
│   │   ├── courses/
│   │   ├── reservations/
│   │   ├── subscriptions/
│   │   └── badges/
│   ├── layout/                 # Sidebar, Header, etc.
│   └── shared/                 # Composants partagés
├── lib/
│   ├── supabase/              # Client Supabase
│   │   ├── client.ts
│   │   └── server.ts
│   ├── hooks/                 # Custom hooks
│   └── utils/                 # Utilitaires
├── types/
│   └── database.types.ts      # Types Supabase (partagés)
└── middleware.ts              # Protection routes + rôles
```

---

## 🚀 Phases de Développement

### [Phase 1 : Foundation](./phase-1-foundation.md) (Semaine 1-2)
Setup Next.js, authentification, layout de base

### [Phase 2 : Dashboard & Membres](./phase-2-dashboard-membres.md) (Semaine 3-4)
Dashboard multi-rôles et module de gestion des membres

### [Phase 3 : Cours & Planning](./phase-3-cours-planning.md) (Semaine 5-6)
Gestion des cours et système de réservations

### [Phase 4 : Abonnements & Paiements](./phase-4-abonnements.md) (Semaine 7)
Gestion des abonnements et suivi financier

### [Phase 5 : Badges & Gamification](./phase-5-badges.md) (Semaine 8)
Système de badges et gamification

### [Phase 6 : Présences & Analytics](./phase-6-presences-analytics.md) (Semaine 9)
Gestion des présences et analytics avancés

### [Phase 7 : Optimisations & Polish](./phase-7-optimisations.md) (Semaine 10)
Optimisations, responsive, tests

---

## 🔐 Sécurité & Permissions

### Middleware Next.js

```typescript
// middleware.ts
export async function middleware(request: NextRequest) {
  const { user } = await getUser()
  const role = user?.role

  // Protections par route selon rôle
  if (request.nextUrl.pathname.startsWith('/analytics')) {
    if (role !== 'admin') return redirect('/dashboard')
  }

  if (request.nextUrl.pathname.startsWith('/badges/create')) {
    if (!['admin', 'instructor'].includes(role)) {
      return redirect('/dashboard')
    }
  }
}
```

### RLS Supabase
- Les policies existantes contrôlent déjà l'accès aux données
- Le client Supabase respectera automatiquement les RLS

---

## 📊 Fonctionnalités Clés à Implémenter

1. **Recherche et filtres avancés** (membres, cours, réservations)
2. **Exports CSV/Excel** (listes, rapports)
3. **Système de notifications** (emails pour expirations, nouveaux membres)
4. **Calendrier interactif** avec drag & drop pour les cours
5. **Dashboard temps réel** avec Supabase Realtime
6. **Mode sombre** (Toggle theme)
7. **Multi-langue** (FR/EN) via i18n si besoin

---

## 🎨 Design System

- Utiliser les mêmes couleurs que l'app mobile pour cohérence
- Design moderne et épuré (inspiration: Linear, Vercel Dashboard)
- Tables avec tri/filtres (TanStack Table)
- Modals pour formulaires CRUD
- Toast notifications (sonner)

---

## 📦 Avantages de Next.js vs autres solutions

✅ **SSR/RSC** : Performance optimale, SEO
✅ **File-based routing** : Organisation claire
✅ **API Routes** : Backend si besoin d'endpoints custom
✅ **Middleware** : Protection routes facile
✅ **Supabase** : Même backend, types partagés
✅ **shadcn/ui** : Composants pro prêts à l'emploi

---

## 🔄 Sync avec l'App Mobile

Les deux applications partagent :
- Même base de données Supabase
- Mêmes types TypeScript (`database.types.ts`)
- Mêmes règles RLS
- Supabase Realtime pour sync temps réel

**Exemple** : Un coach attribue un badge via le site web → L'app mobile reçoit la notif en temps réel via Supabase Realtime.

---

## 📚 Documentation

- [Phase 1 : Foundation](./phase-1-foundation.md)
- [Phase 2 : Dashboard & Membres](./phase-2-dashboard-membres.md)
- [Phase 3 : Cours & Planning](./phase-3-cours-planning.md)
- [Phase 4 : Abonnements](./phase-4-abonnements.md)
- [Phase 5 : Badges](./phase-5-badges.md)
- [Phase 6 : Présences & Analytics](./phase-6-presences-analytics.md)
- [Phase 7 : Optimisations](./phase-7-optimisations.md)
- [Guide Agent](./agent.md)
