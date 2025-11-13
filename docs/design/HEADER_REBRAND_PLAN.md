# Header Rebrand Plan

## Overview
Rebrand the main app header to:
1. Remove the subscription/abonnement card
2. Add a clickable tab effect on badges for navigation to Profile > Badges tab

---

## Current Header Structure

**File:** `src/components/ui/DarkAppHeader.tsx`

**Currently Shows:**
```
┌─────────────────────────────────────┐
│  [Avatar]  Name        [Last Badge] │
│  Level indicator with points        │
│                                     │
│  ┌─────────────────────────────────┤
│  │ Next Reservation Card           │ ← Clickable
│  │ Date | Course | Time            │
│  └─────────────────────────────────┤
│                                     │
│  ┌─────────────────────────────────┤
│  │ Subscription Card (REMOVE THIS) │ ← TO BE REMOVED
│  │ Status | Type | Expiry          │
│  └─────────────────────────────────┤
└─────────────────────────────────────┘
```

---

## Desired Header Structure

**New Layout:**
```
┌─────────────────────────────────────┐
│  [Avatar]  Name        [Last Badge] │
│  Level indicator with points        │
│                                     │
│  ┌─────────────────────────────────┤
│  │ Next Reservation Card           │ ← Clickable
│  │ Date | Course | Time            │
│  └─────────────────────────────────┤
│                                     │
│  ┌─────────────────────────────────┤
│  │ 🏆 Badges: 5/12 Unlocked    →  │ ← NEW: Tab Effect
│  │ Progress: ████░░░░░░ 42%        │
│  └─────────────────────────────────┤
└─────────────────────────────────────┘
```

---

## Changes to Make

### 1. Remove Subscription Card from Header

**File:** `src/components/ui/DarkAppHeader.tsx`

- Remove `SubscriptionCard` component rendering
- Remove subscription data fetching (if any)
- Remove subscription-related props/state
- Clean up styling related to subscription card

### 2. Add Badges Tab Card

**File:** `src/components/ui/DarkAppHeader.tsx`

**New Component to Add:**
- Badge count display (X/Total)
- Progress bar showing percentage
- Arrow icon indicating navigation
- Clickable with navigation to Profile > Badges tab
- Uses NavigationContext to navigate

**Props Needed:**
- `badges`: Array of badges
- `userProgress`: User progress with badge stats
- `onNavigateToBadges`: Callback or direct navigation

---

## Navigation Integration

### Current Navigation System
- **Context:** `NavigationContext` provides `navigateToTab()`
- **Available:** Direct tab navigation via `setActiveTab('profile')`
- **Challenge:** Nested tab navigation (ProfileScreen has sub-tabs)

### Solution
1. Navigate to profile tab: `setActiveTab('profile')`
2. Inside ProfileScreen, set activeProfileTab to 'badges'
3. Pass navigation callback to header

**Implementation Options:**

**Option A: Direct Navigation (Simpler)**
```tsx
const { setActiveTab } = useNavigation()
const handleBadgesPress = () => {
  setActiveTab('profile')
  // Need way to set ProfileScreen sub-tab to 'badges'
}
```

**Option B: Use Navigation Context (Better)**
- Extend NavigationContext to handle profile sub-tabs
- Add `activeProfileTab` state
- Add `setActiveProfileTab()` function

**Recommended:** Option B - More flexible

---

## Implementation Steps

### Step 1: Update DarkAppHeader Component
- Remove SubscriptionCard rendering
- Remove subscription-related code
- Add new BadgesTapCard component
- Add navigation callback

### Step 2: Create BadgesTapCard Component (Optional)
Or inline the badges display in header:
```tsx
<TouchableOpacity
  onPress={onNavigateToBadges}
  style={styles.badgesCard}
>
  <View>
    <Text>🏆 Badges: {unlocked}/{total}</Text>
    <ProgressBar value={percentage} />
  </View>
  <Ionicons name="chevron-forward" />
</TouchableOpacity>
```

### Step 3: Update NavigationContext (if using Option B)
- Add `activeProfileTab` state
- Add `setActiveProfileTab()` function
- Make it accessible to header

### Step 4: Update MainApp.tsx
- Pass navigation callbacks to DarkAppHeader
- Connect badge tap to profile sub-tab navigation

### Step 5: Update ProfileScreen
- Subscribe to navigation context for sub-tab changes
- Set active tab when context changes

---

## Files to Modify

### Must Modify:
1. ✅ `src/components/ui/DarkAppHeader.tsx`
   - Remove subscription card
   - Add badges tap card
   - Add navigation handler

### May Modify:
2. ⚠️ `src/context/NavigationContext.tsx`
   - Add profile sub-tab state (if using Option B)

3. ⚠️ `src/features/main/screens/MainApp.tsx`
   - Pass callbacks to header

4. ⚠️ `src/features/profile/screens/ProfileScreen.tsx`
   - Listen for navigation context changes

### No Changes Needed:
- ✅ SubscriptionCard.tsx (still used in ProfileScreen)
- ✅ BadgesList.tsx (unchanged)
- ✅ Other components

---

## Visual Changes Summary

**Header Before:**
- Two action cards (Reservation, Subscription)
- Subscription shows payment status

**Header After:**
- Two action cards (Reservation, Badges)
- Badges shows count & progress with → indicator
- Tapping badges navigates to Profile > Badges tab

---

## Navigation Flow

### Current:
```
User taps badges → Opens profile tab → Manual switch to badges sub-tab
```

### After:
```
User taps header badges card → Navigates to profile + auto-switches to badges sub-tab
```

---

## Styling Considerations

**New Badges Card Styling:**
- Match existing card styling (Next Reservation)
- Trophy emoji/icon + label
- Progress bar
- Arrow indicator on right
- Hover/press feedback
- Dark mode compatible

---

## Testing Checklist

- [ ] Header compiles without errors
- [ ] Subscription card is completely removed
- [ ] New badges card displays correctly
- [ ] Badge count shows correct totals
- [ ] Progress bar calculates correctly
- [ ] Tapping badges card navigates to profile
- [ ] Profile tab opens with badges sub-tab active
- [ ] Arrow indicator is visible
- [ ] Works on different screen sizes
- [ ] Responsive design maintained
- [ ] Dark mode compatible

---

## Recommendation

**Use Option B (Context Enhancement)** because:
1. More flexible for future enhancements
2. Proper separation of concerns
3. Can be reused for other features
4. Cleaner than passing callbacks through multiple components
5. Enables deeper linking to profile sub-tabs

---

## Summary

Remove the subscription card from the header and replace it with an interactive badges card that:
- Shows badge count and progress
- Has visual indicator (arrow) for navigation
- Tapping it navigates to Profile > Badges tab
- Maintains consistent styling with existing cards
