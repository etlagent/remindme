/**
 * Script to apply the projects structure migration
 * Run with: npx tsx scripts/apply-projects-migration.ts
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { join } from 'path';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing environment variables!');
  console.error('Need: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function applyMigration() {
  try {
    console.log('📦 Reading projects migration file...');
    const migrationPath = join(__dirname, '../supabase/migrations/20241214_projects_structure.sql');
    const migrationSQL = readFileSync(migrationPath, 'utf-8');

    console.log('🚀 Applying migration to database...');
    
    // Execute the entire migration as one statement
    const { error } = await supabase.rpc('exec_sql', { sql: migrationSQL });
    
    if (error) {
      console.error('❌ Migration failed:', error);
      process.exit(1);
    }

    console.log('✅ Migration applied successfully!');
    console.log('');
    console.log('📋 New tables created:');
    console.log('   - projects_folders (organize projects)');
    console.log('   - projects_main (project details)');
    console.log('   - projects_tasks (tasks with subtask support)');
    console.log('   - projects_notes (documentation)');
    console.log('   - projects_milestones (timeline tracking)');
    console.log('');
    console.log('🎉 Ready to build Projects feature!');

  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

applyMigration();
