#!/usr/bin/env node
/**
 * Quick test for AI diagnosis API. Run from project root:
 *   node scripts/test-ai-diagnosis.mjs [symptoms]
 * Requires: dev server running (npm run dev) and OPENAI_API_KEY in .env.local
 * If this times out, test in the browser: http://localhost:3000/ai-diagnosis
 */

const base = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
const url = `${base}/api/diagnosis/analyze`;

async function main() {
  const symptoms = process.argv[2] || 'mild headache and tiredness for 2 days';
  console.log('Testing AI diagnosis...');
  console.log('Symptoms:', symptoms);
  console.log('POST', url);
  console.log('(First request may take 15–60s; OpenAI + cold start)\n');

  const start = Date.now();
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ symptoms }),
      signal: AbortSignal.timeout(60000),
    });
    const elapsed = ((Date.now() - start) / 1000).toFixed(1);
    const data = await res.json();

    if (!res.ok) {
      console.error('Error', res.status, data);
      process.exit(1);
    }

    console.log(`\nOK (${elapsed}s)\n`);
    console.log('Risk level:', data.riskLevel);
    console.log('Confidence:', data.confidence + '%');
    console.log('Conditions:', data.conditions?.map(c => c.name).join(', ') || '—');
    console.log('Medications:', data.medications?.length ? data.medications.map(m => `${m.name} ${m.dosage}`).join('; ') : '—');
    console.log('Saved to cases:', data.saved === true ? 'yes' : 'no');
    console.log('\nDisclaimer:', data.disclaimer?.slice(0, 80) + '...');
  } catch (err) {
    console.error('Request failed:', err.message || err);
    process.exit(1);
  }
}

main();
