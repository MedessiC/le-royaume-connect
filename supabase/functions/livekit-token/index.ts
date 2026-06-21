import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.104.1";
import { AccessToken } from "npm:livekit-server-sdk@2.13.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

type TokenMode = "call" | "live-host" | "viewer";

type TokenRequest = {
  roomName?: string;
  mode?: TokenMode;
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: {
      ...corsHeaders,
      "Content-Type": "application/json",
    },
  });

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return json({ error: "Method not allowed" }, 405);
  }

  const livekitUrl = Deno.env.get("LIVEKIT_URL");
  const livekitApiKey = Deno.env.get("LIVEKIT_API_KEY");
  const livekitApiSecret = Deno.env.get("LIVEKIT_API_SECRET");
  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const supabasePublishableKeys = Deno.env.get("SUPABASE_PUBLISHABLE_KEYS");
  const supabaseAnonKey =
    Deno.env.get("SUPABASE_ANON_KEY") ??
    (supabasePublishableKeys ? JSON.parse(supabasePublishableKeys).default : undefined);

  if (!livekitUrl || !livekitApiKey || !livekitApiSecret || !supabaseUrl || !supabaseAnonKey) {
    return json({ error: "Server is missing required environment variables" }, 500);
  }

  const authHeader = req.headers.get("Authorization");
  if (!authHeader) {
    return json({ error: "Authentication required" }, 401);
  }

  const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    global: {
      headers: { Authorization: authHeader },
    },
  });

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return json({ error: "Invalid session" }, 401);
  }

  const payload = (await req.json().catch(() => ({}))) as TokenRequest;
  const roomName = payload.roomName?.trim();
  const mode = payload.mode ?? "call";

  if (!roomName) {
    return json({ error: "roomName is required" }, 400);
  }

  if (!["call", "live-host", "viewer"].includes(mode)) {
    return json({ error: "Invalid token mode" }, 400);
  }

  if (mode === "live-host") {
    const { data: isAdmin, error: roleError } = await supabase.rpc("has_role", {
      _user_id: user.id,
      _role: "admin",
    });

    if (roleError || !isAdmin) {
      return json({ error: "Only admins can host lives" }, 403);
    }
  }

  const displayName =
    user.user_metadata?.full_name ||
    user.user_metadata?.name ||
    user.email ||
    "Membre";

  const token = new AccessToken(livekitApiKey, livekitApiSecret, {
    identity: user.id,
    name: displayName,
    ttl: "2h",
  });

  token.addGrant({
    room: roomName,
    roomJoin: true,
    canSubscribe: true,
    canPublish: mode !== "viewer",
    canPublishData: true,
  });

  const jwt = await token.toJwt();

  return json({
    token: jwt,
    url: livekitUrl,
    roomName,
    mode,
  });
});
