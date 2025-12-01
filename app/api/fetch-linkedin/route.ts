import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { linkedInUrl } = await request.json();

    if (!linkedInUrl) {
      return NextResponse.json(
        { error: "No LinkedIn URL provided" },
        { status: 400 }
      );
    }

    // Extract name from LinkedIn URL pattern
    // Example: https://linkedin.com/in/brian-griffin-64065719/ -> Brian Griffin
    const urlMatch = linkedInUrl.match(/\/in\/([^\/\?]+)/);
    if (urlMatch) {
      const slug = urlMatch[1];
      // Remove numbers and convert dashes to spaces
      const nameParts = slug.split('-').filter((part: string) => !part.match(/^\d+$/));
      const name = nameParts.map((part: string) => 
        part.charAt(0).toUpperCase() + part.slice(1)
      ).join(' ');

      return NextResponse.json({
        name,
        linkedin_url: linkedInUrl,
        note: "Name extracted from URL. For full profile data, use 'Paste Entire LinkedIn Profile' field.",
      });
    }

    return NextResponse.json(
      { error: "Could not parse LinkedIn URL" },
      { status: 400 }
    );

  } catch (error: any) {
    console.error("Error parsing LinkedIn URL:", error);
    return NextResponse.json(
      { error: error.message || "Failed to parse LinkedIn URL" },
      { status: 500 }
    );
  }
}
