-- Update the 'content' column in 'email_approvals' table
-- Replace 'sugawararina@hotmail.com' with 'family.organization.jp@gmail.com'
-- Only for records where status is 'pending'

UPDATE email_approvals
SET content = REPLACE(content, 'sugawararina@hotmail.com', 'family.organization.jp@gmail.com')
WHERE status = 'pending' AND content LIKE '%sugawararina@hotmail.com%';
