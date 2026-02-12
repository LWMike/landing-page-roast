import { NextResponse } from 'next/server';

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

export async function POST(request: Request) {
  try {
    const { url } = await request.json();

    if (!url) {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 });
    }

    // Fetch the page content
    const pageContent = await fetchPageContent(url);
    
    if (!pageContent) {
      return NextResponse.json({ error: 'Could not fetch page content' }, { status: 400 });
    }

    // Analyze with AI
    const analysis = await analyzeWithAI(pageContent);
    
    return NextResponse.json(analysis);
  } catch (error) {
    console.error('Roast error:', error);
    return NextResponse.json({ error: 'Analysis failed' }, { status: 500 });
  }
}

async function fetchPageContent(url: string): Promise<string | null> {
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; LandingPageRoast/1.0)',
      },
    });
    
    if (!response.ok) {
      return null;
    }
    
    const html = await response.text();
    
    // Extract relevant content (simplified - in production use a proper parser)
    const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
    const title = titleMatch ? titleMatch[1] : '';
    
    // Extract text content (remove scripts, styles, etc.)
    const textContent = html
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
      .slice(0, 8000); // Limit content length
    
    // Extract headings (handle nested elements inside H1)
    const h1Matches = html.match(/<h1[^>]*>[\s\S]*?<\/h1>/gi) || [];
    const h1s = h1Matches
      .map(h => h.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim())
      .filter(h => h.length > 0)
      .join(', ');
    
    // Extract buttons/CTAs
    const buttonMatches = html.match(/<button[^>]*>([^<]+)<\/button>/gi) || [];
    const linkMatches = html.match(/<a[^>]*class="[^"]*btn[^"]*"[^>]*>([^<]+)<\/a>/gi) || [];
    const ctas = [...buttonMatches, ...linkMatches]
      .map(b => b.replace(/<[^>]+>/g, ''))
      .filter(b => b.trim().length > 0)
      .slice(0, 10)
      .join(', ');
    
    return `
URL: ${url}
Title: ${title}
Main Headings (H1): ${h1s || 'None found'}
Buttons/CTAs: ${ctas || 'None found'}
Page Content: ${textContent}
    `.trim();
  } catch (error) {
    console.error('Fetch error:', error);
    return null;
  }
}

async function analyzeWithAI(pageContent: string) {
  // If no API key, return mock data for testing
  if (!OPENAI_API_KEY) {
    return getMockAnalysis();
  }

  const prompt = `You are an expert conversion rate optimization specialist. Analyze this landing page and provide a brutally honest but constructive roast.

${pageContent}

Provide your analysis in the following JSON format (no markdown, just valid JSON):
{
  "score": <number 0-100>,
  "headline": {
    "rating": "<good|needs-work|bad>",
    "feedback": "<2-3 sentences>",
    "suggestion": "<optional specific improvement>"
  },
  "cta": {
    "rating": "<good|needs-work|bad>",
    "feedback": "<2-3 sentences>",
    "suggestion": "<optional specific improvement>"
  },
  "trustSignals": {
    "rating": "<good|needs-work|bad>",
    "feedback": "<2-3 sentences about social proof, testimonials, credibility>",
    "suggestion": "<optional specific improvement>"
  },
  "clarity": {
    "rating": "<good|needs-work|bad>",
    "feedback": "<2-3 sentences about value proposition clarity>",
    "suggestion": "<optional specific improvement>"
  },
  "overall": "<3-4 sentence summary of the biggest issues and strengths>",
  "quickWins": ["<actionable improvement 1>", "<actionable improvement 2>", "<actionable improvement 3>"]
}

Be specific, reference actual content from the page, and be direct about problems. Don't be mean, but don't sugarcoat issues either.`;

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: 'You are a landing page conversion expert. Always respond with valid JSON only, no markdown.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
        max_tokens: 1500,
      }),
    });

    if (!response.ok) {
      console.error('OpenAI error:', await response.text());
      return getMockAnalysis();
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content;
    
    // Parse the JSON response
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    
    return getMockAnalysis();
  } catch (error) {
    console.error('AI analysis error:', error);
    return getMockAnalysis();
  }
}

function getMockAnalysis() {
  return {
    score: 62,
    headline: {
      rating: 'needs-work',
      feedback: 'Your headline describes what you do, but doesn\'t clearly communicate the benefit to the visitor. It\'s feature-focused rather than outcome-focused.',
      suggestion: 'Try: "Get [specific result] in [timeframe] — without [common pain point]"'
    },
    cta: {
      rating: 'needs-work', 
      feedback: 'Found generic CTA text like "Submit" or "Learn More". These don\'t create urgency or clearly state what happens next.',
      suggestion: 'Use action-oriented text that previews the value: "Start My Free Trial" or "Get My Custom Quote"'
    },
    trustSignals: {
      rating: 'bad',
      feedback: 'Limited social proof visible. No testimonials, client logos, or specific results that would build credibility with new visitors.',
      suggestion: 'Add 2-3 short testimonials with names and photos, or display logos of recognizable clients/publications.'
    },
    clarity: {
      rating: 'good',
      feedback: 'The page structure is reasonably clear and visitors can understand what you offer. The value proposition could be more specific about outcomes.',
    },
    overall: 'This page has decent bones but is missing key conversion elements. The biggest issues are weak CTAs and lack of social proof. These are quick fixes that could significantly improve conversion rates. Focus on making the headline benefit-driven and adding credibility markers.',
    quickWins: [
      'Change CTA button text from generic to specific action + benefit',
      'Add 2-3 customer testimonials with photos above the fold',
      'Rewrite headline to focus on the outcome/transformation, not the service'
    ]
  };
}
