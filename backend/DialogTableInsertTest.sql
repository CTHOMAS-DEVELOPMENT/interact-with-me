DROP TRIGGER IF EXISTS new_post_trigger ON submission_dialog;
DROP FUNCTION IF EXISTS notify_new_post();

CREATE OR REPLACE FUNCTION notify_new_post()
RETURNS TRIGGER AS $$
DECLARE
  operation_type text;
  data_to_send json;
BEGIN
  -- Determine the operation type and construct the payload
  IF TG_OP = 'INSERT' THEN
    operation_type := 'INSERT';
    data_to_send := row_to_json(NEW);
  ELSIF TG_OP = 'UPDATE' THEN
    operation_type := 'UPDATE';
    data_to_send := json_build_object('old', row_to_json(OLD), 'new', row_to_json(NEW));
  ELSIF TG_OP = 'DELETE' THEN
    operation_type := 'DELETE';
    data_to_send := row_to_json(OLD);
  END IF;

  -- Send the notification
  PERFORM pg_notify('new_post', json_build_object('operation', operation_type, 'data', data_to_send)::text);

  -- Return the appropriate row
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;



CREATE TRIGGER new_post_trigger
AFTER INSERT OR UPDATE OR DELETE ON submission_dialog
FOR EACH ROW EXECUTE FUNCTION notify_new_post();

