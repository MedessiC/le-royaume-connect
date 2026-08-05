export const getTeachingPath = (teaching: { id: string; slug?: string | null }) =>
  `/teachings/${encodeURIComponent(teaching.slug || teaching.id)}`;
