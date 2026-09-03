export interface ParsedFile {
  name: string
  content: string
}

/**
 * Pure parser for AI response -> markdown files.
 * Mirrors processResponse fallback regex in App.tsx.
 * Extracts `--- FILE: NAME --- ... --- END FILE ---` blocks.
 * Falls back to single AI_OUTPUT_RAW.md when no markers found.
 */
export function parseFilesFromResponse(aiResponse: string): ParsedFile[] {
  const fileRegex =
    /---\s*FILE:\s*([a-zA-Z0-9_.-]+)\s*---([\s\S]*?)---\s*END FILE\s*---/g
  const files: ParsedFile[] = []
  let match: RegExpExecArray | null
  while ((match = fileRegex.exec(aiResponse)) !== null) {
    files.push({ name: match[1].trim(), content: match[2].trim() })
  }
  if (files.length === 0) {
    files.push({ name: "AI_OUTPUT_RAW.md", content: aiResponse })
  }
  return files
}

export default parseFilesFromResponse
