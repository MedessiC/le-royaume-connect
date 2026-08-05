import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.104.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: {
      ...corsHeaders,
      "Content-Type": "application/json",
    },
  });

type DedupRequest = {
  fingerprint?: string;
  fileName?: string;
  mimeType?: string;
  title?: string;
};

type ExistingVideo = {
  id?: string;
  video_id?: string;
  library_id?: string;
  embed_url?: string;
  fingerprint?: string | null;
  file_name?: string | null;
  mime_type?: string | null;
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return json({ error: "Method not allowed" }, 405);
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

  if (!supabaseUrl || !supabaseServiceKey) {
    return json({ error: "Server configuration missing" }, 500);
  }

  let payload: DedupRequest = {};
  try {
    payload = (await req.json()) as DedupRequest;
  } catch {
    return json({ error: "Invalid JSON body." }, 400);
  }

  const fingerprint = payload.fingerprint?.trim();
  if (!fingerprint) {
    return json({ existing: null });
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  const { data, error } = await supabase
    .from("bunny_media_files")
    .select("id, video_id, library_id, embed_url, fingerprint, file_name, mime_type")
    .eq("fingerprint", fingerprint)
    .maybeSingle();

  if (error) {
    console.error("Dedup lookup error", error);
    return json({ existing: null });
  }

  const existing = data as ExistingVideo | null;
  if (!existing?.video_id || !existing.library_id || !existing.embed_url) {
    return json({ existing: null });
  }

  return json({
    existing: {
      videoId: existing.video_id,
      libraryId: existing.library_id,
      embedUrl: existing.embed_url,
    },
  });
});
