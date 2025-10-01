# Database Migrations

## How to Apply Migrations

### Option 1: Supabase Dashboard (Recommended)

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Copy the contents of the migration file (e.g., `20251001_enable_rls_policies.sql`)
4. Paste into the SQL Editor
5. Click **Run** to execute

### Option 2: Supabase CLI

If you have the Supabase CLI installed:

```bash
supabase db push
```

## Available Migrations

### 20251001_enable_rls_policies.sql

**Purpose**: Enable Row Level Security (RLS) and create security policies for all tables

**Tables affected**:
- `profiles` - User profile data
- `courses` - Course schedule and details
- `reservations` - User course reservations
- `attendance` - Attendance tracking
- `notification_settings` - User notification preferences
- `notification_queue` - Notification queue

**Policies created**:
- **Profiles**: All authenticated users can read profiles, users can update their own
- **Courses**: All authenticated users can read, admins/instructors can manage
- **Reservations**: Users can manage their own, admins can view all
- **Attendance**: Users can view their own, admins/instructors can manage all
- **Notification Settings**: Users can manage their own settings
- **Notification Queue**: Users can view their own, admins can manage all

## Troubleshooting

### "permission denied for table" errors

This means RLS policies haven't been applied yet. Run the migration file in your Supabase SQL Editor.

### "policy already exists" errors

The policies are already in place. You can safely ignore these errors or drop existing policies first:

```sql
DROP POLICY IF EXISTS "policy_name" ON table_name;
```

### Testing RLS Policies

After applying migrations, test with:

```sql
-- Test as authenticated user
SELECT * FROM courses;  -- Should work
SELECT * FROM profiles; -- Should work
SELECT * FROM reservations WHERE user_id = auth.uid(); -- Should work
```
