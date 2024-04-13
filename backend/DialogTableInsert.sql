-- Drop existing trigger and function, if they exist
DROP TRIGGER IF EXISTS new_post_trigger ON submission_dialog;
DROP FUNCTION IF EXISTS notify_new_post();

-- Create or replace the function to handle notifications
CREATE OR REPLACE FUNCTION notify_new_post()
RETURNS TRIGGER AS $$
BEGIN
  -- Check the type of operation and perform accordingly
  IF (TG_OP = 'DELETE') THEN
    -- For DELETE, use OLD to get the row being deleted
    PERFORM pg_notify('new_post', row_to_json(OLD)::text);
    RETURN OLD;
  ELSE
    -- For INSERT and UPDATE, use NEW to get the inserted or updated row
    PERFORM pg_notify('new_post', row_to_json(NEW)::text);
    RETURN NEW;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Create a trigger that fires on INSERT, UPDATE, and DELETE
CREATE TRIGGER new_post_trigger
AFTER INSERT OR UPDATE OR DELETE ON submission_dialog
FOR EACH ROW EXECUTE FUNCTION notify_new_post();
