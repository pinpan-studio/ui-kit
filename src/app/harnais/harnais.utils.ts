/** Découpe un texte en segments texte / `code` / **gras**. Évite tout innerHTML. */
export function inlineSegments(text: string): { code: boolean; bold: boolean; text: string }[] {
  return text.split('`').flatMap((part, i) =>
    i % 2 === 1
      ? [{ code: true, bold: false, text: part }]
      : part.split('**').map((t, j) => ({ code: false, bold: j % 2 === 1, text: t })),
  ).filter((s) => s.text.length > 0);
}

/** Copie dans le presse-papiers (silencieuse si l'API n'est pas disponible). */
export function copyText(text: string): void {
  navigator.clipboard?.writeText(text).catch(() => undefined);
}
