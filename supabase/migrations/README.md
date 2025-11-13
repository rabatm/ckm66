# Database Migrations

This directory contains all database migrations for the CKM mobile app.

## Active Migrations

These migrations are currently applied to the database:

### October 1, 2025

- `20251001_enable_rls_policies.sql` - Initial RLS setup

### October 2, 2025

- `20251002_create_badges_system.sql` - Badge system foundation

### October 3, 2025

Core system migrations:

- `20251003_add_first_login_badge.sql` - First login badge
- `20251003_auto_check_badges.sql` - Automatic badge checking
- `20251003_auto_create_profile.sql` - Profile auto-creation
- `20251003_create_booking_system_v2.sql` - Booking system v2
- `20251003_create_course_instances.sql` - Course instances
- `20251003_create_profile_pictures_storage.sql` - Profile picture storage
- `20251003_create_subscriptions.sql` - Subscription system

Fixes and optimizations:

- `20251003_debug_first_login_badge.sql` - Badge debugging
- `20251003_debug_users_table.sql` - Users table debugging
- `20251003_fix_calculate_level_bigint.sql` - Level calculation fix
- `20251003_fix_check_badges_function.sql` - Badge function fix
- `20251003_fix_courses_time_columns.sql` - Course time columns fix
- `20251003_fix_profiles_insert_policy.sql` - Profile insert policy fix
- `20251003_fix_users_permissions.sql` - User permissions fix
- `20251003_grant_auth_permissions.sql` - Auth permissions

### October 10, 2025

- `20251010_add_one_time_courses_support.sql` - One-time courses feature

### October 23, 2025

Push notifications and reminders:

- `20251023_add_course_reminders.sql` - Course reminder system
- `20251023_add_notification_preferences.sql` - Notification preferences
- `20251023_push_notifications_final.sql` - **Final push notifications implementation**

## Archived Migrations

The `archived/` folder contains old versions of migrations that were superseded:

- `20251023_push_notifications_minimal.sql` - Initial attempt
- `20251023_add_push_notifications_support.sql` - Second iteration
- `20251023_push_notifications_v2.sql` - Third iteration

These are kept for reference but should not be used.

## Applying Migrations

To apply migrations to your local database:

```bash
npx supabase db reset
```

To create a new migration:

```bash
npx supabase migration new <migration_name>
```

To check migration status:

```bash
npx supabase migration list
```

## Migration Guidelines

1. **Naming Convention**: `YYYYMMDD_descriptive_name.sql`
2. **Idempotency**: Always use `IF NOT EXISTS` or `IF EXISTS` clauses
3. **Documentation**: Include comments explaining what the migration does
4. **Testing**: Test migrations locally before pushing to production
5. **Rollback**: Consider providing rollback instructions in comments

## Utility Scripts

SQL utility scripts for testing and maintenance are located in `../utilities/`:

- `APPLY_SUBSCRIPTIONS.sql` - Apply subscriptions to users
- `COMPLETE_SETUP.sql` - Complete database setup
- `CREATE_FREE_TRIALS_TRIGGER.sql` - Free trial trigger
- `FIX_DATABASE_SCHEMA.sql` - Schema fixes
- `FIX_LEVEL_CALCULATION.sql` - Level calculation fixes
- `TEST_COURSES_DATA.sql` - Test course data
- `TEST_RESERVATIONS.sql` - Test reservations
- `TEST_SUBSCRIPTIONS.sql` - Test subscriptions
- And more...

These scripts are for development/testing purposes and should not be run in production without review.
