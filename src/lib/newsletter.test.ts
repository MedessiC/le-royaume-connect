import { describe, expect, it } from "vitest";
import { buildNewsletterEmailContent } from "./newsletter";

describe("buildNewsletterEmailContent", () => {
  it("builds HTML content with a text fallback for HTML payloads", () => {
    const result = buildNewsletterEmailContent({
      subject: "Nouvel enseignement",
      content: "<strong>Bonjour</strong> et bienvenue",
      format: "html",
    });

    expect(result.subject).toBe("Nouvel enseignement");
    expect(result.html).toContain("<strong>Bonjour</strong>");
    expect(result.text).toContain("Bonjour et bienvenue");
  });

  it("keeps plain text content as-is for text emails", () => {
    const result = buildNewsletterEmailContent({
      subject: "Rappel",
      content: "Bonjour à tous",
      format: "text",
    });

    expect(result.html).toContain("Bonjour à tous");
    expect(result.text).toBe("Bonjour à tous");
  });
});
