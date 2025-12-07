import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { Pinecone } from "@pinecone-database/pinecone";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: memoryId } = await params;

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

    // Delete memory_people links first
    await supabase
      .from("memory_people")
      .delete()
      .eq("memory_id", memoryId);

    // Delete the memory from Supabase
    const { error: deleteError } = await supabase
      .from("memories")
      .delete()
      .eq("id", memoryId)
      .eq("user_id", user.id); // Ensure user owns this memory

    if (deleteError) {
      console.error("❌ Error deleting memory:", deleteError);
      throw deleteError;
    }

    console.log("✅ Memory deleted from Supabase:", memoryId);

    // Also delete from Pinecone
    if (process.env.PINECONE_API_KEY) {
      try {
        const pinecone = new Pinecone({ apiKey: process.env.PINECONE_API_KEY });
        const index = pinecone.index(process.env.PINECONE_INDEX_NAME || "remind-me");
        
        await index.deleteOne(memoryId);
        console.log("✅ Memory deleted from Pinecone:", memoryId);
      } catch (pineconeError) {
        console.error("⚠️ Pinecone deletion error (non-fatal):", pineconeError);
        // Don't fail the whole operation if Pinecone fails
      }
    }

    return NextResponse.json({ 
      success: true,
      message: "Memory deleted successfully"
    });

  } catch (error: any) {
    console.error("Error deleting memory:", error);
    return NextResponse.json(
      { error: error.message || "Failed to delete memory" },
      { status: 500 }
    );
  }
}
