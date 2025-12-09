import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

/**
 * POST /api/meeting/create
 * Creates a new meeting for a business
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
      business_id,
      title,
      meeting_date,
      location,
      goal,
      status
    } = body;

    if (!business_id || !title) {
      return NextResponse.json(
        { error: 'Business ID and title are required' },
        { status: 400 }
      );
    }

    // Verify business belongs to user
    const { data: business, error: businessError } = await supabase
      .from('businesses')
      .select('id')
      .eq('id', business_id)
      .eq('user_id', user.id)
      .single();

    if (businessError || !business) {
      return NextResponse.json(
        { error: 'Business not found or unauthorized' },
        { status: 404 }
      );
    }

    const { data: meeting, error } = await supabase
      .from('meetings')
      .insert({
        business_id,
        user_id: user.id,
        title,
        meeting_date,
        location,
        goal,
        status: status || 'scheduled',
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({
      success: true,
      meeting,
    });

  } catch (error) {
    console.error('Error creating meeting:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to create meeting' 
      },
      { status: 500 }
    );
  }
}
