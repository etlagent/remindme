import { NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: Request) {
  try {
    const { rawText } = await request.json();

    if (!rawText) {
      return NextResponse.json(
        { error: "No text provided" },
        { status: 400 }
      );
    }

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `You are an AI assistant that helps organize personal notes about people and networking encounters.

Extract and structure the following information from the user's notes:

1. **People**: Array of people mentioned with:
   - name (or null if not mentioned)
   - company
   - role
   - business_needs
   - technologies (array)
   - interests (array)
   - skills (array)
   - inspiration_level ("low", "medium", or "high")
   - relationship_potential ("no", "maybe", or "yes")

2. **Event**: If an event is mentioned:
   - name
   - date (if mentioned)
   - location

3. **Summary**: A brief summary of the encounter/notes

4. **Follow-ups**: Array of suggested follow-up actions with:
   - description
   - priority ("low", "medium", or "high")

5. **Sections**: Array of applicable categories from: ["personal", "business", "projects", "relationships", "todos", "events", "trips"]

Return ONLY valid JSON with no additional text.`,
        },
        {
          role: "user",
          content: rawText,
        },
      ],
      response_format: { type: "json_object" },
      temperature: 0.7,
    });

    const result = JSON.parse(completion.choices[0].message.content || "{}");

    return NextResponse.json(result);
  } catch (error: any) {
    console.error("Error organizing with AI:", error);
    return NextResponse.json(
      { error: error.message || "Failed to organize notes" },
      { status: 500 }
    );
  }
}
