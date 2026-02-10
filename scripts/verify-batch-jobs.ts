
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

// Types for Supabase Admin (we'll import dynamically)
import type { SupabaseClient } from '@supabase/supabase-js';

async function verify() {
    // Dynamically import supabaseAdmin after env vars are loaded
    const { supabaseAdmin } = await import('../lib/supabase-admin');
    console.log('🔍 Verifying latest email approvals...');

    const { data: approvals, error } = await supabaseAdmin
        .from('email_approvals')
        .select('id, recipients, status, subject, content')
        .order('created_at', { ascending: false })
        .limit(1);

    if (error) {
        console.error('❌ Error fetching approvals:', error);
        process.exit(1);
    }

    if (!approvals || approvals.length === 0) {
        console.log('⚠️ No approvals found.');
        return;
    }

    const { count, error: countError } = await supabaseAdmin
        .from('email_approvals')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending');

    if (countError) {
        console.error('❌ Error counting approvals:', countError);
    } else {
        console.log(`✅ Total PENDING approvals in DB: ${count}`);
    }

    const job = approvals[0];
    console.log(`✅ Latest Job ID: ${job.id}`);
    console.log(`   Status: ${job.status}`);
    console.log(`   Subject: ${job.subject}`);
    console.log(`   Recipients count: ${job.recipients?.length}`);
    console.log(`   Recipient sample:`, job.recipients?.slice(0, 3)); // Show first 3

    if (Array.isArray(job.recipients) && job.recipients.length > 0 && typeof job.recipients[0] === 'string') {
        console.log('✅ Recipients format valid: Array of strings.');
    } else {
        console.warn('⚠️ Recipients format might be incorrect (expected array of strings).');
    }
}

verify().catch(console.error);
