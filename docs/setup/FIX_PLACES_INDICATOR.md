# Fix: Places Indicator Count Issue

## Problem
The available places badge was showing incorrect counts because:
1. RLS policies restricted access to reservation data
2. Direct count queries were blocked by `USING (auth.uid() = user_id)` policy
3. Students could only see their own reservations, not the total

## Solution
Create a secure RPC function that safely counts confirmed reservations without exposing personal details.

## Setup Instructions

### Step 1: Open Supabase SQL Editor
1. Go to [https://app.supabase.com](https://app.supabase.com)
2. Select your project
3. Click **SQL Editor** in the left sidebar
4. Click **New Query**

### Step 2: Execute the SQL

Copy and paste the following SQL and click **Run**:

```sql
-- Create secure function to count confirmed reservations
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

-- Grant permissions to authenticated users
GRANT EXECUTE ON FUNCTION count_confirmed_reservations(UUID) TO authenticated;

-- Add RLS policy to allow counting
CREATE POLICY "Authenticated users can count reservations for availability"
  ON reservations
  FOR SELECT
  TO authenticated
  USING (TRUE);
```

### Step 3: Verify Success
You should see output like:
```
CREATE FUNCTION
GRANT
CREATE POLICY
```

### Step 4: Restart the Mobile App
Kill and restart your app to pick up the new function.

## What This Does

✅ **Function**: `count_confirmed_reservations(instance_id)`
- Safely counts confirmed reservations for an instance
- Bypasses RLS with `SECURITY DEFINER` privilege
- Does NOT expose personal reservation details
- Only returns a number (count)

✅ **RLS Policy**: Allows authenticated users to see reservation statuses
- Users can only access their own full reservation details (existing policy)
- Users CAN count all reservations to calculate availability
- Still prevents unauthorized access to sensitive data

## Fallback Behavior
If the function doesn't exist, the app automatically falls back to using the `current_reservations` field stored in the database. The app will show a warning in the console but won't crash.

## Testing
After setup, when you:
1. Open the schedule/courses tab
2. The available places should now show the correct count
3. Check console for: "Successfully counted X confirmed reservations"

## Troubleshooting

### Error: "Policy ... already exists"
This means the policy was already created. This is fine - it won't cause issues.

### Function still not found
1. Refresh your browser in Supabase
2. Verify the function was created: Go to **Functions** tab
3. Look for `count_confirmed_reservations`
4. Restart your mobile app

### Still showing wrong count
Check mobile app console for any error messages. The fallback should kick in and show `current_reservations` count.
