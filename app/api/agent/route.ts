import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const { messages, systemPrompt } = await req.json();

  const defaultSystem = `You are MedilyAgent, a friendly and knowledgeable medication guide. You ask ONE question at a time to understand a user's medical situation, then guide them to relevant medication information pages. Always use plain English, be warm and clear, and never diagnose or recommend specific medications as medical advice. Always say "your doctor may prescribe" not "you should take". Keep responses concise — 2-3 sentences maximum per response.`;

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY!,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: 500,
        system: systemPrompt || defaultSystem,
        messages
      })
    });

    const data = await response.json();
    return NextResponse.json({ response: data.content[0].text });
  } catch {
    return NextResponse.json({ error: 'Agent unavailable' }, { status: 500 });
  }
}
