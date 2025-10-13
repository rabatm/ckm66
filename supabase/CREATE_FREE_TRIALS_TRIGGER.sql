-- Trigger to automatically decrement free trials when a guest makes a reservation
-- This trigger fires after inserting a reservation with is_free_trial = true and status = 'confirmed'

CREATE OR REPLACE FUNCTION decrement_guest_free_trials()
RETURNS TRIGGER AS $$
BEGIN
  -- Only decrement if this is a confirmed free trial reservation
  IF NEW.is_free_trial = true AND NEW.status = 'confirmed' THEN
    -- Decrement free_trials_remaining for the user
    UPDATE profiles
    SET free_trials_remaining = GREATEST(free_trials_remaining - 1, 0)
    WHERE id = NEW.user_id AND role = 'guest';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create the trigger
DROP TRIGGER IF EXISTS trigger_decrement_guest_free_trials ON reservations;
CREATE TRIGGER trigger_decrement_guest_free_trials
  AFTER INSERT ON reservations
  FOR EACH ROW
  EXECUTE FUNCTION decrement_guest_free_trials();