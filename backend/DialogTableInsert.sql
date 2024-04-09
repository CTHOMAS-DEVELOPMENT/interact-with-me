DROP TRIGGER IF EXISTS new_post_trigger ON submission_dialog;
DROP FUNCTION IF EXISTS notify_new_post();

CREATE OR REPLACE FUNCTION notify_new_post()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM pg_notify('new_post', row_to_json(NEW)::text);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER new_post_trigger
AFTER INSERT ON submission_dialog
FOR EACH ROW EXECUTE FUNCTION notify_new_post();
