-- Enable Row Level Security
ALTER TABLE "email_approvals" ENABLE ROW LEVEL SECURITY;

-- Note: In Supabase/PostgreSQL, policies need to be distinct for each operation or use ALL.
-- The auth.uid() function returns the UUID of the currently authenticated user.

-- 1. Allow authenticated users to insert their *own* approval requests
CREATE POLICY "Users can create their own approvals" ON "email_approvals"
FOR INSERT TO authenticated
WITH CHECK (auth.uid() = applicant_id);

-- 2. Allow users (applicants) to view their own requests
CREATE POLICY "Users can view own approvals" ON "email_approvals"
FOR SELECT TO authenticated
USING (auth.uid() = applicant_id);

-- 3. Allow admins to view ALL requests
CREATE POLICY "Admins can view all approvals" ON "email_approvals"
FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid() AND users.role = 'admin'
  )
);

-- 4. Allow admins to update ALL requests (e.g., approve/reject)
CREATE POLICY "Admins can update all approvals" ON "email_approvals"
FOR UPDATE TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid() AND users.role = 'admin'
  )
);
