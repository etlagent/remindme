import { NextResponse } from 'next/server';

export async function GET() {
  try {
    console.log('🧪 Testing Perplexity Search API...');
    console.log('API Key present:', !!process.env.PERPLEXITY_API_KEY);
    console.log('API Key starts with pplx:', process.env.PERPLEXITY_API_KEY?.startsWith('pplx'));
    
    // Use the Search API endpoint directly
    const response = await fetch('https://api.perplexity.ai/search', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.PERPLEXITY_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: 'latest AI developments 2024',
        max_results: 3,
      }),
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(`Perplexity API error: ${response.status} - ${JSON.stringify(data)}`);
    }
    
    console.log('✅ Perplexity Search API test succeeded!');
    console.log('Response:', data);

    return NextResponse.json({
      success: true,
      message: 'Perplexity Search API is working!',
      data,
    });

  } catch (error: any) {
    console.error('❌ Perplexity test failed:', error);
    
    return NextResponse.json({
      success: false,
      error: error.message,
      details: {
        hasApiKey: !!process.env.PERPLEXITY_API_KEY,
        keyFormat: process.env.PERPLEXITY_API_KEY?.substring(0, 10) + '...',
      }
    }, { status: 500 });
  }
}
