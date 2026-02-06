
// Hilfsfunktion zum Ersetzen typografischer Anführungszeichen durch ASCII-Quotes
function normalizeQuotes(str: string): string {
  // Erst Anführungszeichen normalisieren
  let s = str
    .replace(/[“”«»„‟❝❞〝〞＂]/g, '"')
    .replace(/[‘’‚‛❛❜⸂⸃⸄⸅⸉⸊⸌⸍⸜⸝⸠⸡]/g, "'");
  // Dann = zwischen Anführungszeichen durch : ersetzen (z.B. {"foo"="bar"} -> {"foo":"bar"})
  s = s.replace(/("[^"]*")\s*=\s*("[^"]*")/g, '$1:$2');
  return s;
}

export function isValidJSON(str: string): boolean {
  try {
    JSON.parse(normalizeQuotes(str.trim()));
    return true;
  } catch {
    return false;
  }
}

export function parseJSON(str: string): unknown {
  try {
    return JSON.parse(normalizeQuotes(str.trim()));
  } catch {
    return undefined;
  }
}
