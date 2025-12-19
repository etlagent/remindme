import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json(
        { success: false, error: 'Missing authorization header' },
        { status: 401 }
      );
    }

    const token = authHeader.replace('Bearer ', '');
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      global: { headers: { Authorization: authHeader } }
    });

    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: 'Invalid token' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { habits } = body;

    if (!habits || !Array.isArray(habits)) {
      return NextResponse.json(
        { success: false, error: 'Invalid habits array' },
        { status: 400 }
      );
    }

    // Update each habit's order_index
    const updates = habits.map(({ id, order_index }) =>
      supabase
        .from('habits')
        .update({ order_index, updated_at: new Date().toISOString() })
        .eq('id', id)
        .eq('user_id', user.id)
    );

    await Promise.all(updates);

    return NextResponse.json({
      success: true,
      message: 'Habits reordered successfully'
    });
  } catch (error) {
    console.error('Error reordering habits:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
