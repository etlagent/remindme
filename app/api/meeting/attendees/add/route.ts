import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

/**
 * POST /api/meeting/attendees/add
 * Adds an attendee to a meeting
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
    const { meeting_id, person_id } = body;

    if (!meeting_id || !person_id) {
      return NextResponse.json(
        { error: 'Meeting ID and Person ID are required' },
        { status: 400 }
      );
    }

    // Verify meeting belongs to user
    const { data: meeting, error: meetingError } = await supabase
      .from('meetings')
      .select('id')
      .eq('id', meeting_id)
      .eq('user_id', user.id)
      .single();

    if (meetingError || !meeting) {
      return NextResponse.json(
        { error: 'Meeting not found or unauthorized' },
        { status: 404 }
      );
    }

    const { data: attendee, error } = await supabase
      .from('meeting_attendees')
      .insert({
        meeting_id,
        person_id,
      })
      .select(`
        *,
        person:people(*)
      `)
      .single();

    if (error) throw error;

    return NextResponse.json({
      success: true,
      attendee,
    });

  } catch (error) {
    console.error('Error adding attendee:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to add attendee' 
      },
      { status: 500 }
    );
  }
}
