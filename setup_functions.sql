-- Create a function to add emails to queue and update approval status atomically
CREATE OR REPLACE FUNCTION add_emails_to_queue_and_update_approval(
  p_approval_id UUID,
  p_approver_id UUID,
  p_recipients TEXT[],
  p_subject TEXT,
  p_content TEXT
) RETURNS JSONB AS $$
DECLARE
  v_recipient TEXT;
  v_result JSONB;
BEGIN
  -- 1. Update approval status
  UPDATE email_approvals
  SET 
    status = 'approved',
    approver_id = p_approver_id,
    approved_at = CURRENT_TIMESTAMP
  WHERE id = p_approval_id;

  -- 2. Insert emails into queue
  FOREACH v_recipient IN ARRAY p_recipients
  LOOP
    INSERT INTO email_queue (
      approval_id,
      recipient,
      subject,
      content,
      status,
      created_at,
      updated_at
    ) VALUES (
      p_approval_id,
      v_recipient,
      p_subject,
      p_content,
      'pending',
      CURRENT_TIMESTAMP,
      CURRENT_TIMESTAMP
    );
  END LOOP;

  v_result := jsonb_build_object(
    'success', true,
    'message', 'Emails added to queue and approval updated'
  );
  
  RETURN v_result;

EXCEPTION WHEN OTHERS THEN
  v_result := jsonb_build_object(
    'success', false,
    'error', SQLERRM
  );
  RETURN v_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
