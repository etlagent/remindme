import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.replace('Bearer ', '');
    
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    });

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const person_id = searchParams.get('person_id');

    if (!person_id) {
      return NextResponse.json(
        { error: 'Missing person_id parameter' },
        { status: 400 }
      );
    }

    const { data: results, error } = await supabase
      .from('research_results')
      .select('*')
      .eq('person_id', person_id)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    // If table doesn't exist yet, return empty array
    if (error) {
      if (error.message?.includes('relation') || error.message?.includes('does not exist')) {
        console.warn('⚠️ research_results table does not exist yet. Run the migration first.');
        return NextResponse.json({
          success: true,
          results: [],
        });
      }
      throw error;
    }

    return NextResponse.json({
      success: true,
      results: results || [],
    });

  } catch (error) {
    console.error('Error listing research results:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to list research results' 
      },
      { status: 500 }
    );
  }
}
