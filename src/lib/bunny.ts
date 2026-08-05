import { Upload } from "tus-js-client";
import { supabase } from "@/integrations/supabase/client";

function hashBytes(bytes: Uint8Array): string {
  let hash = 2166136261;
  for (let i = 0; i < bytes.length; i += 1) {
    hash ^= bytes[i];
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0).toString(16).padStart(8, "0");
}

export async function computeFileFingerprint(file: File | Blob): Promise<string> {
  let bytes: Uint8Array;

  if ("arrayBuffer" in file && typeof file.arrayBuffer === "function") {
    const buffer = await file.arrayBuffer();
    bytes = new Uint8Array(buffer);
  } else if ("text" in file && typeof file.text === "function") {
    const text = await file.text();
    bytes = new TextEncoder().encode(text);
  } else {
    const fallbackText = `${(file as Blob).size ?? 0}-${(file as Blob).type || "application/octet-stream"}`;
    bytes = new TextEncoder().encode(fallbackText);
  }

  const sizeSuffix = bytes.length.toString(16).padStart(4, "0");
  const typeSuffix = (file.type || "application/octet-stream").replace(/[^a-z0-9]+/gi, "").slice(0, 16);
  return `${hashBytes(bytes)}-${sizeSuffix}-${typeSuffix}`;
}

export const isBunnyStreamConfigured = Boolean(
  import.meta.env.VITE_SUPABASE_URL &&
    (import.meta.env.VITE_SUPABASE_ANON_KEY || import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY)
);

const BUNNY_TUS_UPLOAD_URL = "https://video.bunnycdn.com/tusupload";
const BUNNY_IFRAME_BASE = "https://iframe.mediadelivery.net/embed";

type BunnyStreamCreateResponse = {
  videoId: string;
  libraryId: string;
  expire: number;
  signature: string;
};

type BunnyStreamDedupResponse = {
  existing?: {
    videoId: string;
    libraryId: string;
    embedUrl: string;
  } | null;
};

export async function uploadToBunnyStream(
  file: File,
  onProgress?: (percent: number) => void
): Promise<{ videoId: string; libraryId: string; embedUrl: string }> {
  if (!isBunnyStreamConfigured) {
    throw new Error(
      "Bunny Stream n’est pas configuré. Vérifiez VITE_SUPABASE_URL et VITE_SUPABASE_ANON_KEY."
    );
  }

  const title = file.name || "video";
  const fingerprint = await computeFileFingerprint(file);

  const { data: dedupData, error: dedupError } = await supabase.functions.invoke<BunnyStreamDedupResponse>(
    "bunny-stream-dedup",
    {
      body: { title, fingerprint, fileName: file.name, mimeType: file.type },
    }
  );

  if (dedupError) {
    console.warn("Bunny dedup lookup failed, falling back to a fresh upload", dedupError);
  }

  if (dedupData?.existing?.videoId && dedupData.existing.embedUrl) {
    return {
      videoId: dedupData.existing.videoId,
      libraryId: dedupData.existing.libraryId,
      embedUrl: dedupData.existing.embedUrl,
    };
  }

  const { data, error } = await supabase.functions.invoke<BunnyStreamCreateResponse>(
    "bunny-stream-create",
    {
      body: { title, fingerprint, fileName: file.name, mimeType: file.type },
    }
  );

  if (error) {
    throw new Error(error.message || "Impossible de créer l’entrée vidéo Bunny Stream.");
  }

  if (!data?.videoId || !data.libraryId || !data.expire || !data.signature) {
    throw new Error("Réponse Bunny Stream invalide lors de la création de la vidéo.");
  }

  return new Promise((resolve, reject) => {
    const upload = new Upload(file, {
      endpoint: BUNNY_TUS_UPLOAD_URL,
      headers: {
        AuthorizationSignature: data.signature,
        AuthorizationExpire: String(data.expire),
        VideoId: String(data.videoId),
        LibraryId: data.libraryId,
      },
      metadata: {
        filename: file.name,
        filetype: file.type,
      },
      onError(err) {
        reject(new Error(err?.toString?.() || "Erreur d'upload Bunny Stream."));
      },
      onProgress(bytesUploaded, bytesTotal) {
        if (bytesTotal && onProgress) {
          onProgress(Math.round((bytesUploaded / bytesTotal) * 100));
        }
      },
      onSuccess() {
        resolve({
          videoId: String(data.videoId),
          libraryId: data.libraryId,
          embedUrl: `${BUNNY_IFRAME_BASE}/${data.libraryId}/${data.videoId}`,
        });
      },
    });

    upload.start();
  });
}
