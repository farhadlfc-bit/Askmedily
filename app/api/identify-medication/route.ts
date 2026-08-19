import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const { image } = await req.json();

  if (!image) return NextResponse.json({ error: 'No image provided' }, { status: 400 });

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
        messages: [{
          role: 'user',
          content: [
            {
              type: 'image',
              source: {
                type: 'base64',
                media_type: 'image/jpeg',
                data: image
              }
            },
            {
              type: 'text',
              text: `Look at this medication packet or pill image and identify the medication.
              
Return ONLY a JSON object:
{
  "found": true,
  "name": "Medication name",
  "slug": "medication-name-lowercase-hyphenated",
  "confidence": "high/medium/low",
  "message": "Brief plain English message about what you found"
}

If you cannot identify a medication, return:
{
  "found": false,
  "message": "Could not identify a medication in this image. Please try a clearer photo of the front of the packet."
}

Only identify real, named medications. Do not guess if unclear.`
            }
          ]
        }]
      })
    });

    const data = await response.json();
    const text = data.content[0].text;

    try {
      const parsed = JSON.parse(text);
      return NextResponse.json(parsed);
    } catch {
      const match = text.match(/\{[\s\S]*\}/);
      if (match) return NextResponse.json(JSON.parse(match[0]));
      return NextResponse.json({ found: false, message: 'Could not process the image. Please try again.' });
    }
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
