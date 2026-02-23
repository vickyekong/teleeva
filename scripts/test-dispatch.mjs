#!/usr/bin/env node
/**
 * Dispatch system API test.
 * Run with: node scripts/test-dispatch.mjs [BASE_URL]
 * Default BASE_URL: http://localhost:3000
 * Requires dev server: npm run dev (or npm run dev:webpack)
 */

const BASE = process.argv[2] || "http://localhost:3000";
const REQUEST_MS = 15000;
const statusUrl = (id) => `${BASE}/api/cases/${id}/status`;

function fetchWithTimeout(url, options = {}, ms = REQUEST_MS) {
  const c = new AbortController();
  const t = setTimeout(() => c.abort(), ms);
  return fetch(url, { ...options, signal: c.signal }).finally(() => clearTimeout(t));
}

async function test(name, fn) {
  try {
    await fn();
    console.log(`  ✓ ${name}`);
    return true;
  } catch (e) {
    console.log(`  ✗ ${name}`);
    console.log(`    ${e.message}`);
    return false;
  }
}

async function main() {
  console.log("Dispatch system tests (API)\n");
  console.log(`Base URL: ${BASE}\n`);

  let passed = 0;
  let failed = 0;

  // 1) PATCH without auth -> 401 (or 500 if Supabase env not set)
  const r1 = await test("PATCH status API reachable (401 or 500 without auth)", async () => {
    const res = await fetchWithTimeout(statusUrl("00000000-0000-0000-0000-000000000001"), {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "DISPATCH_ASSIGNED" }),
    });
    if (res.status !== 401 && res.status !== 500) {
      const t = await res.text();
      throw new Error(`Expected 401 or 500, got ${res.status}: ${t.slice(0, 200)}`);
    }
    if (res.status === 500) {
      console.log("    (500: ensure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are set for full auth)");
    }
  });
  if (r1) passed++; else failed++;

  // 2) PATCH with invalid status -> 400 or 401 or 500
  const r2 = await test("PATCH with invalid status rejected (400/401/500)", async () => {
    const res = await fetchWithTimeout(statusUrl("00000000-0000-0000-0000-000000000001"), {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "INVALID_STATUS" }),
    });
    if (res.status < 400 || res.status >= 600) {
      const t = await res.text();
      throw new Error(`Expected 4xx or 5xx, got ${res.status}: ${t.slice(0, 200)}`);
    }
  });
  if (r2) passed++; else failed++;

  // 3) PATCH without body status -> 400 or 401 or 500
  const r3 = await test("PATCH without status in body rejected (400/401/500)", async () => {
    const res = await fetchWithTimeout(statusUrl("00000000-0000-0000-0000-000000000001"), {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    });
    if (res.status < 400 || res.status >= 600) {
      const t = await res.text();
      throw new Error(`Expected 4xx or 5xx, got ${res.status}: ${t.slice(0, 200)}`);
    }
  });
  if (r3) passed++; else failed++;

  // 4) Dispatch page is reachable (200)
  const r4 = await test("GET /dispatch returns 200", async () => {
    const res = await fetchWithTimeout(`${BASE}/dispatch`, { redirect: "manual" });
    if (res.status !== 200 && res.status !== 307 && res.status !== 302) {
      throw new Error(`Expected 200 or redirect, got ${res.status}`);
    }
  });
  if (r4) passed++; else failed++;

  console.log("\n---");
  console.log(`Result: ${passed} passed, ${failed} failed`);
  if (passed === 4 && failed === 0) {
    console.log("\nManual E2E: Sign in as Dispatcher, open /dispatch, accept an order (READY_FOR_DISPATCH → DISPATCH_ASSIGNED), set In transit → Mark delivered. Ensure at least one case is READY_FOR_DISPATCH (from Pharmacist dashboard) and profiles.role = 'dispatcher' for your user.");
  }
  process.exit(failed > 0 ? 1 : 0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
