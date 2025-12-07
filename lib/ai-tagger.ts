import OpenAI from "openai";

interface TaggingResult {
  keywords: string[];
  entities: string[];
  industries: string[];
}

/**
 * Uses AI to extract keywords, entities (people/companies), and industries from text
 */
export async function tagConversationOrMemory(
  text: string,
  personName?: string
): Promise<TaggingResult> {
  try {
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY!,
    });

    const prompt = `Analyze this conversation/memory and extract:
1. Keywords: Important topics, themes, or subjects discussed (3-7 keywords)
2. Entities: People names (other than ${personName || 'the main person'}), company names, or organization names mentioned
3. Industries: Industry sectors, business domains, or markets referenced

Text: "${text}"

Return ONLY a JSON object in this format:
{
  "keywords": ["keyword1", "keyword2", ...],
  "entities": ["entity1", "entity2", ...],
  "industries": ["industry1", "industry2", ...]
}

Rules:
- Keep keywords concise (1-3 words each)
- Only extract entities explicitly mentioned in the text
- Use standard industry names (e.g., "technology", "healthcare", "finance")
- Return empty arrays if nothing relevant found
- No explanations, ONLY the JSON object`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "You are a metadata extraction assistant. Extract keywords, entities, and industries from text. Always return valid JSON only.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.3,
      max_tokens: 300,
    });

    const content = response.choices[0]?.message?.content?.trim();
    if (!content) {
      console.warn("AI tagging returned empty response");
      return { keywords: [], entities: [], industries: [] };
    }

    // Parse the JSON response
    const result = JSON.parse(content);

    // Validate and clean the results
    return {
      keywords: Array.isArray(result.keywords)
        ? result.keywords.slice(0, 7).map((k: string) => k.toLowerCase())
        : [],
      entities: Array.isArray(result.entities)
        ? result.entities.slice(0, 10)
        : [],
      industries: Array.isArray(result.industries)
        ? result.industries.slice(0, 5).map((i: string) => i.toLowerCase())
        : [],
    };
  } catch (error) {
    console.error("AI tagging error:", error);
    // Return empty arrays on error - don't fail the whole operation
    return { keywords: [], entities: [], industries: [] };
  }
}
