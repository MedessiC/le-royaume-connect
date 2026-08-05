import { render, screen, waitFor } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import RichTextEditor from "./RichTextEditor";

describe("RichTextEditor", () => {
  it("updates the editor content when the value prop changes", async () => {
    const onChange = vi.fn();

    const { rerender } = render(<RichTextEditor value="<p>Ancien contenu</p>" onChange={onChange} />);
    expect(screen.getByText("Ancien contenu")).toBeInTheDocument();

    rerender(<RichTextEditor value="<p>Nouveau contenu</p>" onChange={onChange} />);

    await waitFor(() => {
      expect(screen.getByText("Nouveau contenu")).toBeInTheDocument();
    });
  });
});
