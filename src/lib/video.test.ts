import { describe, expect, it } from "vitest";
import { getVideoPosterCandidates } from "./video";

describe("getVideoPosterCandidates", () => {
  it("returns the explicit poster first", () => {
    expect(getVideoPosterCandidates("https://example.com/video.mp4", "https://cdn.example.com/poster.jpg")).toEqual([
      "https://cdn.example.com/poster.jpg",
    ]);
  });

  it("builds bunny poster candidates from the video URL", () => {
    expect(
      getVideoPosterCandidates("https://iframe.mediadelivery.net/play/123/abcd-1234")
    ).toEqual([
      "https://video.bunnycdn.com/library/123/videos/abcd-1234/thumbnail.jpg",
      "https://video.bunnycdn.com/library/123/videos/abcd-1234/cover.jpg",
      "https://video.bunnycdn.com/library/123/videos/abcd-1234/poster.jpg",
      "https://video.bunnycdn.com/library/123/videos/abcd-1234/snapshot.jpg",
      "https://video.bunnycdn.com/library/123/videos/abcd-1234/image.jpg",
    ]);
  });
});
