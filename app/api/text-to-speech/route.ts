import { NextRequest, NextResponse } from 'next/server';

const DEFAULT_VOICE_ID = '21m00Tcm4TlvDq8ikWAM';

export async function POST(req: NextRequest) {
  const { text, voiceId } = await req.json();

  if (!text) return NextResponse.json({ error: 'No text provided' }, { status: 400 });

  const voice = voiceId || DEFAULT_VOICE_ID;

  try {
    const response = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${voice}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'xi-api-key': process.env.ELEVENLABS_API_KEY!,
        },
        body: JSON.stringify({
          text,
          model_id: 'eleven_turbo_v2',
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.75,
            style: 0.0,
            use_speaker_boost: true
          }
        })
      }
    );

    if (!response.ok) {
      const err = await response.text();
      return NextResponse.json({ error: err }, { status: 500 });
    }

    const audioBuffer = await response.arrayBuffer();
    const base64Audio = Buffer.from(audioBuffer).toString('base64');

    return NextResponse.json({ audio: base64Audio, mimeType: 'audio/mpeg' });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
