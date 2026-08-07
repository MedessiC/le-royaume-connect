export const normalizeExternalUrl = (value: string | null | undefined): string | null => {
  if (!value) return null;
  const trimmed = value.trim();
  if (!trimmed) return null;

  // Preserve complete URLs and protocol-relative URLs.
  if (/^[a-z][a-z0-9+.-]*:/.test(trimmed)) {
    return trimmed;
  }

  if (trimmed.startsWith("//")) {
    return `https:${trimmed}`;
  }

  return `https://${trimmed.replace(/^\/*/, "")}`;
};
