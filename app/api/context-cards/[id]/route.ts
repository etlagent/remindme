import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

/**
 * PATCH /api/context-cards/[id]
 * Updates an existing context card (used when manually saving an auto-saved context)
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
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

    const { id } = await params;
    const body = await request.json();

    // Update the context card
    const { data: contextCard, error } = await supabase
      .from('meeting_context_cards')
      .update(body)
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single();

    if (error || !contextCard) {
      return NextResponse.json(
        { error: 'Context card not found or unauthorized' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      contextCard,
    });

  } catch (error) {
    console.error('Error updating context card:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to update context card' 
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/context-cards/[id]
 * Loads a specific context card by ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
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

    const { id } = await params;

    console.log('GET context card - user.id:', user.id, 'context_id:', id);

    const { data: contextCard, error } = await supabase
      .from('meeting_context_cards')
      .select('*')
      .eq('id', id)
      .eq('user_id', user.id)
      .single();

    console.log('GET context card result:', { contextCard, error });

    if (error || !contextCard) {
      console.log('Context card not found. Error:', error);
      return NextResponse.json(
        { error: 'Context card not found', details: error?.message },
        { status: 404 }
      );
    }

    // Update use_count and last_used_at
    await supabase
      .from('meeting_context_cards')
      .update({
        use_count: (contextCard.use_count || 0) + 1,
        last_used_at: new Date().toISOString(),
      })
      .eq('id', id);

    return NextResponse.json({
      success: true,
      contextCard,
    });

  } catch (error) {
    console.error('Error loading context card:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to load context card' 
      },
      { status: 500 }
    );
  }
}
