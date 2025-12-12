import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

/**
 * POST /api/business/org-chart/save
 * Saves org chart structure (people, teams, hierarchy) for a business
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
      people,
      teams,
      meetings
    } = body;

    if (!business_id) {
      return NextResponse.json(
        { error: 'Business ID is required' },
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

    // Delete existing org chart data for this business (we'll recreate it)
    await supabase
      .from('org_chart_people')
      .delete()
      .eq('business_id', business_id);

    await supabase
      .from('org_chart_teams')
      .delete()
      .eq('business_id', business_id);

    // Delete existing meetings for this business
    // First get meeting IDs to delete attendees
    const { data: existingMeetings } = await supabase
      .from('meetings')
      .select('id')
      .eq('business_id', business_id);

    if (existingMeetings && existingMeetings.length > 0) {
      const meetingIds = existingMeetings.map(m => m.id);
      // Delete attendees for these meetings
      await supabase
        .from('meeting_attendees')
        .delete()
        .in('meeting_id', meetingIds);
    }

    // Now delete the meetings
    await supabase
      .from('meetings')
      .delete()
      .eq('business_id', business_id);

    // Save org chart people
    const savedPeople: any[] = [];
    if (people && people.length > 0) {
      for (const person of people) {
        const { data: savedPerson, error: personError } = await supabase
          .from('org_chart_people')
          .insert({
            business_id,
            person_id: person.personId || null,
            name: person.name,
            title: person.title,
            level: person.level,
            position_order: person.positionOrder || 0,
            responsibilities: person.responsibilities,
            challenges: person.challenges,
            needs: person.needs,
            notes: person.notes,
            is_placeholder: person.isPlaceholder || false,
          })
          .select()
          .single();

        if (personError) {
          console.error('Error saving person:', personError);
          continue;
        }

        // Store mapping of old ID to new ID for team members
        savedPeople.push({
          oldId: person.id,
          newId: savedPerson.id,
        });
      }
    }

    // Save teams
    const savedTeams: any[] = [];
    if (teams && teams.length > 0) {
      for (const team of teams) {
        const { data: savedTeam, error: teamError } = await supabase
          .from('org_chart_teams')
          .insert({
            business_id,
            name: team.name,
            description: team.description,
            level: team.level,
            position_order: team.positionOrder || 0,
          })
          .select()
          .single();

        if (teamError) {
          console.error('Error saving team:', teamError);
          continue;
        }

        // Save team members
        if (team.memberIds && team.memberIds.length > 0) {
          for (const oldMemberId of team.memberIds) {
            // Find the new ID for this member
            const mapping = savedPeople.find(p => p.oldId === oldMemberId);
            if (mapping) {
              await supabase
                .from('org_chart_team_members')
                .insert({
                  team_id: savedTeam.id,
                  org_chart_person_id: mapping.newId,
                });
            }
          }
        }

        savedTeams.push(savedTeam);
      }
    }

    // Save meetings
    const savedMeetings: any[] = [];
    if (meetings && meetings.length > 0) {
      for (const meeting of meetings) {
        const { data: savedMeeting, error: meetingError } = await supabase
          .from('meetings')
          .insert({
            business_id,
            user_id: user.id,
            title: meeting.title,
            meeting_date: meeting.meeting_date,
            status: 'scheduled',
          })
          .select()
          .single();

        if (meetingError) {
          console.error('Error saving meeting:', meetingError);
          continue;
        }

        // Save meeting notes
        if (meeting.notes && meeting.notes.trim()) {
          await supabase
            .from('meeting_notes')
            .insert({
              meeting_id: savedMeeting.id,
              user_id: user.id,
              content: meeting.notes,
              note_type: 'post',
            });
        }

        // Save meeting attendees
        if (meeting.attendees && meeting.attendees.length > 0) {
          for (const personId of meeting.attendees) {
            await supabase
              .from('meeting_attendees')
              .insert({
                meeting_id: savedMeeting.id,
                person_id: personId,
              });
          }
        }

        savedMeetings.push(savedMeeting);
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Org chart saved successfully',
      savedPeopleCount: savedPeople.length,
      savedTeamsCount: savedTeams.length,
      savedMeetingsCount: savedMeetings.length,
    });

  } catch (error) {
    console.error('Error saving org chart:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to save org chart' 
      },
      { status: 500 }
    );
  }
}
