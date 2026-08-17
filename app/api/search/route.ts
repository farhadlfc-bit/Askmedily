import { NextRequest, NextResponse } from 'next/server';

// Simple fuzzy match score — lower = closer match
function levenshtein(a: string, b: string): number {
  const m = a.length, n = b.length;
  const dp = Array.from({ length: m + 1 }, (_, i) =>
    Array.from({ length: n + 1 }, (_, j) => (i === 0 ? j : j === 0 ? i : 0))
  );
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      dp[i][j] = a[i-1] === b[j-1]
        ? dp[i-1][j-1]
        : 1 + Math.min(dp[i-1][j], dp[i][j-1], dp[i-1][j-1]);
    }
  }
  return dp[m][n];
}

export async function POST(req: NextRequest) {
  const { query, type } = await req.json();
  if (!query || query.length < 2) return NextResponse.json({ results: [], suggestion: null });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  const q = query.toLowerCase().trim();

  // Fetch all names from the relevant table
  const table = type === 'condition' ? 'conditions' : 'drugs';
  const res = await fetch(
    `${supabaseUrl}/rest/v1/${table}?select=name,slug`,
    { headers: { 'apikey': supabaseKey, 'Authorization': `Bearer ${supabaseKey}` } }
  );
  const items: { name: string; slug: string }[] = await res.json();

  // Score each item
  const scored = items.map(item => {
    const name = item.name.toLowerCase();
    // Exact match
    if (name === q) return { ...item, score: 0 };
    // Starts with query
    if (name.startsWith(q)) return { ...item, score: 1 };
    // Contains query
    if (name.includes(q)) return { ...item, score: 2 };
    // Fuzzy match
    const distance = levenshtein(q, name.substring(0, q.length + 3));
    return { ...item, score: distance + 3 };
  })
  .filter(item => item.score < 6)
  .sort((a, b) => a.score - b.score)
  .slice(0, 5);

  // Best suggestion for "did you mean"
  const suggestion = scored.length > 0 && scored[0].score > 1 ? scored[0] : null;

  return NextResponse.json({ results: scored, suggestion });
}
