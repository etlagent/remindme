import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// GET /api/decide/workspace - Get all workspace TODOs for user
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
    const status = searchParams.get('status'); // 'draft', 'ready', 'converted'
    const sourceType = searchParams.get('source_type'); // 'meeting', 'project', etc.
    const sourceId = searchParams.get('source_id'); // specific meeting/project id

    let query = supabase
      .from('todo_workspace')
      .select('*')
      .eq('user_id', user.id)
      .order('order_index', { ascending: true});

    if (status) {
      query = query.eq('status', status);
    }

    if (sourceType) {
      query = query.eq('source_type', sourceType);
    }

    if (sourceId) {
      query = query.eq('source_id', sourceId);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching workspace todos:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Error in GET /api/decide/workspace:', error);
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Internal server error' 
    }, { status: 500 });
  }
}

// POST /api/decide/workspace - Create new workspace TODO
export async function POST(request: NextRequest) {
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

    const body = await request.json();
    const { 
      text, 
      parent_id, 
      is_breakdown, 
      ai_generated, 
      estimated_minutes,
      source_type,
      source_id,
      status,
      scheduled_for
    } = body;

    if (!text || text.trim() === '') {
      return NextResponse.json({ error: 'Text is required' }, { status: 400 });
    }

    // Get current max order_index
    const { data: maxOrder } = await supabase
      .from('todo_workspace')
      .select('order_index')
      .eq('user_id', user.id)
      .order('order_index', { ascending: false })
      .limit(1)
      .single();

    const orderIndex = maxOrder ? maxOrder.order_index + 1 : 0;

    const { data, error } = await supabase
      .from('todo_workspace')
      .insert({
        user_id: user.id,
        text: text.trim(),
        order_index: orderIndex,
        parent_id: parent_id || null,
        is_breakdown: is_breakdown || false,
        ai_generated: ai_generated || false,
        estimated_minutes: estimated_minutes || null,
        source_type: source_type || null,
        source_id: source_id || null,
        status: status || 'draft',
        scheduled_for: scheduled_for || null
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating workspace todo:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, data }, { status: 201 });
  } catch (error) {
    console.error('Error in POST /api/decide/workspace:', error);
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Internal server error' 
    }, { status: 500 });
  }
}

// DELETE /api/decide/workspace - Clear all workspace TODOs
export async function DELETE(request: NextRequest) {
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

    const { error } = await supabase
      .from('todo_workspace')
      .delete()
      .eq('user_id', user.id);

    if (error) {
      console.error('Error clearing workspace:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: 'Workspace cleared' });
  } catch (error) {
    console.error('Error in DELETE /api/decide/workspace:', error);
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Internal server error' 
    }, { status: 500 });
  }
}
