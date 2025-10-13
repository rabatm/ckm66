-- =====================================================
-- FIX RESERVATIONS TABLE: Add missing subscription_id column
-- =====================================================
-- This migration adds the subscription_id column to the reservations table
-- if it doesn't exist, to match the TypeScript types
-- =====================================================

-- Add subscription_id column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'reservations'
    AND column_name = 'subscription_id'
    AND table_schema = 'public'
  ) THEN
    ALTER TABLE reservations
    ADD COLUMN subscription_id UUID REFERENCES subscriptions(id);

    -- Add index for performance
    CREATE INDEX IF NOT EXISTS idx_reservations_subscription_id ON reservations(subscription_id);

    RAISE NOTICE 'Added subscription_id column to reservations table';
  ELSE
    RAISE NOTICE 'subscription_id column already exists in reservations table';
  END IF;
END $$;

-- Add comment
COMMENT ON COLUMN reservations.subscription_id IS 'Reference to the subscription used for this reservation';