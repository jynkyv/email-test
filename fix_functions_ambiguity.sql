-- Drop the function with possible conflicting signatures to resolve "300 Multiple Choices" (PGRST203) error.

-- 1. Correct signature used in previous script (p_recipients TEXT[])
DROP FUNCTION IF EXISTS add_emails_to_queue_and_update_approval(UUID, UUID, TEXT[], TEXT, TEXT);

-- 2. Possible conflicting signature (p_recipients JSONB - sometimes used by supabase-js if array detection fails)
DROP FUNCTION IF EXISTS add_emails_to_queue_and_update_approval(UUID, UUID, JSONB, TEXT, TEXT);

-- 3. Another possible conflict (p_recipients TEXT without array)
DROP FUNCTION IF EXISTS add_emails_to_queue_and_update_approval(UUID, UUID, TEXT, TEXT, TEXT);


-- Re-create the function with the correct signature (TEXT[])
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
