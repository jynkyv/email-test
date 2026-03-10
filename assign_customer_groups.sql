-- This function automatically assigns customers with a valid email into 5000-sized groups
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
    SET group_id = ((nc.row_num - 1) / 5000) + 1
    FROM numbered_customers nc
    WHERE c.id = nc.id;
    
    GET DIAGNOSTICS affected_rows = ROW_COUNT;
    RETURN affected_rows;
END;
$$ LANGUAGE plpgsql;
