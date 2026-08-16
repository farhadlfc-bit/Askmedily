import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const { conditionName } = await req.json();
  if (!conditionName) return NextResponse.json({ error: 'No condition provided' }, { status: 400 });

  // Check Supabase first
  try {
    const slug = conditionName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    const dbRes = await fetch(
      `${supabaseUrl}/rest/v1/conditions?slug=eq.${slug}&select=*`,
      { headers: { 'apikey': supabaseKey!, 'Authorization': `Bearer ${supabaseKey}` } }
    );
    const dbData = await dbRes.json();
    if (dbData && dbData.length > 0) {
      return NextResponse.json({ ...dbData[0], source: 'NHS' });
    }
  } catch {}

  // Fall back to AI
  const prompt = `You are a UK clinical pharmacist. Provide structured plain English information about the medical condition: "${conditionName}".

Return ONLY a JSON object:
{
  "name": "Condition name",
  "category": "Category (e.g. Cardiovascular, Respiratory, Mental Health, Diabetes, etc.)",
  "description": "2-3 sentence plain English explanation of what this condition is",
  "symptoms": ["symptom 1", "symptom 2", "symptom 3", "symptom 4", "symptom 5"],
  "causes": ["cause 1", "cause 2", "cause 3"],
  "commonly_prescribed_drugs": ["Drug name 1", "Drug name 2", "Drug name 3", "Drug name 4"],
  "drug_slugs": ["drug-slug-1", "drug-slug-2", "drug-slug-3", "drug-slug-4"],
  "lifestyle_tips": ["tip 1", "tip 2", "tip 3"],
  "when_to_see_gp": "When someone should urgently see their GP or call 999"
}

Use UK NHS prescribing guidelines. Drug slugs should be lowercase with hyphens (e.g. metformin, atorvastatin, lisinopril).`;

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
        max_tokens: 1500,
        messages: [{ role: 'user', content: prompt }]
      })
    });
    const data = await response.json();
    const text = data.content[0].text;
    try {
      return NextResponse.json({ ...JSON.parse(text), source: 'AI' });
    } catch {
      const match = text.match(/\{[\s\S]*\}/);
      if (match) return NextResponse.json({ ...JSON.parse(match[0]), source: 'AI' });
      return NextResponse.json({ error: 'Could not parse condition information' }, { status: 500 });
    }
  } catch {
    return NextResponse.json({ error: 'Failed to fetch condition information' }, { status: 500 });
  }
}
