// ============================================================
// lib/parser/citationDetector.ts
// Detects inline citations in raw body text.
// Handles 3 styles:
//   1. Author-year:   (Smith, 2020) or (Smith and Lee, 2020)
//   2. Bracket-key:  [Smith2020]
//   3. IEEE-number:  [1] or [1,2,3]
// ============================================================

import { InlineCitationRaw } from "../types/paper";

// Regex patterns for each citation style
const AUTHOR_YEAR_REGEX = /\(([A-Z][a-zA-Z]+(?:\s+and\s+[A-Z][a-zA-Z]+)?,\s*\d{4})\)/g;
const BRACKET_KEY_REGEX = /\[([A-Z][a-zA-Z]+\d{4}[a-z]?)\]/g;
const IEEE_NUMBER_REGEX = /\[(\d+(?:,\s*\d+)*)\]/g;

/**
 * Scans a block of text and returns all inline citations found.
 * Does NOT resolve them to reference entries yet — that happens in Phase 3.
 */
export function detectInlineCitations(text: string): InlineCitationRaw[] {
  const results: InlineCitationRaw[] = [];

  // 1. Author-year style: (Smith, 2020)
  for (const match of text.matchAll(AUTHOR_YEAR_REGEX)) {
    const inner = match[1]; // "Smith, 2020"
    const parts = inner.split(",").map((s) => s.trim());
    results.push({
      originalText: match[0],
      style: "author-year",
      authorHint: parts[0],
      yearHint: parts[1],
    });
  }

  // 2. Bracket-key style: [Smith2020]
  for (const match of text.matchAll(BRACKET_KEY_REGEX)) {
    results.push({
      originalText: match[0],
      style: "bracket-key",
      keyHint: match[1],
    });
  }

  // 3. IEEE number style: [1] or [1,2,3]
  for (const match of text.matchAll(IEEE_NUMBER_REGEX)) {
    const numbers = match[1].split(",").map((n) => parseInt(n.trim(), 10));
    // Create one entry per number: [1,2] → two citations
    for (const num of numbers) {
      results.push({
        originalText: match[0],
        style: "ieee-number",
        numberHint: num,
      });
    }
  }

  return results;
}

/**
 * Builds a normalized citeKey from an InlineCitationRaw.
 * Used to match inline citations to reference entries.
 * Example: authorHint="Smith", yearHint="2020" → "Smith2020"
 */
export function buildCiteKey(citation: InlineCitationRaw): string {
  if (citation.style === "bracket-key" && citation.keyHint) {
    return citation.keyHint; // Already a key: "Smith2020"
  }
  if (citation.style === "author-year") {
    const author = citation.authorHint?.split(" ")[0] ?? "Unknown";
    const year = citation.yearHint ?? "0000";
    return `${author}${year}`; // "Smith2020"
  }
  if (citation.style === "ieee-number") {
    return `ref_${citation.numberHint}`; // "ref_1"
  }
  return "unknown";
}