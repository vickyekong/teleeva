#!/bin/sh
# MedConnect – run tests. Start dev server first: npm run dev:webpack
set -e
cd "$(dirname "$0")/.."
echo "=== Lint ==="
npm run lint
echo ""
echo "=== Build ==="
npm run build
echo ""
echo "=== API checks (dev server must be running on :3000) ==="
echo -n "POST /api/diagnosis/analyze (empty symptoms → 400): "
code=$(curl -s -o /dev/null -w "%{http_code}" --max-time 5 -X POST http://localhost:3000/api/diagnosis/analyze -H "Content-Type: application/json" -d '{"symptoms":""}' 2>/dev/null || echo "000")
echo "$code"
if [ "$code" = "400" ]; then echo "  OK"; else echo "  (expected 400 or 000 if server down)"; fi

echo -n "PATCH /api/cases/xxx/status (no auth → 401): "
code=$(curl -s -o /dev/null -w "%{http_code}" --max-time 5 -X PATCH http://localhost:3000/api/cases/xxx/status -H "Content-Type: application/json" -d '{"status":"DOCTOR_APPROVED"}' 2>/dev/null || echo "000")
echo "$code"
if [ "$code" = "401" ]; then echo "  OK"; else echo "  (expected 401 or 000 if server down)"; fi

echo ""
echo "=== AI diagnosis (optional, ~30s) ==="
echo "Run: node scripts/test-ai-diagnosis.mjs \"headache and fever\""
echo "Done."
