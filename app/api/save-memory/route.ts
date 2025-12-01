import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function POST(request: Request) {
  try {
    const { rawText, structuredData } = await request.json();

    // Get current user from auth header (you'll need to implement proper auth)
    // For now, we'll use a placeholder
    const userId = "00000000-0000-0000-0000-000000000000"; // TODO: Get from auth

    // 1. Create or get event if mentioned
    let eventId = null;
    if (structuredData.event) {
      const { data: existingEvent } = await supabase
        .from("events")
        .select("id")
        .eq("user_id", userId)
        .eq("name", structuredData.event.name)
        .single();

      if (existingEvent) {
        eventId = existingEvent.id;
      } else {
        const { data: newEvent, error: eventError } = await supabase
          .from("events")
          .insert({
            user_id: userId,
            name: structuredData.event.name,
            date: structuredData.event.date || null,
            location: structuredData.event.location || null,
          })
          .select()
          .single();

        if (eventError) throw eventError;
        eventId = newEvent.id;
      }
    }

    // 2. Create memory
    const { data: memory, error: memoryError } = await supabase
      .from("memories")
      .insert({
        user_id: userId,
        raw_text: rawText,
        source_type: "typed", // or detect from context
        ai_type: structuredData.people?.length > 0 ? "person" : "other",
        event_id: eventId,
        who: structuredData.people?.map((p: any) => p.name).join(", ") || null,
        what: structuredData.summary || null,
        energy_summary: structuredData.summary || null,
        sections: structuredData.sections || [],
      })
      .select()
      .single();

    if (memoryError) throw memoryError;

    // 3. Create or update people
    const peopleIds: string[] = [];
    if (structuredData.people) {
      for (const personData of structuredData.people) {
        const { data: person, error: personError } = await supabase
          .from("people")
          .insert({
            user_id: userId,
            name: personData.name,
            company: personData.company,
            role: personData.role,
            business_needs: personData.business_needs,
            technologies: personData.technologies || [],
            interests: personData.interests || [],
            skills: personData.skills || [],
            inspiration_level: personData.inspiration_level,
            relationship_potential: personData.relationship_potential,
          })
          .select()
          .single();

        if (personError) throw personError;
        peopleIds.push(person.id);
      }
    }

    // 4. Link memory to people
    if (peopleIds.length > 0) {
      const memoryPeopleLinks = peopleIds.map((personId) => ({
        memory_id: memory.id,
        person_id: personId,
      }));

      const { error: linkError } = await supabase
        .from("memory_people")
        .insert(memoryPeopleLinks);

      if (linkError) throw linkError;
    }

    // 5. Create follow-ups
    if (structuredData.follow_ups) {
      const followUps = structuredData.follow_ups.map((fu: any) => ({
        user_id: userId,
        person_id: peopleIds[0] || null, // Link to first person if available
        memory_id: memory.id,
        description: fu.description,
        priority: fu.priority || "medium",
        status: "pending",
      }));

      const { error: followUpError } = await supabase
        .from("follow_ups")
        .insert(followUps);

      if (followUpError) throw followUpError;
    }

    return NextResponse.json({ success: true, memoryId: memory.id });
  } catch (error: any) {
    console.error("Error saving memory:", error);
    return NextResponse.json(
      { error: error.message || "Failed to save memory" },
      { status: 500 }
    );
  }
}
