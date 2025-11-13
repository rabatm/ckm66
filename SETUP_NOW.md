# ⚡ URGENT: Run This SQL NOW to Fix Booking

Your booking is failing because 3 RPC functions are missing from the database.

## 🚨 DO THIS RIGHT NOW (2 minutes)

### Step 1: Open Supabase SQL Editor
- Go to https://app.supabase.com
- Select **CKM66** project
- Click **SQL Editor** → **New Query**

### Step 2: Copy & Paste This SQL

```sql
-- Create RPC functions that app is trying to call
CREATE OR REPLACE FUNCTION increment_instance_reservations(instance_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE course_instances
  SET current_reservations = current_reservations + 1, updated_at = NOW()
  WHERE id = instance_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION decrement_instance_reservations(instance_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE course_instances
  SET current_reservations = GREATEST(current_reservations - 1, 0), updated_at = NOW()
  WHERE id = instance_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION count_confirmed_reservations(instance_id UUID)
RETURNS INT AS $$
DECLARE v_count INT;
BEGIN
  SELECT COUNT(*) INTO v_count FROM reservations
  WHERE course_instance_id = instance_id AND status = 'confirmed';
  RETURN COALESCE(v_count, 0);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION increment_instance_reservations(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION decrement_instance_reservations(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION count_confirmed_reservations(UUID) TO authenticated;

CREATE POLICY "Authenticated users can count reservations"
  ON reservations FOR SELECT TO authenticated USING (TRUE);
```

### Step 3: Click **Run** ▶️

### Step 4: Restart Your Mobile App

**Done! Booking should work now!** ✅

---

## Next Steps (Optional but Recommended)

After booking works, set up automatic count updates:

**See:** `docs/setup/RESERVATION_COUNT_TRIGGER.md`

This adds a trigger that automatically keeps reservation counts accurate.

---

## Need Help?

- Full details: `docs/setup/CREATE_RPC_FUNCTIONS.md`
- Priority guide: `docs/setup/SETUP_PRIORITY.md`
- Trigger setup: `docs/setup/RESERVATION_COUNT_TRIGGER.md`
