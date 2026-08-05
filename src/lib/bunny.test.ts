import { describe, expect, it } from "vitest";
import { computeFileFingerprint } from "./bunny";

describe("computeFileFingerprint", () => {
  it("returns the same fingerprint for identical file content", async () => {
    const fileA = new File(["hello world"], "video.mp4", { type: "video/mp4" });
    const fileB = new File(["hello world"], "video-2.mp4", { type: "video/mp4" });

    const [fingerprintA, fingerprintB] = await Promise.all([
      computeFileFingerprint(fileA),
      computeFileFingerprint(fileB),
    ]);

    expect(fingerprintA).toBe(fingerprintB);
  });

  it("returns a different fingerprint for different content", async () => {
    const fileA = new File(["hello world"], "video.mp4", { type: "video/mp4" });
    const fileB = new File(["bonjour monde"], "video-2.mp4", { type: "video/mp4" });

    const [fingerprintA, fingerprintB] = await Promise.all([
      computeFileFingerprint(fileA),
      computeFileFingerprint(fileB),
    ]);

    expect(fingerprintA).not.toBe(fingerprintB);
  });
});
