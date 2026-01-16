/**
 * Script để apply database migration
 * Chạy: node scripts/apply-hr-migration.js
 * 
 * Yêu cầu environment variables:
 * - NEXT_PUBLIC_SUPABASE_URL
 * - SUPABASE_SERVICE_ROLE_KEY (hoặc dùng Supabase Dashboard)
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Load environment variables from .env.local
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('❌ Missing environment variables!');
    console.error('Required:');
    console.error('  - NEXT_PUBLIC_SUPABASE_URL');
    console.error('  - SUPABASE_SERVICE_ROLE_KEY');
    console.error('\nPlease add these to .env.local file.');
    console.error('\n📋 Alternative: Apply migration manually via Supabase Dashboard:');
    console.error('  1. Go to https://supabase.com/dashboard');
    console.error('  2. Select your project');
    console.error('  3. Navigate to SQL Editor');
    console.error('  4. Copy and paste the contents of supabase/migrations/002_hr_management.sql');
    console.error('  5. Click Run');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function applyMigration() {
    console.log('🚀 Applying HR Management migration...\n');

    // Read migration file
    const migrationPath = path.join(__dirname, '..', 'supabase', 'migrations', '002_hr_management.sql');

    if (!fs.existsSync(migrationPath)) {
        console.error('❌ Migration file not found:', migrationPath);
        process.exit(1);
    }

    const migrationSql = fs.readFileSync(migrationPath, 'utf8');

    try {
        // Execute migration SQL
        const { error } = await supabase.rpc('exec_sql', { sql: migrationSql });

        if (error) {
            console.error('❌ Migration failed:', error.message);
            console.error('\n📋 Please apply migration manually via Supabase Dashboard SQL Editor');
            process.exit(1);
        }

        console.log('✅ Migration applied successfully!');
        console.log('\nCreated tables:');
        console.log('  - employees');
        console.log('  - attendance');
        console.log('  - payroll');
        console.log('\n🎉 HR Management database is ready!');

    } catch (err) {
        console.error('❌ Error:', err.message);
        console.error('\n📋 Please apply migration manually via Supabase Dashboard SQL Editor');
        process.exit(1);
    }
}

applyMigration();
