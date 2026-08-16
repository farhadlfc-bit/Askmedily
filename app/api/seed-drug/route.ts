import { NextRequest, NextResponse } from 'next/server';

// This endpoint fetches NHS data and seeds one drug into Supabase
// Call: POST /api/seed-drug { slug, name, nhsUrl }
export async function POST(req: NextRequest) {
  const { slug, name, nhsUrl, adminKey } = await req.json();
  
  // Basic protection
  if (adminKey !== process.env.ADMIN_KEY) {
    return NextResponse.json({ error: 'Unauthorised' }, { status: 401 });
  }

  // Step 1: Fetch NHS page
  let nhsContent = '';
  try {
    const nhsRes = await fetch(nhsUrl);
    const html = await nhsRes.text();
    // Extract text content roughly
    nhsContent = html
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .substring(0, 8000);
  } catch {
    return NextResponse.json({ error: 'Could not fetch NHS page' }, { status: 500 });
  }

  // Step 2: Use Claude to convert NHS content to structured plain English
  const prompt = `You are a UK pharmacy expert. Based on this NHS information about ${name}, create a plain English structured summary for patients.

NHS SOURCE:
${nhsContent}

Return ONLY a JSON object:
{
  "name": "${name}",
  "genericName": "generic/chemical name",
  "drugClass": "drug class",
  "whatItDoes": "2-3 sentence plain English explanation of what it does and treats",
  "howItWorks": "simple mechanism in 1-2 sentences",
  "commonUses": ["condition 1", "condition 2", "condition 3"],
  "sideEffects": [
    {"effect": "Nausea", "frequency": "Very common (affects more than 1 in 10 people)", "severity": "mild"},
    {"effect": "Headache", "frequency": "Common (affects up to 1 in 10 people)", "severity": "mild"},
    {"effect": "Dizziness", "frequency": "Uncommon (affects up to 1 in 100 people)", "severity": "moderate"},
    {"effect": "Allergic reaction", "frequency": "Rare (affects up to 1 in 1,000 people)", "severity": "severe"}
  ],
  "warnings": ["important warning 1", "important warning 2", "important warning 3"],
  "interactions": ["interaction 1", "interaction 2"],
  "dosageInfo": "typical dosage information in plain English",
  "takeWith": "how to take it - food, water, timing",
  "missedDose": "what to do if you miss a dose"
}

Include 6-8 side effects from most to least common. Severity must be exactly: mild, moderate, or severe.`;

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
        max_tokens: 2000,
        messages: [{ role: 'user', content: prompt }]
      })
    });

    const aiData = await aiRes.json();
    const text = aiData.content[0].text;
    
    let drugData;
    try {
      drugData = JSON.parse(text);
    } catch {
      const match = text.match(/\{[\s\S]*\}/);
      if (!match) return NextResponse.json({ error: 'Parse error' }, { status: 500 });
      drugData = JSON.parse(match[0]);
    }

    // Step 3: Save to Supabase
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    const dbRes = await fetch(`${supabaseUrl}/rest/v1/drugs`, {
      method: 'POST',
      headers: {
        'apikey': supabaseKey!,
        'Authorization': `Bearer ${supabaseKey}`,
        'Content-Type': 'application/json',
        'Prefer': 'resolution=merge-duplicates'
      },
      body: JSON.stringify({
        slug,
        name: drugData.name,
        generic_name: drugData.genericName,
        drug_class: drugData.drugClass,
        what_it_does: drugData.whatItDoes,
        how_it_works: drugData.howItWorks,
        common_uses: drugData.commonUses,
        side_effects: drugData.sideEffects,
        warnings: drugData.warnings,
        interactions: drugData.interactions,
        dosage_info: drugData.dosageInfo,
        take_with: drugData.takeWith,
        missed_dose: drugData.missedDose,
        nhs_url: nhsUrl,
        source: 'NHS'
      })
    });

    if (!dbRes.ok) {
      const err = await dbRes.text();
      return NextResponse.json({ error: `DB error: ${err}` }, { status: 500 });
    }

    return NextResponse.json({ success: true, drug: drugData.name });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
