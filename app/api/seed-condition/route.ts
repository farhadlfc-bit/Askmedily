import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const { slug, name, nhsUrl, adminKey } = await req.json();

  if (adminKey !== process.env.ADMIN_KEY) {
    return NextResponse.json({ error: 'Unauthorised' }, { status: 401 });
  }

  let nhsContent = '';
  try {
    const nhsRes = await fetch(nhsUrl);
    const html = await nhsRes.text();
    nhsContent = html
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .substring(0, 8000);
  } catch {
    return NextResponse.json({ error: 'Could not fetch NHS page' }, { status: 500 });
  }

  const prompt = `You are a UK clinical pharmacist. Based on this NHS information about ${name}, create a plain English structured summary.

NHS SOURCE:
${nhsContent}

Return ONLY a JSON object:
{
  "name": "${name}",
  "category": "Category (Cardiovascular, Respiratory, Mental Health, Diabetes, Musculoskeletal, Neurological, Gastrointestinal, Dermatological, Urological, Endocrine, Pain, Infection, Women's Health)",
  "description": "2-3 sentence plain English explanation of what this condition is",
  "symptoms": ["symptom 1", "symptom 2", "symptom 3", "symptom 4", "symptom 5"],
  "causes": ["cause 1", "cause 2", "cause 3"],
  "commonly_prescribed_drugs": ["Drug 1", "Drug 2", "Drug 3", "Drug 4"],
  "drug_slugs": ["drug-1", "drug-2", "drug-3", "drug-4"],
  "lifestyle_tips": ["tip 1", "tip 2", "tip 3"],
  "when_to_see_gp": "When someone should see their GP urgently"
}`;

  try {
    const aiRes = await fetch('https://api.anthropic.com/v1/messages', {
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

    const aiData = await aiRes.json();
    const text = aiData.content[0].text;

    let conditionData;
    try {
      conditionData = JSON.parse(text);
    } catch {
      const match = text.match(/\{[\s\S]*\}/);
      if (!match) return NextResponse.json({ error: 'Parse error' }, { status: 500 });
      conditionData = JSON.parse(match[0]);
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    const dbRes = await fetch(`${supabaseUrl}/rest/v1/conditions`, {
      method: 'POST',
      headers: {
        'apikey': supabaseKey!,
        'Authorization': `Bearer ${supabaseKey}`,
        'Content-Type': 'application/json',
        'Prefer': 'resolution=merge-duplicates'
      },
      body: JSON.stringify({
        slug,
        name: conditionData.name,
        category: conditionData.category,
        description: conditionData.description,
        symptoms: conditionData.symptoms,
        causes: conditionData.causes,
        commonly_prescribed_drugs: conditionData.commonly_prescribed_drugs,
        drug_slugs: conditionData.drug_slugs,
        lifestyle_tips: conditionData.lifestyle_tips,
        when_to_see_gp: conditionData.when_to_see_gp,
        nhs_url: nhsUrl,
        source: 'NHS'
      })
    });

    if (!dbRes.ok) {
      const err = await dbRes.text();
      return NextResponse.json({ error: `DB error: ${err}` }, { status: 500 });
    }

    return NextResponse.json({ success: true, condition: conditionData.name });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
