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
    const { id: conversationId } = await params;

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

    // Delete the conversation from Supabase
    const { error: deleteError } = await supabase
      .from("conversations")
      .delete()
      .eq("id", conversationId)
      .eq("user_id", user.id); // Ensure user owns this conversation

    if (deleteError) {
      console.error("❌ Error deleting conversation:", deleteError);
      throw deleteError;
    }

    console.log("✅ Conversation deleted from Supabase:", conversationId);

    // Also delete from Pinecone
    if (process.env.PINECONE_API_KEY) {
      try {
        const pinecone = new Pinecone({ apiKey: process.env.PINECONE_API_KEY });
        const index = pinecone.index(process.env.PINECONE_INDEX_NAME || "remind-me");
        
        await index.deleteOne(conversationId);
        console.log("✅ Conversation deleted from Pinecone:", conversationId);
      } catch (pineconeError) {
        console.error("⚠️ Pinecone deletion error (non-fatal):", pineconeError);
        // Don't fail the whole operation if Pinecone fails
      }
    }

    return NextResponse.json({ 
      success: true,
      message: "Conversation deleted successfully"
    });

  } catch (error: any) {
    console.error("Error deleting conversation:", error);
    return NextResponse.json(
      { error: error.message || "Failed to delete conversation" },
      { status: 500 }
    );
  }
}
