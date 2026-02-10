
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' }); // Load from .env.local

import { EMAIL_TEMPLATES } from '../lib/emailTemplates';

// Types for Supabase Admin (we'll import dynamically)
import type { SupabaseClient } from '@supabase/supabase-js';

const BATCH_SIZE = 100;
const TEMPLATE_ID = 'family';

async function batchCreateEmailJobs() {
    console.log('🚀 Starting batch email job creation...');

    // Dynamically import supabaseAdmin after env vars are loaded
    const { supabaseAdmin } = await import('../lib/supabase-admin');

    // 1. Get the template
    const template = EMAIL_TEMPLATES.find(t => t.id === TEMPLATE_ID);
    if (!template) {
        console.error(`❌ Template '${TEMPLATE_ID}' not found.`);
        process.exit(1);
    }
    console.log(`✅ Using template: ${template.name}`);

    // 2. Get Admin User
    const { data: adminUser, error: adminError } = await supabaseAdmin
        .from('users')
        .select('id, email')
        .eq('role', 'admin')
        .limit(1)
        .single();

    if (adminError || !adminUser) {
        console.error('❌ Could not find an admin user to assign as applicant.', adminError);
        process.exit(1);
    }
    console.log(`✅ Using admin user: ${adminUser.email} (${adminUser.id})`);

    // 3. Fetch all customers with emails using pagination
    console.log('📥 Fetching customers (paginated)...');

    const PAGE_SIZE = 1000; // Supabase limit is usually 1000
    let offset = 0;
    let hasMore = true;
    let totalProcessed = 0;

    while (hasMore) {
        console.log(`🔎 Fetching customers ${offset} to ${offset + PAGE_SIZE - 1}...`);

        const { data: customers, error: customersError } = await supabaseAdmin
            .from('customers')
            .select('email, company_name')
            .not('email', 'is', null)
            .neq('email', '')
            .range(offset, offset + PAGE_SIZE - 1);

        if (customersError) {
            console.error('❌ Error fetching customers:', customersError);
            process.exit(1);
        }

        if (!customers || customers.length === 0) {
            hasMore = false;
            break; // No more customers
        }

        console.log(`✅ Fetched ${customers.length} customers. Processing...`);

        // 4. Chunk and Create Jobs for this page
        const totalBatches = Math.ceil(customers.length / BATCH_SIZE);

        for (let i = 0; i < totalBatches; i++) {
            const start = i * BATCH_SIZE;
            const end = start + BATCH_SIZE;
            const batch = customers.slice(start, end);
            const recipientEmails = batch.map(c => c.email);

            // Create the approval job
            const { data: job, error: jobError } = await supabaseAdmin
                .from('email_approvals')
                .insert({
                    applicant_id: adminUser.id,
                    subject: template.subject,
                    content: template.content,
                    recipients: recipientEmails,
                    status: 'pending'
                })
                .select('id')
                .single();

            if (jobError) {
                console.error(`❌ Error creating job for offset ${offset} batch ${i + 1}/${totalBatches}:`, jobError);
            } else {
                console.log(`✅ Job created: ID ${job.id} with ${recipientEmails.length} recipients.`);
            }
        }

        totalProcessed += customers.length;
        offset += PAGE_SIZE;

        // If we fetched fewer than PAGE_SIZE, we are done
        if (customers.length < PAGE_SIZE) {
            hasMore = false;
        }
    }

    console.log(`✅ Total customers processed: ${totalProcessed}`);

    console.log('🎉 Batch job creation completed.');
}

batchCreateEmailJobs().catch(e => {
    console.error('Unexpected error:', e);
    process.exit(1);
});
