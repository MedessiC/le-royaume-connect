import { Upload } from "tus-js-client";
import { supabase } from "@/integrations/supabase/client";

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
  const { data, error } = await supabase.functions.invoke<BunnyStreamCreateResponse>(
    "bunny-stream-create",
    {
      body: { title },
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
