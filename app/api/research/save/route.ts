import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { person_id, type, topic, summary, data, links } = body;

    if (!person_id || !type || !topic) {
      return NextResponse.json(
        { error: 'Missing required fields: person_id, type, topic' },
        { status: 400 }
      );
    }

    // Check if result already exists for this person/topic
    const { data: existing } = await supabase
      .from('research_results')
      .select('id')
      .eq('person_id', person_id)
      .eq('user_id', user.id)
      .eq('topic', topic)
      .single();

    let result;
    if (existing) {
      // Update existing
      const { data: updated, error } = await supabase
        .from('research_results')
        .update({
          summary,
          data,
          links,
          last_updated: new Date().toISOString(),
        })
        .eq('id', existing.id)
        .select()
        .single();

      if (error) throw error;
      result = updated;
    } else {
      // Insert new
      const { data: inserted, error } = await supabase
        .from('research_results')
        .insert({
          person_id,
          user_id: user.id,
          type,
          topic,
          summary,
          data,
          links,
        })
        .select()
        .single();

      if (error) throw error;
      result = inserted;
    }

    return NextResponse.json({
      success: true,
      result,
    });

  } catch (error) {
    console.error('Error saving research result:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to save research result' 
      },
      { status: 500 }
    );
  }
}
