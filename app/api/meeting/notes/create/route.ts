import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

/**
 * POST /api/meeting/notes/create
 * Creates a note for a meeting
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
      meeting_id,
      content,
      note_type,
      source
    } = body;

    if (!meeting_id || !content) {
      return NextResponse.json(
        { error: 'Meeting ID and content are required' },
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

    const { data: note, error } = await supabase
      .from('meeting_notes')
      .insert({
        meeting_id,
        user_id: user.id,
        content,
        note_type: note_type || 'during',
        source: source || 'manual',
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({
      success: true,
      note,
    });

  } catch (error) {
    console.error('Error creating meeting note:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to create note' 
      },
      { status: 500 }
    );
  }
}
