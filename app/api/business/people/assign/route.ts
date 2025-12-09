import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

/**
 * POST /api/business/people/assign
 * Assigns a person to a business with role context
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
      person_id,
      role,
      influence_level,
      notes
    } = body;

    if (!business_id || !person_id) {
      return NextResponse.json(
        { error: 'Business ID and Person ID are required' },
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

    // Check if already assigned
    const { data: existing } = await supabase
      .from('business_people')
      .select('id')
      .eq('business_id', business_id)
      .eq('person_id', person_id)
      .single();

    let result;
    if (existing) {
      // Update existing assignment
      const { data: updated, error } = await supabase
        .from('business_people')
        .update({
          role,
          influence_level,
          notes,
          updated_at: new Date().toISOString(),
        })
        .eq('id', existing.id)
        .select(`
          *,
          person:people(*)
        `)
        .single();

      if (error) throw error;
      result = updated;
    } else {
      // Create new assignment
      const { data: inserted, error } = await supabase
        .from('business_people')
        .insert({
          business_id,
          person_id,
          role,
          influence_level,
          notes,
        })
        .select(`
          *,
          person:people(*)
        `)
        .single();

      if (error) throw error;
      result = inserted;
    }

    return NextResponse.json({
      success: true,
      businessPerson: result,
    });

  } catch (error) {
    console.error('Error assigning person to business:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to assign person' 
      },
      { status: 500 }
    );
  }
}
