// ============================================================
// lib/types/paper.ts
// Central type definitions — every phase imports from here
// ============================================================

export interface RawPaperInput {
  title: string;
  authors: RawAuthor[];
  abstract: string;
  keywords: string[];
  sections: RawSection[];
  rawReferences: string[];
}

export interface RawAuthor {
  name: string;
  affiliation?: string;
  email?: string;
}

export interface RawSection {
  heading: string;
  level: 1 | 2 | 3;
  body: string;
  subsections?: RawSection[];
  figures?: RawFigure[];
  tables?: RawTable[];
}

export interface RawFigure {
  id: string;
  caption: string;
  placeholder?: true;
}

export interface RawTable {
  id: string;
  caption: string;
  headers: string[];
  rows: string[][];
}

export interface ParsedPaper {
  title: string;
  authors: RawAuthor[];
  abstract: string;
  keywords: string[];
  sections: ParsedSection[];
  citationMap: CitationMap;
  orderedCitations: Citation[];
}

export interface ParsedSection {
  heading: string;
  level: 1 | 2 | 3;
  tokens: ContentToken[];
  subsections?: ParsedSection[];
  figures?: RawFigure[];
  tables?: RawTable[];
}

export type ContentToken =
  | { type: "text"; value: string }
  | { type: "citation"; citeKey: string; ieeeNumber: number };

export interface Citation {
  citeKey: string;
  ieeeNumber: number;
  authors: CitationAuthor[];
  title: string;
  year: string;
  type: CitationType;
  journal?: string;
  volume?: string;
  issue?: string;
  pages?: string;
  conference?: string;
  location?: string;
  publisher?: string;
  edition?: string;
  url?: string;
  accessDate?: string;
  rawText?: string;
  ieeeFormatted?: string;
}

export interface CitationAuthor {
  first: string;
  middle?: string;
  last: string;
}

export type CitationType =
  | "journal"
  | "conference"
  | "book"
  | "thesis"
  | "website"
  | "standard"
  | "unknown";

export type CitationMap = Map<string, Citation>;

export interface InlineCitationRaw {
  originalText: string;
  style: "author-year" | "bracket-key" | "ieee-number";
  authorHint?: string;
  yearHint?: string;
  keyHint?: string;
  numberHint?: number;
}

export interface ExportOptions {
  format: "docx" | "pdf" | "latex";
  columnLayout: "two-column" | "single-column";
  includeLineNumbers?: boolean;
}

export interface FormatRequest {
  paper: RawPaperInput;
  options?: Partial<ExportOptions>;
}

export interface FormatResponse {
  success: boolean;
  parsed?: ParsedPaper;
  warnings: FormatterWarning[];
}

export interface FormatterWarning {
  type:
    | "missing_reference"
    | "missing_citation"
    | "duplicate_reference"
    | "parse_failure";
  message: string;
    citeKey?: string;
}