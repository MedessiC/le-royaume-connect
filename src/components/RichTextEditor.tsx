import { useEffect, useLayoutEffect, useRef } from "react";
import { Bold, Italic, Underline, Link, List, ListOrdered, Type, Quote } from "lucide-react";
import { Button } from "@/components/ui/button";

interface RichTextEditorProps {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
}

const normalizeEditValue = (value: string) => {
  if (!value) return "";
  if (/<[a-z][\s\S]*>/i.test(value)) {
    return value;
  }
  return value.replace(/\r\n|\r|\n/g, "<br />");
};

const RichTextEditor = ({ value, onChange, placeholder }: RichTextEditorProps) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const valueRef = useRef(normalizeEditValue(value));

  useLayoutEffect(() => {
    const editor = editorRef.current;
    const normalized = normalizeEditValue(value);
    valueRef.current = normalized;

    if (!editor) return;
    if (document.activeElement === editor) return;
    if (editor.innerHTML !== normalized) {
      editor.innerHTML = normalized || "<p><br></p>";
    }
  }, [value]);

  const getEditorHtml = () => editorRef.current?.innerHTML ?? "";

  const formatText = (command: string, arg?: string) => {
    const editor = editorRef.current;
    if (!editor) return;
    editor.focus();
    document.execCommand(command, false, arg || "");
    const html = getEditorHtml();
    valueRef.current = html;
    onChange(html);
  };

  const handleLink = () => {
    const url = window.prompt("Entrez l'adresse du lien (https://...) :", "https://");
    if (url) formatText("createLink", url);
  };

  const handleInput = () => {
    const html = getEditorHtml();
    valueRef.current = html;
    onChange(html);
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (!event.ctrlKey && !event.metaKey) return;
    const key = event.key.toLowerCase();
    const shortcuts: Record<string, () => void> = {
      g: () => formatText("bold"),
      i: () => formatText("italic"),
      u: () => formatText("underline"),
      l: handleLink,
      o: () => formatText("insertOrderedList"),
      p: () => formatText("insertUnorderedList"),
      q: () => formatText("formatBlock", "BLOCKQUOTE"),
      h: () => formatText("formatBlock", "H2"),
    };

    const action = shortcuts[key];
    if (action) {
      event.preventDefault();
      action();
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2 rounded-3xl border border-border bg-secondary p-3 shadow-sm">
        <Button type="button" variant="outline" size="sm" onClick={() => formatText("bold")} aria-label="Gras">
          <Bold className="w-4 h-4" /> <span className="hidden sm:inline">Gras</span>
        </Button>
        <Button type="button" variant="outline" size="sm" onClick={() => formatText("italic")} aria-label="Italique">
          <Italic className="w-4 h-4" /> <span className="hidden sm:inline">Italique</span>
        </Button>
        <Button type="button" variant="outline" size="sm" onClick={() => formatText("underline")} aria-label="Souligné">
          <Underline className="w-4 h-4" /> <span className="hidden sm:inline">Souligné</span>
        </Button>
        <Button type="button" variant="outline" size="sm" onClick={() => formatText("formatBlock", "H2")} aria-label="Titre H2">
          <Type className="w-4 h-4" /> <span className="hidden sm:inline">Titre</span>
        </Button>
        <Button type="button" variant="outline" size="sm" onClick={() => formatText("insertUnorderedList")} aria-label="Liste à puces">
          <List className="w-4 h-4" /> <span className="hidden sm:inline">Liste</span>
        </Button>
        <Button type="button" variant="outline" size="sm" onClick={() => formatText("insertOrderedList")} aria-label="Liste numérotée">
          <ListOrdered className="w-4 h-4" /> <span className="hidden sm:inline">Numérotée</span>
        </Button>
        <Button type="button" variant="outline" size="sm" onClick={() => formatText("formatBlock", "BLOCKQUOTE")} aria-label="Citation">
          <Quote className="w-4 h-4" /> <span className="hidden sm:inline">Citation</span>
        </Button>
        <Button type="button" variant="outline" size="sm" onClick={handleLink} aria-label="Ajouter un lien">
          <Link className="w-4 h-4" /> <span className="hidden sm:inline">Lien</span>
        </Button>
      </div>

      <div className="rounded-3xl border border-border bg-background px-4 py-3 shadow-sm min-h-[220px] focus-within:border-gold focus-within:ring-2 focus-within:ring-gold/20">
        <div
          ref={editorRef}
          contentEditable
          suppressContentEditableWarning
          className="min-h-[160px] outline-none text-sm leading-7 text-foreground prose prose-slate max-w-none"
          onInput={handleInput}
          onKeyDown={handleKeyDown}
        />
      </div>
      <p className="text-xs text-muted-foreground">
        Utilisez les boutons ou les raccourcis clavier : Ctrl/Cmd+G (gras), Ctrl/Cmd+I (italique), Ctrl/Cmd+U (souligné), Ctrl/Cmd+L (lien), Ctrl/Cmd+O (liste numérotée), Ctrl/Cmd+P (liste à puces), Ctrl/Cmd+Q (citation), Ctrl/Cmd+H (titre).
      </p>
    </div>
  );
};

export default RichTextEditor;
