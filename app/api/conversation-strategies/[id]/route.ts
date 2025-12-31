import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

/**
 * PATCH /api/conversation-strategies/[id]
 * Updates an existing conversation strategy (used when manually saving an auto-saved strategy)
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const { id } = params;
    const body = await request.json();

    // Update the strategy
    const { data: strategy, error } = await supabase
      .from('meeting_conversation_strategies')
      .update(body)
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single();

    if (error || !strategy) {
      return NextResponse.json(
        { error: 'Strategy not found or unauthorized' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      strategy,
    });

  } catch (error) {
    console.error('Error updating strategy:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to update strategy' 
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/conversation-strategies/[id]
 * Loads a specific conversation strategy by ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const { id } = params;

    const { data: strategy, error } = await supabase
      .from('meeting_conversation_strategies')
      .select('*')
      .eq('id', id)
      .eq('user_id', user.id)
      .single();

    if (error || !strategy) {
      return NextResponse.json(
        { error: 'Strategy not found' },
        { status: 404 }
      );
    }

    // Update use_count and last_used_at
    await supabase
      .from('meeting_conversation_strategies')
      .update({
        use_count: (strategy.use_count || 0) + 1,
        last_used_at: new Date().toISOString(),
      })
      .eq('id', id);

    return NextResponse.json({
      success: true,
      strategy,
    });

  } catch (error) {
    console.error('Error loading strategy:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to load strategy' 
      },
      { status: 500 }
    );
  }
}
