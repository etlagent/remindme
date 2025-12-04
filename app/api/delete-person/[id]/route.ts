import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { Pinecone } from "@pinecone-database/pinecone";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const personId = params.id;

    // Get authenticated user from request
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json(
        { error: "Not authenticated" },
        { status: 401 }
      );
    }

    const token = authHeader.replace('Bearer ', '');
    
    // Create Supabase client with user's token so RLS works
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    });

    // Verify user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: "Invalid authentication" },
        { status: 401 }
      );
    }

    const userId = user.id;

    // Delete from Pinecone first (get memories associated with this person)
    const { data: memoryPeople } = await supabase
      .from("memory_people")
      .select("memory_id")
      .eq("person_id", personId);

    if (memoryPeople && memoryPeople.length > 0) {
      const pinecone = new Pinecone({
        apiKey: process.env.PINECONE_API_KEY!,
      });

      const index = pinecone.index("memories");

      // Delete vectors for each memory
      for (const mp of memoryPeople) {
        try {
          await index.deleteOne(`${userId}_${mp.memory_id}`);
        } catch (error) {
          console.error(`Failed to delete vector for memory ${mp.memory_id}:`, error);
          // Continue even if Pinecone delete fails
        }
      }
    }

    // Delete from Supabase (cascade will handle related records)
    // Delete person_business_profiles
    await supabase
      .from("people_business_profiles")
      .delete()
      .eq("person_id", personId);

    // Delete memory_people associations
    await supabase
      .from("memory_people")
      .delete()
      .eq("person_id", personId);

    // Delete follow-ups
    await supabase
      .from("follow_ups")
      .delete()
      .eq("person_id", personId);

    // Delete the person
    const { error: deleteError } = await supabase
      .from("people")
      .delete()
      .eq("id", personId)
      .eq("user_id", userId); // Ensure user owns this person

    if (deleteError) {
      console.error("Error deleting person from Supabase:", deleteError);
      throw deleteError;
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error in delete-person API:", error);
    return NextResponse.json(
      { error: "Failed to delete person" },
      { status: 500 }
    );
  }
}
