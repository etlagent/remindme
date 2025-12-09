import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

/**
 * GET /api/meeting/get?id=xxx
 * Gets a single meeting with all related data
 */
export async function GET(request: NextRequest) {
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

    const { searchParams } = new URL(request.url);
    const meetingId = searchParams.get('id');

    if (!meetingId) {
      return NextResponse.json(
        { error: 'Meeting ID is required' },
        { status: 400 }
      );
    }

    // Get meeting
    const { data: meeting, error: meetingError } = await supabase
      .from('meetings')
      .select('*, business:businesses(*)')
      .eq('id', meetingId)
      .eq('user_id', user.id)
      .single();

    if (meetingError) throw meetingError;
    if (!meeting) {
      return NextResponse.json(
        { error: 'Meeting not found' },
        { status: 404 }
      );
    }

    // Get attendees with person details
    const { data: attendees, error: attendeesError } = await supabase
      .from('meeting_attendees')
      .select(`
        *,
        person:people(*)
      `)
      .eq('meeting_id', meetingId);

    if (attendeesError) throw attendeesError;

    // Get agenda items
    const { data: agenda, error: agendaError } = await supabase
      .from('meeting_agenda')
      .select('*')
      .eq('meeting_id', meetingId)
      .order('item_order', { ascending: true });

    if (agendaError) throw agendaError;

    // Get questions
    const { data: questions, error: questionsError } = await supabase
      .from('meeting_questions')
      .select('*')
      .eq('meeting_id', meetingId)
      .order('created_at', { ascending: true });

    if (questionsError) throw questionsError;

    // Get notes
    const { data: notes, error: notesError } = await supabase
      .from('meeting_notes')
      .select('*')
      .eq('meeting_id', meetingId)
      .order('created_at', { ascending: false });

    if (notesError) throw notesError;

    // Get follow-ups
    const { data: followups, error: followupsError } = await supabase
      .from('meeting_followups')
      .select('*')
      .eq('meeting_id', meetingId)
      .order('due_date', { ascending: true, nullsFirst: false })
      .order('created_at', { ascending: false });

    if (followupsError) throw followupsError;

    return NextResponse.json({
      success: true,
      meeting: {
        ...meeting,
        attendees: attendees || [],
        agenda: agenda || [],
        questions: questions || [],
        notes: notes || [],
        followups: followups || [],
      },
    });

  } catch (error) {
    console.error('Error getting meeting:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to get meeting' 
      },
      { status: 500 }
    );
  }
}
