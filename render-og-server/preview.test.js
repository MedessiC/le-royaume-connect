import { describe, it, expect } from "vitest";
import { buildSocialPreviewHtml, getVideoEmbedUrl } from "./preview.js";

describe("social preview builder", () => {
  it("builds a video preview for Bunny play URLs", () => {
    const html = buildSocialPreviewHtml({
      title: "Enseignement vidéo",
      description: "Un enseignement avec vidéo",
      targetUrl: "https://example.com/teachings/demo",
      imageUrl: "https://example.com/cover.jpg",
      videoUrl: "https://player.mediadelivery.net/play/721386/21a711c1-93cc-4cba-9b22-c8ff435698bb",
    });

    expect(html).toContain('property="og:type" content="video.other"');
    expect(html).toContain('name="twitter:card" content="player"');
    expect(html).toContain("iframe");
    expect(getVideoEmbedUrl("https://player.mediadelivery.net/play/721386/21a711c1-93cc-4cba-9b22-c8ff435698bb")).toBe(
      "https://iframe.mediadelivery.net/embed/721386/21a711c1-93cc-4cba-9b22-c8ff435698bb"
    );
  });

  it("builds an image preview for image-only teachings", () => {
    const html = buildSocialPreviewHtml({
      title: "Enseignement image",
      description: "Un enseignement avec image",
      targetUrl: "https://example.com/teachings/demo",
      imageUrl: "https://example.com/cover.jpg",
      videoUrl: null,
    });

    expect(html).toContain('property="og:type" content="article"');
    expect(html).toContain('name="twitter:card" content="summary_large_image"');
    expect(html).toContain("<img");
  });
});
