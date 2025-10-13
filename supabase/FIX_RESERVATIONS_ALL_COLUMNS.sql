-- =====================================================
-- FIX RESERVATIONS TABLE: Add all missing columns
-- =====================================================
-- This migration adds all missing columns to the reservations table
-- to match the TypeScript types and ensure database schema consistency
-- =====================================================

DO $$
DECLARE
    column_exists BOOLEAN;
BEGIN
    -- Add user_id column if it doesn't exist
    SELECT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'reservations'
        AND column_name = 'user_id'
        AND table_schema = 'public'
    ) INTO column_exists;

    IF NOT column_exists THEN
        ALTER TABLE reservations ADD COLUMN user_id UUID REFERENCES profiles(id);
        CREATE INDEX IF NOT EXISTS idx_reservations_user_id ON reservations(user_id);
        RAISE NOTICE 'Added user_id column to reservations table';
    ELSE
        RAISE NOTICE 'user_id column already exists';
    END IF;

    -- Add course_id column if it doesn't exist
    SELECT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'reservations'
        AND column_name = 'course_id'
        AND table_schema = 'public'
    ) INTO column_exists;

    IF NOT column_exists THEN
        ALTER TABLE reservations ADD COLUMN course_id UUID REFERENCES courses(id);
        CREATE INDEX IF NOT EXISTS idx_reservations_course_id ON reservations(course_id);
        RAISE NOTICE 'Added course_id column to reservations table';
    ELSE
        RAISE NOTICE 'course_id column already exists';
    END IF;

    -- Add course_instance_id column if it doesn't exist
    SELECT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'reservations'
        AND column_name = 'course_instance_id'
        AND table_schema = 'public'
    ) INTO column_exists;

    IF NOT column_exists THEN
        ALTER TABLE reservations ADD COLUMN course_instance_id UUID REFERENCES course_instances(id);
        CREATE INDEX IF NOT EXISTS idx_reservations_course_instance_id ON reservations(course_instance_id);
        RAISE NOTICE 'Added course_instance_id column to reservations table';
    ELSE
        RAISE NOTICE 'course_instance_id column already exists';
    END IF;

    -- Add status column if it doesn't exist
    SELECT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'reservations'
        AND column_name = 'status'
        AND table_schema = 'public'
    ) INTO column_exists;

    IF NOT column_exists THEN
        ALTER TABLE reservations ADD COLUMN status TEXT;
        RAISE NOTICE 'Added status column to reservations table';
    ELSE
        RAISE NOTICE 'status column already exists';
    END IF;

    -- Add reservation_date column if it doesn't exist
    SELECT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'reservations'
        AND column_name = 'reservation_date'
        AND table_schema = 'public'
    ) INTO column_exists;

    IF NOT column_exists THEN
        ALTER TABLE reservations ADD COLUMN reservation_date DATE;
        RAISE NOTICE 'Added reservation_date column to reservations table';
    ELSE
        RAISE NOTICE 'reservation_date column already exists';
    END IF;

    -- Add reserved_at column if it doesn't exist
    SELECT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'reservations'
        AND column_name = 'reserved_at'
        AND table_schema = 'public'
    ) INTO column_exists;

    IF NOT column_exists THEN
        ALTER TABLE reservations ADD COLUMN reserved_at TIMESTAMPTZ;
        RAISE NOTICE 'Added reserved_at column to reservations table';
    ELSE
        RAISE NOTICE 'reserved_at column already exists';
    END IF;

    -- Add cancelled_at column if it doesn't exist
    SELECT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'reservations'
        AND column_name = 'cancelled_at'
        AND table_schema = 'public'
    ) INTO column_exists;

    IF NOT column_exists THEN
        ALTER TABLE reservations ADD COLUMN cancelled_at TIMESTAMPTZ;
        RAISE NOTICE 'Added cancelled_at column to reservations table';
    ELSE
        RAISE NOTICE 'cancelled_at column already exists';
    END IF;

    -- Add cancellation_reason column if it doesn't exist
    SELECT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'reservations'
        AND column_name = 'cancellation_reason'
        AND table_schema = 'public'
    ) INTO column_exists;

    IF NOT column_exists THEN
        ALTER TABLE reservations ADD COLUMN cancellation_reason TEXT;
        RAISE NOTICE 'Added cancellation_reason column to reservations table';
    ELSE
        RAISE NOTICE 'cancellation_reason column already exists';
    END IF;

    -- Add session_deducted column if it doesn't exist
    SELECT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'reservations'
        AND column_name = 'session_deducted'
        AND table_schema = 'public'
    ) INTO column_exists;

    IF NOT column_exists THEN
        ALTER TABLE reservations ADD COLUMN session_deducted BOOLEAN DEFAULT false;
        RAISE NOTICE 'Added session_deducted column to reservations table';
    ELSE
        RAISE NOTICE 'session_deducted column already exists';
    END IF;

    -- Add sessions_deducted column if it doesn't exist
    SELECT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'reservations'
        AND column_name = 'sessions_deducted'
        AND table_schema = 'public'
    ) INTO column_exists;

    IF NOT column_exists THEN
        ALTER TABLE reservations ADD COLUMN sessions_deducted INTEGER DEFAULT 0;
        RAISE NOTICE 'Added sessions_deducted column to reservations table';
    ELSE
        RAISE NOTICE 'sessions_deducted column already exists';
    END IF;

    -- Add refund_amount column if it doesn't exist
    SELECT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'reservations'
        AND column_name = 'refund_amount'
        AND table_schema = 'public'
    ) INTO column_exists;

    IF NOT column_exists THEN
        ALTER TABLE reservations ADD COLUMN refund_amount INTEGER;
        RAISE NOTICE 'Added refund_amount column to reservations table';
    ELSE
        RAISE NOTICE 'refund_amount column already exists';
    END IF;

    -- Add attended column if it doesn't exist
    SELECT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'reservations'
        AND column_name = 'attended'
        AND table_schema = 'public'
    ) INTO column_exists;

    IF NOT column_exists THEN
        ALTER TABLE reservations ADD COLUMN attended BOOLEAN;
        RAISE NOTICE 'Added attended column to reservations table';
    ELSE
        RAISE NOTICE 'attended column already exists';
    END IF;

    -- Add check_in_time column if it doesn't exist
    SELECT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'reservations'
        AND column_name = 'check_in_time'
        AND table_schema = 'public'
    ) INTO column_exists;

    IF NOT column_exists THEN
        ALTER TABLE reservations ADD COLUMN check_in_time TIMESTAMPTZ;
        RAISE NOTICE 'Added check_in_time column to reservations table';
    ELSE
        RAISE NOTICE 'check_in_time column already exists';
    END IF;

    -- Add check_out_time column if it doesn't exist
    SELECT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'reservations'
        AND column_name = 'check_out_time'
        AND table_schema = 'public'
    ) INTO column_exists;

    IF NOT column_exists THEN
        ALTER TABLE reservations ADD COLUMN check_out_time TIMESTAMPTZ;
        RAISE NOTICE 'Added check_out_time column to reservations table';
    ELSE
        RAISE NOTICE 'check_out_time column already exists';
    END IF;

    -- Add notes column if it doesn't exist
    SELECT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'reservations'
        AND column_name = 'notes'
        AND table_schema = 'public'
    ) INTO column_exists;

    IF NOT column_exists THEN
        ALTER TABLE reservations ADD COLUMN notes TEXT;
        RAISE NOTICE 'Added notes column to reservations table';
    ELSE
        RAISE NOTICE 'notes column already exists';
    END IF;

    -- Add subscription_id column if it doesn't exist
    SELECT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'reservations'
        AND column_name = 'subscription_id'
        AND table_schema = 'public'
    ) INTO column_exists;

    IF NOT column_exists THEN
        ALTER TABLE reservations ADD COLUMN subscription_id UUID REFERENCES subscriptions(id);
        CREATE INDEX IF NOT EXISTS idx_reservations_subscription_id ON reservations(subscription_id);
        RAISE NOTICE 'Added subscription_id column to reservations table';
    ELSE
        RAISE NOTICE 'subscription_id column already exists';
    END IF;

    -- Add waiting_list_position column if it doesn't exist
    SELECT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'reservations'
        AND column_name = 'waiting_list_position'
        AND table_schema = 'public'
    ) INTO column_exists;

    IF NOT column_exists THEN
        ALTER TABLE reservations ADD COLUMN waiting_list_position INTEGER;
        RAISE NOTICE 'Added waiting_list_position column to reservations table';
    ELSE
        RAISE NOTICE 'waiting_list_position column already exists';
    END IF;

    -- Add promoted_at column if it doesn't exist
    SELECT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'reservations'
        AND column_name = 'promoted_at'
        AND table_schema = 'public'
    ) INTO column_exists;

    IF NOT column_exists THEN
        ALTER TABLE reservations ADD COLUMN promoted_at TIMESTAMPTZ;
        RAISE NOTICE 'Added promoted_at column to reservations table';
    ELSE
        RAISE NOTICE 'promoted_at column already exists';
    END IF;

    -- Add promoted_from_waiting_at column if it doesn't exist
    SELECT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'reservations'
        AND column_name = 'promoted_from_waiting_at'
        AND table_schema = 'public'
    ) INTO column_exists;

    IF NOT column_exists THEN
        ALTER TABLE reservations ADD COLUMN promoted_from_waiting_at TIMESTAMPTZ;
        RAISE NOTICE 'Added promoted_from_waiting_at column to reservations table';
    ELSE
        RAISE NOTICE 'promoted_from_waiting_at column already exists';
    END IF;

    -- Add promotion_reason column if it doesn't exist
    SELECT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'reservations'
        AND column_name = 'promotion_reason'
        AND table_schema = 'public'
    ) INTO column_exists;

    IF NOT column_exists THEN
        ALTER TABLE reservations ADD COLUMN promotion_reason TEXT;
        RAISE NOTICE 'Added promotion_reason column to reservations table';
    ELSE
        RAISE NOTICE 'promotion_reason column already exists';
    END IF;

    -- Add last_notification_date column if it doesn't exist
    SELECT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'reservations'
        AND column_name = 'last_notification_date'
        AND table_schema = 'public'
    ) INTO column_exists;

    IF NOT column_exists THEN
        ALTER TABLE reservations ADD COLUMN last_notification_date TIMESTAMPTZ;
        RAISE NOTICE 'Added last_notification_date column to reservations table';
    ELSE
        RAISE NOTICE 'last_notification_date column already exists';
    END IF;

    -- Add notification_sent column if it doesn't exist
    SELECT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'reservations'
        AND column_name = 'notification_sent'
        AND table_schema = 'public'
    ) INTO column_exists;

    IF NOT column_exists THEN
        ALTER TABLE reservations ADD COLUMN notification_sent BOOLEAN DEFAULT false;
        RAISE NOTICE 'Added notification_sent column to reservations table';
    ELSE
        RAISE NOTICE 'notification_sent column already exists';
    END IF;

