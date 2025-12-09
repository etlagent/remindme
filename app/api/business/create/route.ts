import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

/**
 * POST /api/business/create
 * Creates a new business/client record
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
      name,
      industry,
      stage,
      deal_value,
      website,
      linkedin_url,
      description
    } = body;

    if (!name) {
      return NextResponse.json(
        { error: 'Business name is required' },
        { status: 400 }
      );
    }

    const { data: business, error } = await supabase
      .from('businesses')
      .insert({
        user_id: user.id,
        name,
        industry,
        stage,
        deal_value,
        website,
        linkedin_url,
        description,
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({
      success: true,
      business,
    });

  } catch (error) {
    console.error('Error creating business:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to create business' 
      },
      { status: 500 }
    );
  }
}
