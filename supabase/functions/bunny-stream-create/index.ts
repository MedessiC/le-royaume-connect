import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.104.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

type CreateVideoRequest = {
  title?: string;
  fingerprint?: string;
  fileName?: string;
  mimeType?: string;
};

type BunnyCreateVideoResponse = {
  guid?: string;
  videoLibraryId?: number;
  title?: string;
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: {
      ...corsHeaders,
      "Content-Type": "application/json",
    },
  });

async function createTusSignature(
  libraryId: string,
  apiKey: string,
  expirationTimestamp: number,
  videoId: string
): Promise<string> {
  const message = `${libraryId}${apiKey}${expirationTimestamp}${videoId}`;
  const msgBuffer = new TextEncoder().encode(message);
  const hashBuffer = await crypto.subtle.digest("SHA-256", msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((byte) => byte.toString(16).padStart(2, "0")).join("");
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return json({ error: "Method not allowed" }, 405);
  }

  const libraryId = Deno.env.get("BUNNY_STREAM_LIBRARY_ID");
  const apiKey = Deno.env.get("BUNNY_STREAM_API_KEY");

  if (!libraryId || !apiKey) {
    return json({ error: "Bunny Stream is not configured on the server." }, 500);
  }

  let payload: CreateVideoRequest;
  try {
    payload = (await req.json()) as CreateVideoRequest;
  } catch {
    return json({ error: "Invalid JSON body." }, 400);
  }

  const title = payload.title?.trim() || "video";
  const fingerprint = payload.fingerprint?.trim();
  const fileName = payload.fileName?.trim();
  const mimeType = payload.mimeType?.trim();

  const createResponse = await fetch(`https://video.bunnycdn.com/library/${libraryId}/videos`, {
    method: "POST",
    headers: {
      AccessKey: apiKey,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ title }),
  });

  if (!createResponse.ok) {
    const errorText = await createResponse.text().catch(() => "");
    return json(
      {
        error: "Failed to create Bunny Stream video entry.",
        details: errorText || createResponse.statusText,
      },
      createResponse.status
    );
  }

  const created = (await createResponse.json()) as BunnyCreateVideoResponse;
  const videoId = created.guid;

  if (!videoId) {
    return json({ error: "Bunny Stream did not return a video ID." }, 502);
  }

  const expire = Math.floor(Date.now() / 1000) + 3600;
  const signature = await createTusSignature(libraryId, apiKey, expire, videoId);

  if (fingerprint) {
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (supabaseUrl && supabaseServiceKey) {
      const supabase = createClient(supabaseUrl, supabaseServiceKey);
      await supabase.from("bunny_media_files").upsert(
        {
          fingerprint,
          file_name: fileName || title,
          mime_type: mimeType || null,
          video_id: videoId,
          library_id: libraryId,
          embed_url: `https://iframe.mediadelivery.net/embed/${libraryId}/${videoId}`,
        },
        { onConflict: "fingerprint" }
      );
    }
  }

  return json({
    videoId,
    libraryId,
    expire,
    signature,
  });
});
