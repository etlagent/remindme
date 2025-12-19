import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
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

    // Verify meeting belongs to user
    const { data: meeting } = await supabase
      .from('meetings')
      .select('id')
      .eq('id', id)
      .eq('user_id', user.id)
      .single();

    if (!meeting) {
      return NextResponse.json({ error: 'Meeting not found' }, { status: 404 });
    }

    const { data: agendaItems, error } = await supabase
      .from('meeting_agenda_items')
      .select('*')
      .eq('meeting_id', id)
      .order('order_index', { ascending: true });

    if (error) {
      console.error('Error fetching agenda items:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, data: agendaItems });
  } catch (error) {
    console.error('Error in agenda GET:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
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

    // Verify meeting belongs to user
    const { data: meeting } = await supabase
      .from('meetings')
      .select('id')
      .eq('id', id)
      .eq('user_id', user.id)
      .single();

    if (!meeting) {
      return NextResponse.json({ error: 'Meeting not found' }, { status: 404 });
    }

    const body = await request.json();
    const { title, duration_minutes, order_index, notes } = body;

    const { data: agendaItem, error } = await supabase
      .from('meeting_agenda_items')
      .insert({
        meeting_id: id,
        title,
        duration_minutes,
        order_index,
        notes
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating agenda item:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, data: agendaItem });
  } catch (error) {
    console.error('Error in agenda POST:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
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
    const { agenda_item_id, title, duration_minutes, order_index, notes } = body;

    // Verify meeting belongs to user
    const { data: meeting } = await supabase
      .from('meetings')
      .select('id')
      .eq('id', id)
      .eq('user_id', user.id)
      .single();

    if (!meeting) {
      return NextResponse.json({ error: 'Meeting not found' }, { status: 404 });
    }

    const updateData: any = {};
    if (title !== undefined) updateData.title = title;
    if (duration_minutes !== undefined) updateData.duration_minutes = duration_minutes;
    if (order_index !== undefined) updateData.order_index = order_index;
    if (notes !== undefined) updateData.notes = notes;

    const { data: agendaItem, error } = await supabase
      .from('meeting_agenda_items')
      .update(updateData)
      .eq('id', agenda_item_id)
      .eq('meeting_id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating agenda item:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, data: agendaItem });
  } catch (error) {
    console.error('Error in agenda PUT:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
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

    // Verify meeting belongs to user
    const { data: meeting } = await supabase
      .from('meetings')
      .select('id')
      .eq('id', id)
      .eq('user_id', user.id)
      .single();

    if (!meeting) {
      return NextResponse.json({ error: 'Meeting not found' }, { status: 404 });
    }

    const { searchParams } = new URL(request.url);
    const agenda_item_id = searchParams.get('agenda_item_id');

    if (!agenda_item_id) {
      return NextResponse.json({ error: 'Agenda item ID required' }, { status: 400 });
    }

    const { error } = await supabase
      .from('meeting_agenda_items')
      .delete()
      .eq('id', agenda_item_id)
      .eq('meeting_id', id);

    if (error) {
      console.error('Error deleting agenda item:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in agenda DELETE:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
