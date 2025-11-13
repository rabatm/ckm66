# Create RPC Functions for Reservation Management

## Problem
The app is trying to call RPC functions that don't exist yet:
- `increment_instance_reservations(instance_id)`
- `decrement_instance_reservations(instance_id)`
- `count_confirmed_reservations(instance_id)`

These functions need to be created manually in Supabase because migrations couldn't be applied.

## Solution
Execute the SQL below in Supabase SQL Editor to create all three RPC functions.

## Setup Instructions

### Step 1: Open Supabase SQL Editor
1. Go to [https://app.supabase.com](https://app.supabase.com)
2. Select your **CKM66** project
3. Click **SQL Editor** in the left sidebar
4. Click **New Query**

### Step 2: Copy & Paste All Three Functions

```sql
-- =====================================================
-- RPC FUNCTION 1: Increment Reservations
-- =====================================================
CREATE OR REPLACE FUNCTION increment_instance_reservations(instance_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE course_instances
  SET
    current_reservations = current_reservations + 1,
    updated_at = NOW()
  WHERE id = instance_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- RPC FUNCTION 2: Decrement Reservations
-- =====================================================
CREATE OR REPLACE FUNCTION decrement_instance_reservations(instance_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE course_instances
  SET
    current_reservations = GREATEST(current_reservations - 1, 0),
    updated_at = NOW()
  WHERE id = instance_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- RPC FUNCTION 3: Count Confirmed Reservations
-- =====================================================
CREATE OR REPLACE FUNCTION count_confirmed_reservations(instance_id UUID)
RETURNS INT AS $$
DECLARE
  v_count INT;
BEGIN
  SELECT COUNT(*)
  INTO v_count
  FROM reservations
  WHERE course_instance_id = instance_id
    AND status = 'confirmed';

  RETURN COALESCE(v_count, 0);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- Grant Permissions
-- =====================================================
GRANT EXECUTE ON FUNCTION increment_instance_reservations(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION decrement_instance_reservations(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION count_confirmed_reservations(UUID) TO authenticated;

-- =====================================================
-- Create RLS Policy for Counting
-- =====================================================
CREATE POLICY "Authenticated users can count reservations for availability"
  ON reservations
  FOR SELECT
  TO authenticated
  USING (TRUE);
```

### Step 3: Click **Run** ▶️

You should see:
```
CREATE FUNCTION
CREATE FUNCTION
CREATE FUNCTION
GRANT
GRANT
GRANT
CREATE POLICY
```

### Step 4: Test the Functions

Optional - verify functions exist:

```sql
-- Check if functions are created
SELECT routine_name, routine_type
FROM information_schema.routines
WHERE routine_schema = 'public'
  AND routine_name LIKE '%reservations%'
  OR routine_name = 'count_confirmed_reservations';
```

Expected output:
```
increment_instance_reservations        FUNCTION
decrement_instance_reservations        FUNCTION
count_confirmed_reservations           FUNCTION
```

### Step 5: Restart Your Mobile App

Kill and restart the app. The booking flow should now work without errors.

## What Each Function Does

### 1. `increment_instance_reservations(instance_id)`
- Called when user makes a confirmed reservation
- Adds 1 to `current_reservations`
- Updates timestamp
- **Fixes:** Reserve button working, count updating

### 2. `decrement_instance_reservations(instance_id)`
- Called when user cancels a confirmed reservation
- Subtracts 1 from `current_reservations` (never goes below 0)
- Updates timestamp
- **Fixes:** Cancel button working, count updating

### 3. `count_confirmed_reservations(instance_id)`
- Returns exact count of confirmed reservations
- Used by app to verify badge count
- Bypasses RLS restrictions
- **Fixes:** Badge showing accurate available places

## Why SECURITY DEFINER?

```sql
SECURITY DEFINER
```

This privilege means:
- ✅ Function runs with database owner privileges
- ✅ Bypasses RLS restrictions
- ✅ Safe because we control the function logic
- ✅ Can update instance counts even though users can't

## Troubleshooting

### Functions still not found
1. Refresh Supabase browser page (Ctrl+Shift+R)
2. Check functions exist:
   ```sql
   SELECT * FROM information_schema.routines
   WHERE routine_schema = 'public';
   ```
3. Restart mobile app completely

### "Policy already exists" error
This is fine - it means the policy was already created. The functions will still work.

### Booking still fails
Check mobile console for the exact error. If it says the function doesn't exist:
1. Verify you ran all the SQL above
2. Make sure it executed successfully (no errors)
3. Wait 10 seconds and try again (schema cache delay)

## Related Setup Guides

1. **Trigger (RECOMMENDED):** `RESERVATION_COUNT_TRIGGER.md`
   - Automatically updates count
   - No app calls needed

2. **RPC Functions:** This file
   - Manual app calls
   - Works as backup

3. **Count Function:** `FIX_PLACES_INDICATOR.md`
   - Shows accurate available places
   - Alternative to trigger

## Order of Setup (Complete Solution)

To fully fix the places indicator issue, apply in this order:

1. ✅ **Create RPC Functions** (this file) - Required for booking
2. ✅ **Create Count Function** (FIX_PLACES_INDICATOR.md) - For accurate badge
3. ✅ **Create Trigger** (RESERVATION_COUNT_TRIGGER.md) - For auto-updates

This gives you:
- Working booking flow
- Accurate place counts
- Automatic synchronization

Or you can just do #1 and #3 (skip #2 since trigger does counting too).
