import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const perplexity = new OpenAI({
  apiKey: process.env.PERPLEXITY_API_KEY,
  baseURL: 'https://api.perplexity.ai',
});

interface AnalyzeRequest {
  type: 'interest' | 'company' | 'tech_stack';
  topic?: string; // For interests
  companyName?: string;
  companyLinkedInUrl?: string;
  personContext?: {
    name?: string;
    role?: string;
    company?: string;
  };
}

export async function POST(request: NextRequest) {
  try {
    const body: AnalyzeRequest = await request.json();
    const { type, topic, companyName, companyLinkedInUrl, personContext } = body;

    console.log(`🔍 Analyzing ${type}:`, topic || companyName);

    let result: any = {};

    switch (type) {
      case 'interest':
        result = await analyzeInterest(topic!);
        break;
      case 'company':
        result = await analyzeCompany(companyName!, companyLinkedInUrl);
        break;
      case 'tech_stack':
        result = await analyzeTechStack(companyName!, personContext);
        break;
      default:
        throw new Error(`Unknown research type: ${type}`);
    }

    return NextResponse.json({
      success: true,
      result,
    });

  } catch (error) {
    console.error('Error in research analyze API:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to analyze research topic' 
      },
      { status: 500 }
    );
  }
}

async function analyzeInterest(topic: string) {
  console.log(`📰 Researching interest: ${topic}`);
  
  const prompt = `Research "${topic}" and provide:
1. Latest news, updates, or highlights (2-3 sentences)
2. 4-5 relevant links to learn more (news articles, videos, official sources, social media)

Focus on current, recent information that would be useful for conversation.`;

  const response = await perplexity.chat.completions.create({
    model: 'sonar-pro',
    messages: [
      {
        role: 'system',
        content: 'You are a research assistant providing current news and updates on topics of interest.'
      },
      {
        role: 'user',
        content: prompt
      }
    ],
  });

  const content = response.choices[0].message.content || '';
  const links = extractLinks(content);

  return {
    type: 'interest',
    topic,
    summary: content.split('\n\n')[0] || content.substring(0, 300),
    links,
    last_updated: new Date().toISOString(),
  };
}

async function analyzeCompany(companyName: string, linkedInUrl?: string) {
  console.log(`🏢 Researching company: ${companyName}`);
  
  const prompt = `Research the company "${companyName}"${linkedInUrl ? ` (LinkedIn: ${linkedInUrl})` : ''} and provide:

1. Company Overview (2-3 sentences): What they do, size, industry
2. Latest News (1-2 items): Recent funding, product launches, news
3. Key Products/Services
4. Organizational Structure hints (if available)

Provide 5-7 relevant links including:
- Company website
- Recent news articles
- LinkedIn company page
- Crunchbase or similar
- Any relevant blog posts or press releases`;

  const response = await perplexity.chat.completions.create({
    model: 'sonar-pro',
    messages: [
      {
        role: 'system',
        content: 'You are a business research assistant providing comprehensive company information.'
      },
      {
        role: 'user',
        content: prompt
      }
    ],
  });

  const content = response.choices[0].message.content || '';
  const links = extractLinks(content);

  return {
    type: 'company',
    topic: companyName,
    summary: content,
    data: {
      company_name: companyName,
      linkedin_url: linkedInUrl,
    },
    links,
    last_updated: new Date().toISOString(),
  };
}

