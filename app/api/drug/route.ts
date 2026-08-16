import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const { drugName } = await req.json();
  if (!drugName) return NextResponse.json({ error: 'No drug name provided' }, { status: 400 });

  // First check Supabase for pre-seeded data
  try {
    const slug = drugName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    
    const dbRes = await fetch(
      `${supabaseUrl}/rest/v1/drugs?slug=eq.${slug}&select=*`,
      { headers: { 'apikey': supabaseKey!, 'Authorization': `Bearer ${supabaseKey}` } }
    );
    const dbData = await dbRes.json();
    
    if (dbData && dbData.length > 0) {
      const drug = dbData[0];
      return NextResponse.json({
        name: drug.name,
        genericName: drug.generic_name,
        drugClass: drug.drug_class,
        whatItDoes: drug.what_it_does,
        howItWorks: drug.how_it_works,
        commonUses: drug.common_uses,
        sideEffects: drug.side_effects,
        warnings: drug.warnings,
        interactions: drug.interactions,
        dosageInfo: drug.dosage_info,
        takeWith: drug.take_with,
        missedDose: drug.missed_dose,
        source: 'NHS'
      });
    }
  } catch {}

  // Fall back to AI generation
  const prompt = `You are a UK pharmacy expert. Provide detailed, plain English information about: "${drugName}".
Return ONLY a JSON object with this exact structure:
{
  "name": "Drug name",
  "genericName": "Generic name",
  "drugClass": "Drug class",
  "whatItDoes": "2-3 sentence plain English explanation",
  "howItWorks": "Simple mechanism explanation",
  "commonUses": ["use 1", "use 2"],
  "sideEffects": [
    {"effect": "Nausea", "frequency": "Very common (>1 in 10)", "severity": "mild"},
    {"effect": "Headache", "frequency": "Common (1 in 10)", "severity": "mild"},
    {"effect": "Dizziness", "frequency": "Uncommon (1 in 100)", "severity": "moderate"}
  ],
  "warnings": ["warning 1", "warning 2"],
  "interactions": ["interaction 1"],
  "dosageInfo": "Typical UK dosage info",
  "takeWith": "Food/water instructions",
  "missedDose": "What to do if missed"
}
Include 6-8 side effects ranked most to least common. Severity must be: mild, moderate, or severe.
If not a real medication return: {"error": "Medication not found"}`;

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
        max_tokens: 2000,
        messages: [{ role: 'user', content: prompt }]
      })
    });

    const data = await response.json();
    const text = data.content[0].text;
    try {
      const parsed = JSON.parse(text);
      if (parsed.error) return NextResponse.json({ error: parsed.error }, { status: 404 });
      return NextResponse.json({ ...parsed, source: 'AI' });
    } catch {
      const match = text.match(/\{[\s\S]*\}/);
      if (match) return NextResponse.json({ ...JSON.parse(match[0]), source: 'AI' });
      return NextResponse.json({ error: 'Could not parse information' }, { status: 500 });
    }
  } catch {
    return NextResponse.json({ error: 'Failed to fetch drug information' }, { status: 500 });
  }
}
