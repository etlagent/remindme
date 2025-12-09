import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

/**
 * PUT /api/meeting/questions/update
 * Updates a meeting question (mark as asked/answered, add answer)
 */
export async function PUT(request: NextRequest) {
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
      id,
      question,
      priority,
      context,
      status,
      answer
    } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'Question ID is required' },
        { status: 400 }
      );
    }

    const updateData: any = {
      updated_at: new Date().toISOString(),
    };

    if (question !== undefined) updateData.question = question;
    if (priority !== undefined) updateData.priority = priority;
    if (context !== undefined) updateData.context = context;
    if (status !== undefined) {
      updateData.status = status;
      if (status === 'asked' || status === 'answered') {
        updateData.asked_date = new Date().toISOString();
      }
    }
    if (answer !== undefined) updateData.answer = answer;

    // Verify question belongs to user's meeting
    const { data: question_check, error: checkError } = await supabase
      .from('meeting_questions')
      .select('meeting_id')
      .eq('id', id)
      .single();

    if (checkError || !question_check) {
      return NextResponse.json(
        { error: 'Question not found' },
        { status: 404 }
      );
    }

    const { data: meeting, error: meetingError } = await supabase
      .from('meetings')
      .select('id')
      .eq('id', question_check.meeting_id)
      .eq('user_id', user.id)
      .single();

    if (meetingError || !meeting) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      );
    }

    const { data: questionRecord, error } = await supabase
      .from('meeting_questions')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({
      success: true,
      question: questionRecord,
    });

  } catch (error) {
    console.error('Error updating question:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to update question' 
      },
      { status: 500 }
    );
  }
}
