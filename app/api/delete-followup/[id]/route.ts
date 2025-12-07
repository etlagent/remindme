import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: followUpId } = await params;

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

    // Delete the follow-up from Supabase
    const { error: deleteError } = await supabase
      .from("follow_ups")
      .delete()
      .eq("id", followUpId)
      .eq("user_id", user.id); // Ensure user owns this follow-up

    if (deleteError) {
      console.error("❌ Error deleting follow-up:", deleteError);
      throw deleteError;
    }

    console.log("✅ Follow-up deleted from Supabase:", followUpId);

    return NextResponse.json({ 
      success: true,
      message: "Follow-up deleted successfully"
    });

  } catch (error: any) {
    console.error("Error deleting follow-up:", error);
    return NextResponse.json(
      { error: error.message || "Failed to delete follow-up" },
      { status: 500 }
    );
  }
}
