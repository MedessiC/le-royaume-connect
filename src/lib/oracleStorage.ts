export const isOracleStorageConfigured = Boolean(import.meta.env.VITE_API_URL);
const API_URL = (import.meta.env.VITE_API_URL || '').replace(/\/+$/, '');

export async function uploadToOracleStorage(file: File, folder: string) {
  const endpoint = `${API_URL || ''}/api/uploads?folder=${encodeURIComponent(folder)}&fileName=${encodeURIComponent(file.name)}`;

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': file.type || 'application/octet-stream',
    },
    body: file,
  });

  if (!response.ok) {
    let errorBody: any;
    try {
      errorBody = await response.json();
    } catch {
      errorBody = { error: response.statusText };
    }
    throw new Error(errorBody.error || errorBody.message || `Upload failed with status ${response.status}`);
  }

  const data = await response.json();
  return data.url as string;
}
