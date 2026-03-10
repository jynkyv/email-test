const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');

dotenv.config({ path: '.env.local' });

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function test() {
    console.log('Testing assign_customer_groups...');
    const { data, error } = await supabase.rpc('assign_customer_groups');

    if (error) {
        console.error('RPC Error:', error);
    } else {
        console.log('RPC Success. Affected rows:', data);
    }
}

test();
