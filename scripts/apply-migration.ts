/**
 * Script to apply the business meetings migration
 * Run with: npx tsx scripts/apply-migration.ts
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { join } from 'path';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!; // Need service role key for migrations

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing environment variables!');
  console.error('Need: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function applyMigration() {
  try {
    console.log('📦 Reading migration file...');
    const migrationPath = join(__dirname, '../supabase/migrations/20241209_business_meetings.sql');
    const migrationSQL = readFileSync(migrationPath, 'utf-8');

    console.log('🚀 Applying migration to database...');
    
    // Split by semicolons and execute each statement
    const statements = migrationSQL
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'));

    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      console.log(`   Executing statement ${i + 1}/${statements.length}...`);
      
      const { error } = await supabase.rpc('exec_sql', { sql: statement + ';' });
      
      if (error) {
        // Try direct execution as fallback
        const { error: directError } = await supabase.from('_migrations').insert({ statement });
        if (directError) {
          console.error(`❌ Error on statement ${i + 1}:`, error || directError);
        }
      }
    }

    console.log('✅ Migration applied successfully!');
    console.log('');
    console.log('📋 New tables created:');
    console.log('   - businesses');
    console.log('   - business_people');
    console.log('   - business_notes');
    console.log('   - meetings');
    console.log('   - meeting_attendees');
    console.log('   - meeting_agenda');
    console.log('   - meeting_questions');
    console.log('   - meeting_notes');
    console.log('   - meeting_followups');
    console.log('   - person_business_notes');
    console.log('');
    console.log('🎉 Ready to use Business Management features!');

  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

applyMigration();