async function analyzeTechStack(companyName: string, personContext?: any) {
  console.log(`💻 Researching tech stack for: ${companyName}`);
  
  // Step 1: Use OpenAI to structure the research query
  const structurePrompt = `I need to research the technology stack used by ${companyName}. 
${personContext?.role ? `The person works as ${personContext.role}.` : ''}

Generate a focused research query to find:
1. Programming languages and frameworks they use
2. Infrastructure and cloud platforms
3. Databases and data tools
4. Development tools and practices

Return a concise search query (1-2 sentences).`;

  const structureResponse = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      {
        role: 'system',
        content: 'You are a technical research assistant. Generate focused search queries.'
      },
      {
        role: 'user',
        content: structurePrompt
      }
    ],
    temperature: 0.3,
  });

  const searchQuery = structureResponse.choices[0].message.content || '';
  console.log('🔎 Search query:', searchQuery);

  // Step 2: Use Perplexity to research with the structured query
  const researchPrompt = `${searchQuery}

Provide:
1. **Frontend Technologies**: Languages, frameworks, libraries
2. **Backend Technologies**: Languages, frameworks, APIs
3. **Infrastructure**: Cloud platforms, databases, caching, queues
4. **Development Tools**: Version control, CI/CD, monitoring

Format as clear sections. Include 6-8 relevant links:
- Job postings mentioning tech stack
- Engineering blog posts
- StackShare profile
- GitHub repositories (if public)
- Tech conference talks
- LinkedIn posts from engineers`;

  const researchResponse = await perplexity.chat.completions.create({
    model: 'sonar-pro',
    messages: [
      {
        role: 'system',
        content: 'You are a technical research assistant specializing in technology stack analysis.'
      },
      {
        role: 'user',
        content: researchPrompt
      }
    ],
  });

  const content = researchResponse.choices[0].message.content || '';
  const links = extractLinks(content);

  // Step 3: Use OpenAI to structure the output
  const parsePrompt = `Parse this tech stack research and extract structured data:

${content}

Return JSON with this structure:
{
  "frontend": ["React", "TypeScript", ...],
  "backend": ["Node.js", "Python", ...],
  "infrastructure": ["AWS", "PostgreSQL", ...],
  "tools": ["Git", "Docker", ...]
}

Only include technologies explicitly mentioned. Return valid JSON only.`;

  const parseResponse = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      {
        role: 'system',
        content: 'You extract structured data from text. Return only valid JSON.'
      },
      {
        role: 'user',
        content: parsePrompt
      }
    ],
    response_format: { type: 'json_object' },
    temperature: 0.1,
  });

  let technologies = {};
  try {
    technologies = JSON.parse(parseResponse.choices[0].message.content || '{}');
  } catch (e) {
    console.error('Failed to parse technologies:', e);
  }

  return {
    type: 'tech_stack',
    topic: `${companyName} - Tech Stack`,
    summary: content.substring(0, 500) + '...',
    data: {
      company_name: companyName,
      technologies,
    },
    links,
    last_updated: new Date().toISOString(),
  };
}

function extractLinks(content: string): Array<{ source: string; url: string; label: string }> {
  const links: Array<{ source: string; url: string; label: string }> = [];
  
  // Extract markdown links [text](url)
  const markdownRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
  let match;
  while ((match = markdownRegex.exec(content)) !== null) {
    const label = match[1];
    const url = match[2];
    
    let source = 'Website';
    if (url.includes('youtube.com') || url.includes('youtu.be')) source = 'YouTube';
    else if (url.includes('wikipedia.org')) source = 'Wikipedia';
    else if (url.includes('linkedin.com')) source = 'LinkedIn';
    else if (url.includes('github.com')) source = 'GitHub';
    else if (url.includes('stackoverflow.com')) source = 'StackOverflow';
    else if (url.includes('stackshare.io')) source = 'StackShare';
    else if (url.includes('crunchbase.com')) source = 'Crunchbase';
    else if (url.includes('techcrunch.com')) source = 'TechCrunch';
    else if (url.includes('news') || url.includes('blog')) source = 'News';
    
    links.push({ source, url, label });
  }
  
  // If no markdown links, try to extract plain URLs
  if (links.length === 0) {
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const urls = content.match(urlRegex) || [];
    urls.slice(0, 8).forEach((url, idx) => {
      let source = 'Website';
      if (url.includes('youtube.com')) source = 'YouTube';
      else if (url.includes('linkedin.com')) source = 'LinkedIn';
      else if (url.includes('github.com')) source = 'GitHub';
      
      links.push({
        source,
        url,
        label: `Resource ${idx + 1}`
      });
    });
  }
  
  return links.slice(0, 8); // Limit to 8 links
}
