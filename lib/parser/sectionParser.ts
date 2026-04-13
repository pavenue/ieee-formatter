// ============================================================
// lib/parser/sectionParser.ts
// Takes raw sections and tokenizes body text into
// plain text + citation tokens.
// ============================================================

import { RawSection, ParsedSection, ContentToken } from "../types/paper";
import { detectInlineCitations, buildCiteKey } from "./citationDetector";

/**
 * Converts a RawSection into a ParsedSection.
 * Body text is split into ContentTokens (text + citations).
 * Recursively handles subsections.
 */
export function parseSection(section: RawSection): ParsedSection {
  return {
    heading: section.heading,
    level: section.level,
    tokens: tokenizeBody(section.body),
    subsections: section.subsections?.map(parseSection),
    figures: section.figures,
    tables: section.tables,
  };
}

/**
 * Splits raw body text into an array of ContentTokens.
 *
 * Example input:
 *   "Neural networks are powerful (LeCun, 2015). As shown in [Smith2020]..."
 *
 * Example output:
 *   [
 *     { type: "text", value: "Neural networks are powerful " },
 *     { type: "citation", citeKey: "LeCun2015", ieeeNumber: 0 },
 *     { type: "text", value: ". As shown in " },
 *     { type: "citation", citeKey: "Smith2020", ieeeNumber: 0 },
 *     { type: "text", value: "..." },
 *   ]
 *
 * Note: ieeeNumber is 0 here — assigned later by the citation engine (Phase 3).
 */
export function tokenizeBody(text: string): ContentToken[] {
  const tokens: ContentToken[] = [];

  // Detect all inline citations in the text
  const citations = detectInlineCitations(text);

  if (citations.length === 0) {
    // No citations — whole text is one text token
    return [{ type: "text", value: text }];
  }

  let lastIndex = 0;

  for (const citation of citations) {
    const citIndex = text.indexOf(citation.originalText, lastIndex);
    if (citIndex === -1) continue;

    // Push text before this citation
    if (citIndex > lastIndex) {
      tokens.push({
        type: "text",
        value: text.slice(lastIndex, citIndex),
      });
    }

    // Push the citation token
    tokens.push({
      type: "citation",
      citeKey: buildCiteKey(citation),
      ieeeNumber: 0, // Assigned in Phase 3
    });

    lastIndex = citIndex + citation.originalText.length;
  }

  // Push any remaining text after the last citation
  if (lastIndex < text.length) {
    tokens.push({
      type: "text",
      value: text.slice(lastIndex),
    });
  }

  return tokens;
}