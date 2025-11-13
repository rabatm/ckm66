# Setup Priority Guide

## Current Status
You're getting booking errors because RPC functions don't exist. Here's the priority order to fix everything:

## Priority 1 (DO THIS FIRST) 🔴 URGENT
**Create RPC Functions** - Booking is broken without these!

See: `CREATE_RPC_FUNCTIONS.md`

What it fixes:
- ✅ Users can book courses
- ✅ Users can cancel reservations
- ✅ `current_reservations` field updates

Time: 2 minutes
Impact: Critical (booking feature)

### SQL to Run:
1. Go to Supabase SQL Editor
2. Create these 3 functions:
   - `increment_instance_reservations(instance_id)`
   - `decrement_instance_reservations(instance_id)`
   - `count_confirmed_reservations(instance_id)`
3. Click Run

After this: **Booking will work!**

---

## Priority 2 (DO THIS SECOND) 🟡 HIGH
**Create Auto-Update Trigger** - Keeps counts accurate automatically

See: `RESERVATION_COUNT_TRIGGER.md`

What it fixes:
- ✅ Available places count always accurate
- ✅ No manual increment/decrement needed
- ✅ Database stays in sync automatically

Time: 2 minutes
Impact: Automatic synchronization

### SQL to Run:
1. Go to Supabase SQL Editor (new query)
2. Create trigger function: `update_instance_reservations_count()`
3. Create 3 triggers:
   - `trigger_reservation_created`
   - `trigger_reservation_updated`
   - `trigger_reservation_deleted`
4. Recalculate existing counts
5. Click Run

After this: **Counts stay in sync automatically!**

---

## Priority 3 (OPTIONAL) 🟢 NICE-TO-HAVE
**Create Count Function** - Shows accurate available places in badge

See: `FIX_PLACES_INDICATOR.md`

What it fixes:
- ✅ Badge shows real-time confirmed count
- ✅ Counts bypass RLS restrictions

Time: 2 minutes
Impact: Better accuracy (optional if you have trigger)

**Note:** The trigger already keeps counts accurate, so this is optional.

---

## Quick Summary

### DO NOW (Fixes Booking) ⚡
```
Priority 1: CREATE RPC FUNCTIONS
  → increment_instance_reservations
  → decrement_instance_reservations
  → count_confirmed_reservations
```

**After this, booking will work!**

### THEN (Keeps Data Synced) 🔄
```
Priority 2: CREATE TRIGGER
  → update_instance_reservations_count (function)
  → 3 triggers (INSERT, UPDATE, DELETE)
```

**After this, counts stay in sync automatically!**

### OPTIONAL (Extra Accuracy) 📊
```
Priority 3: COUNT FUNCTION (skip if you have trigger)
  → count_confirmed_reservations
```

---

## Testing After Setup

### After Priority 1 (RPC Functions)
Test booking:
1. Open Schedule tab
2. Click "Réserver" button
3. Confirm booking
4. Should see success message
5. If error gone → ✅ Success!

### After Priority 2 (Trigger)
Test auto-update:
1. Make a booking
2. Check console logs
3. Should show "updated instance..."
4. Refresh page
5. Count should match actual reservations

### After Priority 3 (Count Function)
Test badge:
1. Open Schedule tab
2. Check available places badge
3. Should show accurate count
4. Make a booking
5. Badge should update

---

## All Files Explained

| File | Purpose | Priority |
|------|---------|----------|
| `CREATE_RPC_FUNCTIONS.md` | Create 3 RPC functions | 1️⃣ DO THIS FIRST |
| `RESERVATION_COUNT_TRIGGER.md` | Auto-update trigger | 2️⃣ DO THIS SECOND |
| `FIX_PLACES_INDICATOR.md` | Count function | 3️⃣ OPTIONAL |

---

## What You Have vs What You Need

### ✅ Already Implemented in App Code
- Booking logic
- Cancellation logic
- Real-time count queries
- RPC function calls
- Trigger handling

### ❌ Missing in Database
- RPC functions (Priority 1)
- Trigger function (Priority 2)
- Count function (Priority 3)

### Solution
Just execute the SQL in each file and everything works!

---

## Fastest Path (Just Get Booking Working)

If you only care about booking working **right now**:

1. Open Supabase SQL Editor
2. Run SQL from `CREATE_RPC_FUNCTIONS.md` (Priority 1)
3. Restart app
4. Done! ✅

Then later when you have time:
- Add trigger for auto-sync
- Add count function for badge accuracy

---

## Questions?

All three files have detailed setup instructions, troubleshooting, and explanations.

Start with: **CREATE_RPC_FUNCTIONS.md** (Priority 1)
