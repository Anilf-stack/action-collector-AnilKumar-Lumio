// lib/chunking.ts
export function splitTranscript(text: string, maxChars = 4000, overlap = 200): string[] {
  const clean = (text || "").replace(/\r\n/g, "\n").trim();
  if (!clean) return [];
  if (clean.length <= maxChars) return [clean];

  const parts: string[] = [];
  let idx = 0;
  while (idx < clean.length) {
    const end = Math.min(idx + maxChars, clean.length);
    let chunk = clean.slice(idx, end);
    // try to break on paragraph boundary
    const lastDouble = chunk.lastIndexOf("\n\n");
    if (lastDouble > 200 && end !== clean.length) {
      chunk = chunk.slice(0, lastDouble);
      idx = idx + lastDouble - overlap;
    } else {
      idx = end - overlap;
    }
    if (idx < 0) idx = 0;
    parts.push(chunk.trim());
  }
  return parts.filter(Boolean);
}
