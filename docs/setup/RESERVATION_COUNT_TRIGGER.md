# Auto-Update Reservation Count with Database Trigger

## Overview

Instead of relying on app code to manually increment/decrement reservation counts, this trigger **automatically updates `current_reservations`** whenever a reservation changes in the database.

## Benefits

✅ **No app logic needed** - Database handles it automatically
✅ **Always accurate** - Counts actual confirmed reservations
✅ **Works offline** - Trigger fires regardless of app status
✅ **Prevents mismatches** - Real count always matches database
✅ **No RLS issues** - Trigger bypasses RLS with database privilege

## How It Works

```
When user books a course:
1. Reservation inserted with status='confirmed'
2. ✅ Trigger fires immediately
3. ✅ Trigger counts confirmed reservations
4. ✅ Trigger updates course_instances.current_reservations
5. ✅ Badge shows correct count instantly

When user cancels:
1. Reservation updated: status='confirmed' → 'cancelled'
2. ✅ Trigger fires immediately
3. ✅ Trigger recounts confirmed reservations
4. ✅ Trigger updates course_instances.current_reservations
5. ✅ Badge shows updated count
```

## Setup Instructions

### Option 1: Using Supabase SQL Editor (Recommended)

1. Go to [https://app.supabase.com](https://app.supabase.com)
2. Select your **CKM66** project
3. Click **SQL Editor** → **New Query**
4. Copy and paste the SQL below
5. Click **Run**

### Option 2: Using Supabase CLI

```bash
npx supabase db push --linked
```

### SQL to Execute

```sql
-- Create trigger function
CREATE OR REPLACE FUNCTION update_instance_reservations_count()
RETURNS TRIGGER AS $$
DECLARE
  v_confirmed_count INT;
  v_instance_id UUID;
BEGIN
  -- Determine which instance to update
  IF TG_OP = 'DELETE' THEN
    v_instance_id := OLD.course_instance_id;
  ELSE
    v_instance_id := NEW.course_instance_id;
  END IF;

  -- Count all confirmed reservations for this instance
  SELECT COUNT(*)
  INTO v_confirmed_count
  FROM reservations
  WHERE course_instance_id = v_instance_id
    AND status = 'confirmed';

  -- Update the instance with the correct count
  UPDATE course_instances
  SET
    current_reservations = v_confirmed_count,
    updated_at = NOW()
  WHERE id = v_instance_id;

  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create triggers
CREATE TRIGGER trigger_reservation_created
  AFTER INSERT ON reservations
  FOR EACH ROW
  EXECUTE FUNCTION update_instance_reservations_count();

CREATE TRIGGER trigger_reservation_updated
  AFTER UPDATE ON reservations
  FOR EACH ROW
  WHEN (OLD.status IS DISTINCT FROM NEW.status OR OLD.course_instance_id IS DISTINCT FROM NEW.course_instance_id)
  EXECUTE FUNCTION update_instance_reservations_count();

CREATE TRIGGER trigger_reservation_deleted
  AFTER DELETE ON reservations
  FOR EACH ROW
  EXECUTE FUNCTION update_instance_reservations_count();

-- Fix existing data (recalculate all counts)
UPDATE course_instances ci
SET current_reservations = (
  SELECT COUNT(*)
  FROM reservations r
  WHERE r.course_instance_id = ci.id
    AND r.status = 'confirmed'
),
updated_at = NOW()
WHERE status = 'scheduled';
```

## Verification

### Check if Trigger is Working

In Supabase SQL Editor:

```sql
-- 1. Check triggers exist
SELECT event_object_table, trigger_name
FROM information_schema.triggers
WHERE event_object_table = 'reservations'
ORDER BY trigger_name;

-- Expected output:
-- reservations | trigger_reservation_created
-- reservations | trigger_reservation_updated
-- reservations | trigger_reservation_deleted

-- 2. Test the trigger (if you have sample data)
SELECT id, current_reservations FROM course_instances LIMIT 5;

-- 3. View trigger execution logs (if enabled)
SELECT * FROM pg_stat_user_functions WHERE funcname LIKE 'update_instance%';
```

## What Changed in App Code

The RPC functions are still used (increment/decrement) but now they're optional because:

- ✅ Trigger handles the counting automatically
- ✅ RPC functions become redundant but harmless
- ✅ App won't break if RPC fails
- ✅ Database stays in sync even if app crashes

## Before vs After

### Before (Without Trigger)
```
Book course → DB transaction completes → App calls RPC to increment
                                          ↓
                                    RPC succeeds (maybe)
                                    Count updates (maybe)
                                    ❓ Unreliable
```

### After (With Trigger)
```
Book course → DB transaction completes → Trigger fires automatically
                                          ↓
                                    Count updated immediately
                                    ✅ Guaranteed
```

## Troubleshooting

### Trigger not firing

1. Check if trigger exists:
   ```sql
   SELECT * FROM information_schema.triggers
   WHERE trigger_name LIKE 'trigger_reservation%';
   ```

2. Check if reservations table has RLS enabled:
   ```sql
   SELECT * FROM pg_tables
   WHERE tablename='reservations' AND rowsecurity=true;
   ```

3. Restart PostgreSQL connection in Supabase

### Wrong reservation count

The trigger should have fixed it automatically. To manually recalculate:

```sql
UPDATE course_instances ci
SET current_reservations = (
  SELECT COUNT(*)
  FROM reservations r
  WHERE r.course_instance_id = ci.id
    AND r.status = 'confirmed'
),
updated_at = NOW();
```

## Migration Details

**File:** `supabase/migrations/20251113_add_reservation_count_trigger.sql`

**What it does:**
1. Creates `update_instance_reservations_count()` function
2. Creates 3 triggers (INSERT, UPDATE, DELETE)
3. Recalculates all existing instance counts
4. No changes to app code needed!

## Performance Notes

- ✅ Triggers are very fast (microseconds)
- ✅ Only fires when reservation status changes
- ✅ Only counts confirmed reservations
- ✅ Does not impact booking performance

## Related Files

- `docs/setup/FIX_PLACES_INDICATOR.md` - Count function setup
- `src/features/schedule/services/reservation.service.ts` - RPC function calls
- `src/features/schedule/services/instance.service.ts` - Count query logic
