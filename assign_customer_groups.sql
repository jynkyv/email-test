-- 1. Add send_group_id to customers table
ALTER TABLE public.customers ADD COLUMN IF NOT EXISTS send_group_id integer;

-- 2. Add an index to speed up group-based queries
CREATE INDEX IF NOT EXISTS idx_customers_send_group_id ON public.customers(send_group_id);

-- 3. Create RPC function for lightning fast grouping
CREATE OR REPLACE FUNCTION assign_customer_groups() RETURNS integer AS $$
DECLARE
    affected_rows integer;
BEGIN
    WITH numbered_customers AS (
        SELECT 
            id, 
            ROW_NUMBER() OVER (ORDER BY created_at ASC) as row_num
        FROM 
            public.customers
        WHERE 
            email IS NOT NULL 
            AND email != ''
            AND unsubscribe = false
    )
    UPDATE public.customers c
    SET send_group_id = ((nc.row_num - 1) / 5000) + 1
    FROM numbered_customers nc
    WHERE c.id = nc.id;
    
    GET DIAGNOSTICS affected_rows = ROW_COUNT;
    RETURN affected_rows;
END;
$$ LANGUAGE plpgsql;
