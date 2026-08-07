#!/usr/bin/env node
// Backfill script to populate video_thumbnail_url for teachings
// Usage: SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... node scripts/backfill-video-thumbnails.js

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY environment variables');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, { auth: { persistSession: false } });

const YOUTUBE_PATTERNS = [
  /(?:https?:\/\/)?(?:www\.)?(?:youtu\.be\/|youtube\.com\/shorts\/|youtube\.com\/live\/|youtube\.com\/embed\/|youtube\.com\/watch\?v=)([A-Za-z0-9_-]{11})/i,
  /(?:https?:\/\/)?(?:www\.)?youtube\.com\/watch\?[^#\s]*v=([A-Za-z0-9_-]{11})/i,
];

const getYouTubeId = (url) => {
  if (!url) return null;
  for (const p of YOUTUBE_PATTERNS) {
    const m = url.match(p);
    if (m?.[1]) return m[1];
  }
  return null;
};

const getBunnyIds = (url) => {
  if (!url) return null;
  const m = url.match(/(?:iframe\.mediadelivery\.net|player\.mediadelivery\.net)\/(?:embed|play)\/(\d+)\/([a-f0-9-]+)/i);
  if (!m) return null;
  return { libraryId: m[1], videoId: m[2] };
};

const getBunnyCandidates = (libraryId, videoId) => [
  `https://video.bunnycdn.com/library/${libraryId}/videos/${videoId}/thumbnail.jpg`,
  `https://video.bunnycdn.com/library/${libraryId}/videos/${videoId}/cover.jpg`,
  `https://video.bunnycdn.com/library/${libraryId}/videos/${videoId}/poster.jpg`,
  `https://video.bunnycdn.com/library/${libraryId}/videos/${videoId}/snapshot.jpg`,
  `https://video.bunnycdn.com/library/${libraryId}/videos/${videoId}/image.jpg`,
];

const checkUrlExists = async (url) => {
  try {
    const res = await fetch(url, { method: 'HEAD' });
    return res.ok;
  } catch (err) {
    return false;
  }
};

(async () => {
  console.log('Starting backfill: find teachings with video_url and null video_thumbnail_url');
  let page = 0;
  const pageSize = 100;
  let updated = 0;

  while (true) {
    const { data, error } = await supabase
      .from('teachings')
      .select('id, video_url')
      .is('video_url', null, { foreignTable: undefined })
      .is('video_thumbnail_url', null)
      .limit(pageSize)
      .offset(page * pageSize);

    if (error) {
      console.error('Supabase query error', error);
      break;
    }

    if (!data || data.length === 0) break;

    for (const row of data) {
      const { id, video_url } = row;
      if (!video_url) continue;

      // YouTube
      const youtubeId = getYouTubeId(video_url);
      if (youtubeId) {
        const ytUrl = `https://img.youtube.com/vi/${youtubeId}/hqdefault.jpg`;
        const ok = await checkUrlExists(ytUrl);
        if (ok) {
          const { error: upErr } = await supabase.from('teachings').update({ video_thumbnail_url: ytUrl }).eq('id', id);
          if (upErr) console.error('Update error', id, upErr);
          else { updated++; console.log('Updated', id, ytUrl); }
          continue;
        }
      }

      // Bunny
      const bunny = getBunnyIds(video_url);
      if (bunny) {
        const candidates = getBunnyCandidates(bunny.libraryId, bunny.videoId);
        let found = null;
        for (const c of candidates) {
          if (await checkUrlExists(c)) { found = c; break; }
        }
        if (found) {
          const { error: upErr } = await supabase.from('teachings').update({ video_thumbnail_url: found }).eq('id', id);
          if (upErr) console.error('Update error', id, upErr);
          else { updated++; console.log('Updated', id, found); }
        } else {
          console.log('No poster found for', id);
        }
        continue;
      }

      console.log('No candidate for', id);
    }

    page++;
  }

  console.log('Done. updated:', updated);
  process.exit(0);
})();
