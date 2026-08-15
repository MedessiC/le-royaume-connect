import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { createClient } from "@supabase/supabase-js";
import { buildSocialPreviewHtml } from "./preview.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 10000;

// Supabase credentials
const SUPABASE_URL = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || "https://eqichukewcuqrzqmjkpj.supabase.co";
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVxaWNodWtld2N1cXJ6cW1qa3BqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODU4NzU4OTMsImV4cCI6MjEwMTQ1MTg5M30.iIHWMhHxP-f3lW3cbJGKBQN8BOQ_ME-1Kdd9_qD71hk";

// Target frontend URL where human visitors should be redirected
const FRONTEND_URL = (process.env.FRONTEND_URL || "http://localhost:8080").replace(/\/$/, "");

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

app.use(cors());
app.use(express.json());

// List of social media bot user agents
const BOT_USER_AGENTS = [
  "facebookexternalhit",
  "facebot",
  "twitterbot",
  "whatsapp",
  "linkedinbot",
  "telegrambot",
  "discordbot",
  "slackbot",
  "skypeuripreview",
  "applebot",
  "googlebot",
  "bingbot",
  "duckduckbot",
  "baiduspider",
  "yandexbot"
];

function isSocialBot(userAgent = "") {
  const ua = userAgent.toLowerCase();
  return BOT_USER_AGENTS.some((bot) => ua.includes(bot));
}

function escapeHtml(str = "") {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

// Health check endpoint for Render
app.get("/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Main Route for Teachings OpenGraph Preview
app.get(["/teachings/:slugOrId", "/t/:slugOrId", "/share/teaching/:slugOrId"], async (req, res) => {
  const { slugOrId } = req.params;
  const userAgent = req.headers["user-agent"] || "";
  const isBot = isSocialBot(userAgent);

  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(slugOrId);

  try {
    let query = supabase
      .from("teachings")
      .select("id, slug, title, excerpt, content, cover_image_url, video_url, author_id, created_at");

    if (isUuid) {
      query = query.or(`id.eq.${slugOrId},slug.eq.${slugOrId}`);
    } else {
      query = query.eq("slug", slugOrId);
    }

    const { data: teaching, error } = await query.eq("published", true).maybeSingle();

    if (error || !teaching) {
      if (!isBot) {
        return res.redirect(302, `${FRONTEND_URL}/teachings/${slugOrId}`);
      }
      return res.status(404).send("Teaching not found");
    }

    // Determine target URL for human redirect
    const canonicalSlug = teaching.slug || teaching.id;
    const targetUrl = `${FRONTEND_URL}/teachings/${canonicalSlug}`;

    // If human visitor, redirect immediately to frontend
    if (!isBot) {
      return res.redirect(302, targetUrl);
    }

    const title = teaching.title || "Enseignement – MILLENIUM";
    const description = teaching.excerpt || teaching.content?.replace(/<[^>]*>?/gm, "").substring(0, 160) || "Découvrez cet enseignement sur la plateforme MILLENIUM.";
    const imageUrl = teaching.cover_image_url || `${FRONTEND_URL}/og-default-cover.jpg`;
    const videoUrl = teaching.video_url || null;

    const html = buildSocialPreviewHtml({
      title,
      description,
      targetUrl,
      imageUrl,
      videoUrl,
    });

    res.setHeader("Content-Type", "text/html; charset=utf-8");
    res.setHeader("Cache-Control", "public, max-age=3600, s-maxage=86400");
    return res.status(200).send(html);

  } catch (err) {
    console.error("OG Proxy error:", err);
    if (!isBot) {
      return res.redirect(302, `${FRONTEND_URL}/teachings/${slugOrId}`);
    }
    return res.status(500).send("Internal Server Error");
  }
});

// Fallback for root or unknown paths
app.get("*", (req, res) => {
  res.redirect(302, FRONTEND_URL);
});

// Simple image proxy to avoid CORS / redirect issues when loading external
// thumbnails (YouTube, CDNs, etc). Usage: /proxy?url=<encodeURIComponent(url)>
app.get("/proxy", async (req, res) => {
  const target = req.query.url;
  if (!target) return res.status(400).send("Missing url query parameter");

  const raw = Array.isArray(target) ? target[0] : String(target);
  let url;
  try {
    url = decodeURIComponent(raw);
  } catch (e) {
    url = raw;
  }

  try {
    const upstream = await fetch(url, { redirect: "follow" });
    if (!upstream.ok) {
      return res.status(502).send(`Upstream returned ${upstream.status}`);
    }

    const contentType = upstream.headers.get("content-type") || "application/octet-stream";
    const buffer = Buffer.from(await upstream.arrayBuffer());

    res.setHeader("Content-Type", contentType);
    res.setHeader("Content-Length", String(buffer.length));
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Cache-Control", "public, max-age=3600, s-maxage=86400");
    return res.status(200).send(buffer);
  } catch (err) {
    console.error("OG Proxy /proxy error:", err);
    return res.status(500).send("Proxy fetch failed");
  }
});

app.listen(PORT, () => {
  console.log(`✨ Render OG Proxy Server listening on port ${PORT}`);
  console.log(`📡 Target Frontend URL: ${FRONTEND_URL}`);
  console.log(`🗄️ Supabase URL: ${SUPABASE_URL}`);
});
