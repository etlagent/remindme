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

    // Fetch attendees with person details
    const { data: attendees, error } = await supabase
      .from('meeting_attendees')
      .select(`
        *,
        people:person_id (*)
      `)
      .eq('meeting_id', id);

    if (error) {
      console.error('Error fetching attendees:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, data: attendees });
  } catch (error) {
    console.error('Error in attendees GET:', error);
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
    const { person_id } = body;

    const { data: attendee, error } = await supabase
      .from('meeting_attendees')
      .insert({
        meeting_id: id,
        person_id
      })
      .select()
      .single();

    if (error) {
      console.error('Error adding attendee:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, data: attendee });
  } catch (error) {
    console.error('Error in attendees POST:', error);
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
    const attendee_id = searchParams.get('attendee_id');

    if (!attendee_id) {
      return NextResponse.json({ error: 'Attendee ID required' }, { status: 400 });
    }

    const { error } = await supabase
      .from('meeting_attendees')
      .delete()
      .eq('id', attendee_id)
      .eq('meeting_id', id);

    if (error) {
      console.error('Error removing attendee:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in attendees DELETE:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
