import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

/**
 * GET /api/business/get?id=xxx
 * Gets a single business with all related data (people, meetings, notes)
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
    const businessId = searchParams.get('id');

    if (!businessId) {
      return NextResponse.json(
        { error: 'Business ID is required' },
        { status: 400 }
      );
    }

    // Get business
    const { data: business, error: businessError } = await supabase
      .from('businesses')
      .select('*')
      .eq('id', businessId)
      .eq('user_id', user.id)
      .single();

    if (businessError) throw businessError;
    if (!business) {
      return NextResponse.json(
        { error: 'Business not found' },
        { status: 404 }
      );
    }

    // Get business people with person details
    const { data: businessPeople, error: peopleError } = await supabase
      .from('business_people')
      .select(`
        *,
        person:people(*)
      `)
      .eq('business_id', businessId);

    if (peopleError) throw peopleError;

    // Get meetings
    const { data: meetings, error: meetingsError } = await supabase
      .from('meetings')
      .select('*')
      .eq('business_id', businessId)
      .order('meeting_date', { ascending: false, nullsFirst: false })
      .order('created_at', { ascending: false });

    if (meetingsError) throw meetingsError;

    // Get business notes
    const { data: notes, error: notesError } = await supabase
      .from('business_notes')
      .select('*')
      .eq('business_id', businessId)
      .order('created_at', { ascending: false });

    if (notesError) throw notesError;

    return NextResponse.json({
      success: true,
      business: {
        ...business,
        people: businessPeople || [],
        meetings: meetings || [],
        notes: notes || [],
      },
    });

  } catch (error) {
    console.error('Error getting business:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to get business' 
      },
      { status: 500 }
    );
  }
}
