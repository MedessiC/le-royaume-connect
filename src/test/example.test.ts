import { describe, it, expect } from "vitest";
import { getVideoEmbedUrl, getBunnyVideoIds } from "../lib/video";

describe("video Bunny parsing", () => {
  it("converts player.mediadelivery.net play URLs to an embeddable Bunny URL", () => {
    const url = "https://player.mediadelivery.net/play/721386/21a711c1-93cc-4cba-9b22-c8ff435698bb";

    expect(getVideoEmbedUrl(url)).toBe("https://iframe.mediadelivery.net/embed/721386/21a711c1-93cc-4cba-9b22-c8ff435698bb");
    expect(getBunnyVideoIds(url)).toEqual({
      libraryId: "721386",
      videoId: "21a711c1-93cc-4cba-9b22-c8ff435698bb",
    });
  });
});
