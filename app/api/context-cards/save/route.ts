import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

/**
 * POST /api/context-cards/save
 * Saves a context card configuration
 */
export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ 
        success: false,
        error: 'Unauthorized' 
      }, { status: 401 });
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

    const body = await request.json();
    const { 
      name,
      description,
      meeting_type,
      field_label01,
      field_response01,
      field_label02,
      field_response02,
      field_label03,
      field_response03,
      field_label04,
      field_response04,
      field_label05,
      field_response05,
      field_label06,
      field_response06,
      field_label07,
      field_response07,
      field_label08,
      field_response08,
      field_label09,
      field_response09,
      field_label10,
      field_response10,
    } = body;

    if (!name) {
      return NextResponse.json(
        { error: 'Context name is required' },
        { status: 400 }
      );
    }

    const { data: contextCard, error } = await supabase
      .from('meeting_context_cards')
      .insert({
        user_id: user.id,
        name,
        description,
        meeting_type,
        field_label01,
        field_response01,
        field_label02,
        field_response02,
        field_label03,
        field_response03,
        field_label04,
        field_response04,
        field_label05,
        field_response05,
        field_label06,
        field_response06,
        field_label07,
        field_response07,
        field_label08,
        field_response08,
        field_label09,
        field_response09,
        field_label10,
        field_response10,
        use_count: 0,
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({
      success: true,
      contextCard,
    });

  } catch (error) {
    console.error('Error saving context card:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to save context card' 
      },
      { status: 500 }
    );
  }
}
