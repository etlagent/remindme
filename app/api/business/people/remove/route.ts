import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

/**
 * DELETE /api/business/people/remove?business_id=xxx&person_id=yyy
 * Removes a person from a business
 */
export async function DELETE(request: NextRequest) {
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
    const personId = searchParams.get('person_id');

    if (!businessId || !personId) {
      return NextResponse.json(
        { error: 'Business ID and Person ID are required' },
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

    const { error } = await supabase
      .from('business_people')
      .delete()
      .eq('business_id', businessId)
      .eq('person_id', personId);

    if (error) throw error;

    return NextResponse.json({
      success: true,
      message: 'Person removed from business',
    });

  } catch (error) {
    console.error('Error removing person from business:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to remove person' 
      },
      { status: 500 }
    );
  }
}
