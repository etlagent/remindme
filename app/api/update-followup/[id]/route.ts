import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: followUpId } = await params;
    const body = await request.json();
    const { status, priority, urgency, due_date } = body;

    // Get authenticated user
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json(
        { error: "Not authenticated" },
        { status: 401 }
      );
    }

    const token = authHeader.replace('Bearer ', '');
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    });

    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return NextResponse.json(
        { error: "Invalid authentication" },
        { status: 401 }
      );
    }

    // Prepare update data
    const updateData: any = {};
    if (status) updateData.status = status;
    if (priority) updateData.priority = priority;
    if (urgency) updateData.urgency = urgency;
    if (due_date !== undefined) updateData.due_date = due_date;

    // Update the follow-up
    const { error: updateError } = await supabase
      .from("follow_ups")
      .update(updateData)
      .eq("id", followUpId)
      .eq("user_id", user.id); // Ensure user owns this follow-up

    if (updateError) {
      console.error("❌ Error updating follow-up:", updateError);
      throw updateError;
    }

    console.log("✅ Follow-up updated:", followUpId, updateData);

    return NextResponse.json({ 
      success: true,
      message: "Follow-up updated successfully"
    });

  } catch (error: any) {
    console.error("Error updating follow-up:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update follow-up" },
      { status: 500 }
    );
  }
}
