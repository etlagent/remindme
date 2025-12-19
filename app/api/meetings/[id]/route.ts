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

    const { data: meeting, error } = await supabase
      .from('meetings')
      .select('*')
      .eq('id', id)
      .eq('user_id', user.id)
      .single();

    if (error) {
      console.error('Error fetching meeting:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!meeting) {
      return NextResponse.json({ error: 'Meeting not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: meeting });
  } catch (error) {
    console.error('Error in meeting GET:', error);
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
    const updateData: any = { updated_at: new Date().toISOString() };

    if (body.title !== undefined) updateData.title = body.title;
    if (body.meeting_date !== undefined) updateData.meeting_date = body.meeting_date;
    if (body.start_time !== undefined) updateData.start_time = body.start_time;
    if (body.end_time !== undefined) updateData.end_time = body.end_time;
    if (body.duration_minutes !== undefined) updateData.duration_minutes = body.duration_minutes;
    if (body.location !== undefined) updateData.location = body.location;
    if (body.meeting_type !== undefined) updateData.meeting_type = body.meeting_type;
    if (body.business_id !== undefined) updateData.business_id = body.business_id;
    if (body.goal !== undefined) updateData.goal = body.goal;
    if (body.key_message !== undefined) updateData.key_message = body.key_message;
    if (body.preparation_notes !== undefined) updateData.preparation_notes = body.preparation_notes;
    if (body.status !== undefined) updateData.status = body.status;
    if (body.order_index !== undefined) updateData.order_index = body.order_index;

    const { data: meeting, error } = await supabase
      .from('meetings')
      .update(updateData)
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) {
      console.error('Error updating meeting:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!meeting) {
      return NextResponse.json({ error: 'Meeting not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: meeting });
  } catch (error) {
    console.error('Error in meeting PUT:', error);
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

    const { error } = await supabase
      .from('meetings')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) {
      console.error('Error deleting meeting:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in meeting DELETE:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
