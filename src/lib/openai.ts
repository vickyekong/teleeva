/**
 * OpenAI client for MedConnect (Eva / AI diagnosis).
 * Use only on the server (API routes, Server Actions) — OPENAI_API_KEY must not be exposed to the client.
 */

import OpenAI from "openai";

let client: OpenAI | null = null;

export function getOpenAIClient(): OpenAI | null {
  const key = process.env.OPENAI_API_KEY;
  if (!key?.trim()) return null;
  if (!client) {
    client = new OpenAI({ apiKey: key });
  }
  return client;
}

export function hasOpenAI(): boolean {
  return Boolean(process.env.OPENAI_API_KEY?.trim());
}