END $$;

-- Add comments for documentation
COMMENT ON COLUMN reservations.user_id IS 'Reference to the user who made the reservation';
COMMENT ON COLUMN reservations.course_id IS 'Reference to the course (for one-time courses)';
COMMENT ON COLUMN reservations.course_instance_id IS 'Reference to the course instance (for recurring courses)';
COMMENT ON COLUMN reservations.status IS 'Reservation status: confirmed, waiting_list, cancelled, completed';
COMMENT ON COLUMN reservations.reservation_date IS 'Date of the reservation (for historical purposes)';
COMMENT ON COLUMN reservations.reserved_at IS 'Timestamp when reservation was confirmed';
COMMENT ON COLUMN reservations.cancelled_at IS 'Timestamp when reservation was cancelled';
COMMENT ON COLUMN reservations.cancellation_reason IS 'Reason for cancellation';
COMMENT ON COLUMN reservations.session_deducted IS 'Whether a session was deducted from subscription';
COMMENT ON COLUMN reservations.sessions_deducted IS 'Number of sessions deducted from subscription';
COMMENT ON COLUMN reservations.refund_amount IS 'Number of sessions refunded';
COMMENT ON COLUMN reservations.attended IS 'Whether the user attended the course';
COMMENT ON COLUMN reservations.check_in_time IS 'Time when user checked in';
COMMENT ON COLUMN reservations.check_out_time IS 'Time when user checked out';
COMMENT ON COLUMN reservations.notes IS 'Additional notes for the reservation';
COMMENT ON COLUMN reservations.subscription_id IS 'Reference to the subscription used for this reservation';
COMMENT ON COLUMN reservations.waiting_list_position IS 'Position in waiting list (NULL if confirmed)';
COMMENT ON COLUMN reservations.promoted_at IS 'Timestamp when reservation was promoted from waiting list';
COMMENT ON COLUMN reservations.promoted_from_waiting_at IS 'Legacy field for promotion tracking';
COMMENT ON COLUMN reservations.promotion_reason IS 'Reason for promotion from waiting list';
COMMENT ON COLUMN reservations.last_notification_date IS 'Last time a notification was sent for this reservation';
COMMENT ON COLUMN reservations.notification_sent IS 'Whether notifications have been sent for this reservation';