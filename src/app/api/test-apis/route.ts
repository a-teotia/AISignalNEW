import { NextResponse } from "next/server";

export async function GET() {
  const perplexityKey = process.env.PERPLEXITY_API_KEY;
  const openaiKey = process.env.OPENAI_API_KEY;

  if (!perplexityKey || perplexityKey === 'your_perplexity_api_key_here') {
    return NextResponse.json({
      error: 'Perplexity API key not configured',
      instructions: 'Add PERPLEXITY_API_KEY to your .env.local file'
    }, { status: 400 });
  }

  if (!openaiKey || openaiKey === 'your_openai_api_key_here') {
    return NextResponse.json({
      error: 'OpenAI API key not configured',
      instructions: 'Add OPENAI_API_KEY to your .env.local file'
    }, { status: 400 });
  }

  try {
    // Test Perplexity API
    const perplexityRes = await fetch("https://api.perplexity.ai/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${perplexityKey}`,
      },
      body: JSON.stringify({
        model: "sonar-deep-research",
        messages: [
          {
            role: "user",
            content: "Say 'Hello' in JSON format: {\"message\": \"Hello\"}"
          }
        ],
      }),
    });

    const perplexityText = await perplexityRes.text();
    let perplexityData;
    try {
      perplexityData = JSON.parse(perplexityText);
    } catch {
      return NextResponse.json({
        error: 'Perplexity API returned invalid JSON',
        response: perplexityText.substring(0, 200)
      }, { status: 500 });
    }

    if (!perplexityRes.ok) {
      return NextResponse.json({
        error: 'Perplexity API error',
        details: perplexityData.error?.message || 'Unknown error'
      }, { status: 500 });
    }

    // Test OpenAI API
    const openaiRes = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${openaiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o",
        messages: [
          {
            role: "user",
            content: "Say 'Hello' in JSON format: {\"message\": \"Hello\"}"
          }
        ],
      }),
    });

    const openaiData = await openaiRes.json();

    if (!openaiRes.ok) {
      return NextResponse.json({
        error: 'OpenAI API error',
        details: openaiData.error?.message || 'Unknown error'
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: 'Both APIs are working correctly',
      perplexity: {
        model: perplexityData.choices?.[0]?.message?.content?.substring(0, 50) + '...',
        status: 'OK'
      },
      openai: {
        model: openaiData.choices?.[0]?.message?.content?.substring(0, 50) + '...',
        status: 'OK'
      }
    });

  } catch (error) {
    return NextResponse.json({
      error: 'API test failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 