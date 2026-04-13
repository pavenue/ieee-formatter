// ============================================================
// lib/parser/index.ts
// Entry point for the parser.
// Takes RawPaperInput → returns ParsedPaper (without citation
// numbers yet — those are assigned in Phase 3).
// ============================================================

import { RawPaperInput, ParsedPaper, CitationMap, Citation } from "../types/paper";
import { parseSection } from "./sectionParser";
import { detectInlineCitations, buildCiteKey } from "./citationDetector";

/**
 * Main parser function.
 * Call this with raw user input → get back a ParsedPaper.
 */
export function parsePaper(input: RawPaperInput): ParsedPaper {
  // 1. Parse all sections (tokenizes body text)
  const sections = input.sections.map(parseSection);

  // 2. Collect all unique cite keys found across all sections
  const citationMap: CitationMap = new Map();

  for (const section of input.sections) {
    extractCiteKeys(section.body, citationMap);
    section.subsections?.forEach((sub) =>
      extractCiteKeys(sub.body, citationMap)
    );
  }

  return {
    title: input.title,
    authors: input.authors,
    abstract: input.abstract,
    keywords: input.keywords,
    sections,
    citationMap,
    orderedCitations: [], // Filled in Phase 3
  };
}

/**
 * Scans a body string and adds any new cite keys to the map.
 * Citation objects are empty shells here — Phase 3 fills them in.
 */
function extractCiteKeys(body: string, citationMap: CitationMap): void {
  const found = detectInlineCitations(body);

  for (const raw of found) {
    const key = buildCiteKey(raw);

    if (!citationMap.has(key)) {
      // Placeholder — Phase 3 will populate all fields
      const placeholder: Citation = {
        citeKey: key,
        ieeeNumber: 0,
        authors: [],
        title: "",
        year: "",
        type: "unknown",
      };
      citationMap.set(key, placeholder);
    }
  }
}