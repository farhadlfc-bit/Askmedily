import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const { drugName } = await req.json();
  
  if (!drugName) return NextResponse.json({ error: 'No drug name provided' }, { status: 400 });

  const prompt = `You are a pharmacy expert. Provide detailed, plain English information about the medication: "${drugName}".

Return a JSON object with exactly this structure (no markdown, pure JSON):
{
  "name": "Brand name of the drug",
  "genericName": "Generic/chemical name",
  "drugClass": "Drug class/category",
  "whatItDoes": "2-3 sentence plain English explanation of what this drug does and what it treats",
  "howItWorks": "Simple explanation of mechanism of action",
  "commonUses": ["use 1", "use 2", "use 3"],
  "sideEffects": [
    {"effect": "Side effect name", "frequency": "Very common (>10%)", "severity": "mild"},
    {"effect": "Side effect name", "frequency": "Common (1-10%)", "severity": "moderate"},
    {"effect": "Side effect name", "frequency": "Uncommon (0.1-1%)", "severity": "severe"}
  ],
  "warnings": ["Important warning 1", "Important warning 2"],
  "interactions": ["Drug interaction 1", "Drug interaction 2"],
  "dosageInfo": "Typical dosage information in plain English",
  "takeWith": "Food/water/timing instructions",
  "missedDose": "What to do if a dose is missed"
}

Include 6-8 side effects ranked from most common to least common. Severity must be exactly: mild, moderate, or severe.
If the drug name is not a real medication, return: {"error": "Medication not found"}`;

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
      return NextResponse.json(parsed);
    } catch {
      const match = text.match(/\{[\s\S]*\}/);
      if (match) {
        const parsed = JSON.parse(match[0]);
        return NextResponse.json(parsed);
      }
      return NextResponse.json({ error: 'Could not parse drug information' }, { status: 500 });
    }
  } catch (err) {
    return NextResponse.json({ error: 'Failed to fetch drug information' }, { status: 500 });
  }
}
