import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

/**
 * GET /api/business/org-chart/load?business_id=xxx
 * Loads org chart structure (people, teams, hierarchy) for a business
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
    const businessId = searchParams.get('business_id');

    if (!businessId) {
      return NextResponse.json(
        { error: 'Business ID is required' },
        { status: 400 }
      );
    }

    // Verify business belongs to user
    const { data: business, error: businessError } = await supabase
      .from('businesses')
      .select('id')
      .eq('id', businessId)
      .eq('user_id', user.id)
      .single();

    if (businessError || !business) {
      return NextResponse.json(
        { error: 'Business not found or unauthorized' },
        { status: 404 }
      );
    }

    // Load org chart people
    const { data: people, error: peopleError } = await supabase
      .from('org_chart_people')
      .select('*')
      .eq('business_id', businessId)
      .order('level', { ascending: true })
      .order('position_order', { ascending: true });

    if (peopleError) {
      throw peopleError;
    }

    // Load teams
    const { data: teams, error: teamsError } = await supabase
      .from('org_chart_teams')
      .select('*')
      .eq('business_id', businessId)
      .order('level', { ascending: true })
      .order('position_order', { ascending: true });

    if (teamsError) {
      throw teamsError;
    }

    // Load team members for each team
    const teamsWithMembers = await Promise.all(
      (teams || []).map(async (team) => {
        const { data: members, error: membersError } = await supabase
          .from('org_chart_team_members')
          .select('org_chart_person_id')
          .eq('team_id', team.id);

        if (membersError) {
          console.error('Error loading team members:', membersError);
          return { ...team, memberIds: [] };
        }

        return {
          ...team,
          memberIds: (members || []).map(m => m.org_chart_person_id),
        };
      })
    );

    // Load meetings
    const { data: meetings, error: meetingsError } = await supabase
      .from('meetings')
      .select('*')
      .eq('business_id', businessId)
      .order('created_at', { ascending: true });

    if (meetingsError) {
      throw meetingsError;
    }

    // Load notes and attendees for each meeting
    const meetingsWithDetails = await Promise.all(
      (meetings || []).map(async (meeting) => {
        // Load notes
        const { data: notes, error: notesError } = await supabase
          .from('meeting_notes')
          .select('content')
          .eq('meeting_id', meeting.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .single();

        // Load attendees
        const { data: attendees, error: attendeesError } = await supabase
          .from('meeting_attendees')
          .select('person_id')
          .eq('meeting_id', meeting.id);

        return {
          ...meeting,
          notes: notes?.content || '',
          attendees: (attendees || []).map(a => a.person_id),
        };
      })
    );

    return NextResponse.json({
      success: true,
      people: people || [],
      teams: teamsWithMembers || [],
      meetings: meetingsWithDetails || [],
    });

  } catch (error) {
    console.error('Error loading org chart:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to load org chart' 
      },
      { status: 500 }
    );
  }
}
