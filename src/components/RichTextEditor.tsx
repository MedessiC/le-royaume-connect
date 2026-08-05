import { useCallback, useEffect, useState } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { Link } from "@tiptap/extension-link";
import { Image } from "@tiptap/extension-image";
import { Placeholder } from "@tiptap/extension-placeholder";
import { CharacterCount } from "@tiptap/extension-character-count";
import { TextAlign } from "@tiptap/extension-text-align";
import { Highlight } from "@tiptap/extension-highlight";
import { Color } from "@tiptap/extension-color";
import { TextStyle } from "@tiptap/extension-text-style";
import { Underline } from "@tiptap/extension-underline";
import { Youtube } from "@tiptap/extension-youtube";
import { Table } from "@tiptap/extension-table";
import { TableRow } from "@tiptap/extension-table-row";
import { TableHeader } from "@tiptap/extension-table-header";
import { TableCell } from "@tiptap/extension-table-cell";
import { TaskList } from "@tiptap/extension-task-list";
import { TaskItem } from "@tiptap/extension-task-item";
import {
  Bold, Italic, Underline as UnderlineIcon, Strikethrough, Code, Heading1, Heading2, Heading3,
  List, ListOrdered, CheckSquare, Quote, Minus, Undo2, Redo2, Link2, Image as ImageIcon,
  Youtube as YoutubeIcon, AlignLeft, AlignCenter, AlignRight, AlignJustify,
  Highlighter, Type, Table as TableIcon, Maximize2, Minimize2, Eye, EyeOff,
  Trash2, Plus, ChevronDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

interface RichTextEditorProps {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
}

/* ── Toolbar button helper ──────────────────────────────────────── */
function ToolBtn({
  onClick, active, disabled, title, children, className,
}: {
  onClick: () => void;
  active?: boolean;
  disabled?: boolean;
  title: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <button
      type="button"
      title={title}
      disabled={disabled}
      onClick={onClick}
      className={cn(
        "inline-flex items-center justify-center rounded-lg p-1.5 transition-all duration-150",
        "hover:bg-gold/15 hover:text-gold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/50",
        "disabled:opacity-40 disabled:cursor-not-allowed",
        active && "bg-gold/20 text-gold",
        !active && "text-muted-foreground",
        className,
      )}
    >
      {children}
    </button>
  );
}

function ToolSep() {
  return <div className="w-px h-5 bg-border/60 mx-0.5" />;
}

/* ── Link dialog ─────────────────────────────────────────────────── */
function LinkDialog({
  open, onClose, onInsert, initialUrl = "", initialText = "",
}: {
  open: boolean;
  onClose: () => void;
  onInsert: (url: string, newTab: boolean, linkText: string) => void;
  initialUrl?: string;
  initialText?: string;
}) {
  const [url, setUrl] = useState(initialUrl);
  const [linkText, setLinkText] = useState(initialText);
  const [newTab, setNewTab] = useState(true);

  // Reset when dialog opens
  const handleOpenChange = (v: boolean) => {
    if (!v) { onClose(); }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader><DialogTitle>Insérer un lien</DialogTitle></DialogHeader>
        <div className="space-y-3 py-2">
          <div>
            <Label className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1 block">
              Texte affiché
            </Label>
            <Input
              autoFocus
              value={linkText}
              onChange={(e) => setLinkText(e.target.value)}
              placeholder="Ex: Cliquez ici, En savoir plus…"
            />
            <p className="text-[11px] text-muted-foreground mt-1">Laissez vide pour afficher l'URL directement</p>
          </div>
          <div>
            <Label className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1 block">
              URL du lien
            </Label>
            <Input
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://..."
              onKeyDown={(e) => e.key === "Enter" && url && onInsert(url, newTab, linkText)}
            />
          </div>
          <label className="flex items-center gap-2 text-sm cursor-pointer select-none">
            <input type="checkbox" checked={newTab} onChange={(e) => setNewTab(e.target.checked)} className="accent-gold" />
            Ouvrir dans un nouvel onglet
          </label>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={onClose}>Annuler</Button>
          <Button variant="hero" disabled={!url} onClick={() => onInsert(url, newTab, linkText)}>Insérer</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* ── Image dialog ────────────────────────────────────────────────── */
function ImageDialog({
  open, onClose, onInsert,
}: {
  open: boolean;
  onClose: () => void;
  onInsert: (url: string, alt: string) => void;
}) {
  const [url, setUrl] = useState("");
  const [alt, setAlt] = useState("");
  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-sm">
        <DialogHeader><DialogTitle>Insérer une image</DialogTitle></DialogHeader>
        <div className="space-y-3 py-2">
          <div>
            <Label>URL de l'image</Label>
            <Input autoFocus value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://..." />
          </div>
          <div>
            <Label>Texte alternatif (optionnel)</Label>
            <Input value={alt} onChange={(e) => setAlt(e.target.value)} placeholder="Description de l'image" />
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={onClose}>Annuler</Button>
          <Button variant="hero" disabled={!url} onClick={() => onInsert(url, alt)}>Insérer</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* ── YouTube dialog ──────────────────────────────────────────────── */
function YoutubeDialog({
  open, onClose, onInsert,
}: {
  open: boolean;
  onClose: () => void;
  onInsert: (url: string) => void;
}) {
  const [url, setUrl] = useState("");
  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-sm">
        <DialogHeader><DialogTitle>Intégrer une vidéo YouTube</DialogTitle></DialogHeader>
        <div className="space-y-3 py-2">
          <div>
            <Label>URL YouTube</Label>
            <Input autoFocus value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://youtube.com/watch?v=..." />
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={onClose}>Annuler</Button>
          <Button variant="hero" disabled={!url} onClick={() => onInsert(url)}>Intégrer</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* ── Main Component ──────────────────────────────────────────────── */
const RichTextEditor = ({ value, onChange, placeholder }: RichTextEditorProps) => {
  const [linkOpen, setLinkOpen] = useState(false);
  const [imageOpen, setImageOpen] = useState(false);
  const [youtubeOpen, setYoutubeOpen] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  const [preview, setPreview] = useState(false);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({ codeBlock: { HTMLAttributes: { class: "not-prose" } } }),
      Underline,
      TextStyle,
      Color,
      Highlight.configure({ multicolor: true }),
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      Link.configure({ openOnClick: false, HTMLAttributes: { class: "text-gold underline underline-offset-2 hover:text-gold/80 cursor-pointer" } }),
      Image.configure({ HTMLAttributes: { class: "rounded-xl max-w-full my-4 mx-auto block shadow" } }),
      Youtube.configure({ width: 640, height: 360, HTMLAttributes: { class: "rounded-xl overflow-hidden my-4 mx-auto block max-w-full" } }),
      Table.configure({ resizable: false }),
      TableRow,
      TableHeader,
      TableCell,
      TaskList,
      TaskItem.configure({ nested: true }),
      Placeholder.configure({ placeholder: placeholder ?? "Commencez à rédiger votre enseignement…" }),
      CharacterCount,
    ],
    content: value || "",
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
    editorProps: {
      attributes: {
        class: "prose prose-slate dark:prose-invert max-w-none focus:outline-none min-h-[320px] px-6 py-5 text-sm leading-7",
      },
    },
  });

  useEffect(() => {
    if (!editor) return;

    const nextContent = value || "";
    const currentContent = editor.getHTML();

    if (currentContent !== nextContent) {
      editor.commands.setContent(nextContent, { emitUpdate: false });
    }
  }, [editor, value]);

  /* Link handlers */
  const openLinkDialog = useCallback(() => setLinkOpen(true), []);
  const insertLink = useCallback((url: string, newTab: boolean, linkText: string) => {
    if (!editor) return;
    const { from, to, empty } = editor.state.selection;
    if (!empty) {
      // Text is selected → apply link on the selected text
      editor.chain().focus().setLink({ href: url, target: newTab ? "_blank" : "_self" }).run();
    } else if (linkText.trim()) {
      // No selection, but a display text was provided → insert it as a link
      editor
        .chain()
        .focus()
        .insertContent(`<a href="${url}" target="${newTab ? "_blank" : "_self"}" rel="noopener noreferrer">${linkText.trim()}</a>&nbsp;`)
        .run();
    } else {
      // No selection, no display text → insert the URL as a link
      editor
        .chain()
        .focus()
        .insertContent(`<a href="${url}" target="${newTab ? "_blank" : "_self"}" rel="noopener noreferrer">${url}</a>&nbsp;`)
        .run();
    }
    setLinkOpen(false);
  }, [editor]);
  const removeLink = useCallback(() => editor?.chain().focus().unsetLink().run(), [editor]);

  const insertImage = useCallback((url: string, alt: string) => {
    editor?.chain().focus().setImage({ src: url, alt }).run();
    setImageOpen(false);
  }, [editor]);

  const insertYoutube = useCallback((url: string) => {
    editor?.commands.setYoutubeVideo({ src: url });
    setYoutubeOpen(false);
  }, [editor]);

  const insertTable = useCallback(() => {
    editor?.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run();
  }, [editor]);

  if (!editor) return null;

  const words = editor.storage.characterCount.words?.() ?? 0;
  const chars = editor.storage.characterCount.characters?.() ?? 0;
  const readingMin = Math.max(1, Math.round(words / 200));

  const currentLinkUrl = editor.getAttributes("link").href ?? "";

  return (
    <>
      <LinkDialog
        open={linkOpen}
        onClose={() => setLinkOpen(false)}
        onInsert={insertLink}
        initialUrl={currentLinkUrl}
        initialText={editor.state.selection.empty ? "" : editor.state.doc.textBetween(editor.state.selection.from, editor.state.selection.to)}
      />
      <ImageDialog open={imageOpen} onClose={() => setImageOpen(false)} onInsert={insertImage} />
      <YoutubeDialog open={youtubeOpen} onClose={() => setYoutubeOpen(false)} onInsert={insertYoutube} />

      <div className={cn(
        "flex flex-col rounded-2xl border border-border bg-background shadow-sm overflow-hidden transition-all duration-300",
        fullscreen && "fixed inset-0 z-50 rounded-none border-0 shadow-2xl",
      )}>
        {/* ── Toolbar ──────────────────────────────────────────────── */}
        <div className="flex flex-wrap items-center gap-0.5 border-b border-border/60 bg-muted/30 px-2 py-2">

          {/* History */}
          <ToolBtn title="Annuler (Ctrl+Z)" onClick={() => editor.chain().focus().undo().run()} disabled={!editor.can().undo()}>
            <Undo2 className="w-3.5 h-3.5" />
          </ToolBtn>
          <ToolBtn title="Refaire (Ctrl+Y)" onClick={() => editor.chain().focus().redo().run()} disabled={!editor.can().redo()}>
            <Redo2 className="w-3.5 h-3.5" />
          </ToolBtn>
          <ToolSep />

          {/* Headings dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className="inline-flex items-center gap-1 rounded-lg px-2 py-1.5 text-xs font-medium text-muted-foreground transition-all hover:bg-gold/15 hover:text-gold"
              >
                <Type className="w-3.5 h-3.5" />
                {editor.isActive("heading", { level: 1 }) ? "H1" : editor.isActive("heading", { level: 2 }) ? "H2" : editor.isActive("heading", { level: 3 }) ? "H3" : "Texte"}
                <ChevronDown className="w-3 h-3" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="min-w-[140px]">
              <DropdownMenuItem onClick={() => editor.chain().focus().setParagraph().run()} className={cn(editor.isActive("paragraph") && "text-gold font-medium")}>
                Paragraphe
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} className={cn(editor.isActive("heading", { level: 1 }) && "text-gold font-medium")}>
                <Heading1 className="w-4 h-4 mr-2" /> Titre 1
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} className={cn(editor.isActive("heading", { level: 2 }) && "text-gold font-medium")}>
                <Heading2 className="w-4 h-4 mr-2" /> Titre 2
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} className={cn(editor.isActive("heading", { level: 3 }) && "text-gold font-medium")}>
                <Heading3 className="w-4 h-4 mr-2" /> Titre 3
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <ToolSep />

          {/* Formatting */}
          <ToolBtn title="Gras (Ctrl+B)" active={editor.isActive("bold")} onClick={() => editor.chain().focus().toggleBold().run()}>
            <Bold className="w-3.5 h-3.5" />
          </ToolBtn>
          <ToolBtn title="Italique (Ctrl+I)" active={editor.isActive("italic")} onClick={() => editor.chain().focus().toggleItalic().run()}>
            <Italic className="w-3.5 h-3.5" />
          </ToolBtn>
          <ToolBtn title="Souligné (Ctrl+U)" active={editor.isActive("underline")} onClick={() => editor.chain().focus().toggleUnderline().run()}>
            <UnderlineIcon className="w-3.5 h-3.5" />
          </ToolBtn>
          <ToolBtn title="Barré" active={editor.isActive("strike")} onClick={() => editor.chain().focus().toggleStrike().run()}>
            <Strikethrough className="w-3.5 h-3.5" />
          </ToolBtn>
          <ToolBtn title="Code inline" active={editor.isActive("code")} onClick={() => editor.chain().focus().toggleCode().run()}>
            <Code className="w-3.5 h-3.5" />
          </ToolBtn>
          <ToolSep />

          {/* Alignment */}
          <ToolBtn title="Aligner à gauche" active={editor.isActive({ textAlign: "left" })} onClick={() => editor.chain().focus().setTextAlign("left").run()}>
            <AlignLeft className="w-3.5 h-3.5" />
          </ToolBtn>
          <ToolBtn title="Centrer" active={editor.isActive({ textAlign: "center" })} onClick={() => editor.chain().focus().setTextAlign("center").run()}>
            <AlignCenter className="w-3.5 h-3.5" />
          </ToolBtn>
          <ToolBtn title="Aligner à droite" active={editor.isActive({ textAlign: "right" })} onClick={() => editor.chain().focus().setTextAlign("right").run()}>
            <AlignRight className="w-3.5 h-3.5" />
          </ToolBtn>
          <ToolBtn title="Justifier" active={editor.isActive({ textAlign: "justify" })} onClick={() => editor.chain().focus().setTextAlign("justify").run()}>
            <AlignJustify className="w-3.5 h-3.5" />
          </ToolBtn>
          <ToolSep />

          {/* Color */}
          <div className="relative inline-flex items-center" title="Couleur du texte">
            <label className={cn(
              "inline-flex items-center justify-center rounded-lg p-1.5 cursor-pointer transition-all",
              "hover:bg-gold/15 hover:text-gold text-muted-foreground",
            )}>
              <Type className="w-3.5 h-3.5" />
              <input type="color" className="absolute opacity-0 w-0 h-0" onChange={(e) => editor.chain().focus().setColor(e.target.value).run()} />
            </label>
          </div>
          <ToolBtn title="Surligner" active={editor.isActive("highlight")} onClick={() => editor.chain().focus().toggleHighlight({ color: "#fde68a" }).run()}>
            <Highlighter className="w-3.5 h-3.5" />
          </ToolBtn>
          <ToolSep />

          {/* Lists */}
          <ToolBtn title="Liste à puces" active={editor.isActive("bulletList")} onClick={() => editor.chain().focus().toggleBulletList().run()}>
            <List className="w-3.5 h-3.5" />
          </ToolBtn>
          <ToolBtn title="Liste numérotée" active={editor.isActive("orderedList")} onClick={() => editor.chain().focus().toggleOrderedList().run()}>
            <ListOrdered className="w-3.5 h-3.5" />
          </ToolBtn>
          <ToolBtn title="Liste de tâches" active={editor.isActive("taskList")} onClick={() => editor.chain().focus().toggleTaskList().run()}>
            <CheckSquare className="w-3.5 h-3.5" />
          </ToolBtn>
          <ToolSep />

          {/* Block elements */}
          <ToolBtn title="Citation" active={editor.isActive("blockquote")} onClick={() => editor.chain().focus().toggleBlockquote().run()}>
            <Quote className="w-3.5 h-3.5" />
          </ToolBtn>
          <ToolBtn title="Bloc de code" active={editor.isActive("codeBlock")} onClick={() => editor.chain().focus().toggleCodeBlock().run()}>
            <Code className="w-3.5 h-3.5" />
          </ToolBtn>
          <ToolBtn title="Séparateur horizontal" onClick={() => editor.chain().focus().setHorizontalRule().run()}>
            <Minus className="w-3.5 h-3.5" />
          </ToolBtn>
          <ToolSep />

          {/* Media */}
          <ToolBtn title="Lien" active={editor.isActive("link")} onClick={openLinkDialog}>
            <Link2 className="w-3.5 h-3.5" />
          </ToolBtn>
          <ToolBtn title="Image" onClick={() => setImageOpen(true)}>
            <ImageIcon className="w-3.5 h-3.5" />
          </ToolBtn>
          <ToolBtn title="Vidéo YouTube" onClick={() => setYoutubeOpen(true)}>
            <YoutubeIcon className="w-3.5 h-3.5" />
          </ToolBtn>
          <ToolBtn title="Tableau" onClick={insertTable}>
            <TableIcon className="w-3.5 h-3.5" />
          </ToolBtn>
          <ToolSep />

          {/* View controls */}
          <div className="ml-auto flex items-center gap-0.5">
            <ToolBtn title={preview ? "Mode édition" : "Aperçu"} onClick={() => setPreview(!preview)}>
              {preview ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
            </ToolBtn>
            <ToolBtn title={fullscreen ? "Quitter le plein écran" : "Plein écran"} onClick={() => setFullscreen(!fullscreen)}>
              {fullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
            </ToolBtn>
          </div>
        </div>

        {/* ── Table toolbar (contextual) ────────────────────────────── */}
        {editor.isActive("table") && (
          <div className="flex items-center gap-1 border-b border-border/40 bg-blue-500/5 px-3 py-1.5 text-xs">
            <span className="text-muted-foreground font-medium mr-2">Tableau :</span>
            <button type="button" onClick={() => editor.chain().focus().addColumnBefore().run()} className="inline-flex items-center gap-1 rounded px-2 py-0.5 hover:bg-muted text-muted-foreground hover:text-foreground transition-colors">
              <Plus className="w-3 h-3" /> Colonne avant
            </button>
            <button type="button" onClick={() => editor.chain().focus().addColumnAfter().run()} className="inline-flex items-center gap-1 rounded px-2 py-0.5 hover:bg-muted text-muted-foreground hover:text-foreground transition-colors">
              <Plus className="w-3 h-3" /> Colonne après
            </button>
            <button type="button" onClick={() => editor.chain().focus().addRowBefore().run()} className="inline-flex items-center gap-1 rounded px-2 py-0.5 hover:bg-muted text-muted-foreground hover:text-foreground transition-colors">
              <Plus className="w-3 h-3" /> Ligne avant
            </button>
            <button type="button" onClick={() => editor.chain().focus().addRowAfter().run()} className="inline-flex items-center gap-1 rounded px-2 py-0.5 hover:bg-muted text-muted-foreground hover:text-foreground transition-colors">
              <Plus className="w-3 h-3" /> Ligne après
            </button>
            <button type="button" onClick={() => editor.chain().focus().deleteRow().run()} className="inline-flex items-center gap-1 rounded px-2 py-0.5 hover:bg-red-500/10 text-muted-foreground hover:text-red-500 transition-colors">
              <Trash2 className="w-3 h-3" /> Ligne
            </button>
            <button type="button" onClick={() => editor.chain().focus().deleteColumn().run()} className="inline-flex items-center gap-1 rounded px-2 py-0.5 hover:bg-red-500/10 text-muted-foreground hover:text-red-500 transition-colors">
              <Trash2 className="w-3 h-3" /> Colonne
            </button>
            <button type="button" onClick={() => editor.chain().focus().deleteTable().run()} className="ml-auto inline-flex items-center gap-1 rounded px-2 py-0.5 hover:bg-red-500/10 text-red-500/70 hover:text-red-500 transition-colors">
              <Trash2 className="w-3 h-3" /> Supprimer tableau
            </button>
          </div>
        )}



        {/* ── Editor / Preview area ─────────────────────────────────── */}
        <div className={cn(
          "flex-1 overflow-y-auto",
          fullscreen && "max-h-[calc(100vh-120px)]",
        )}>
          {preview ? (
            <div
              className="prose prose-slate dark:prose-invert max-w-none px-6 py-5 text-sm leading-7"
              dangerouslySetInnerHTML={{ __html: editor.getHTML() }}
            />
          ) : (
            <EditorContent editor={editor} />
          )}
        </div>

        {/* ── Status bar ───────────────────────────────────────────── */}
        <div className="flex items-center justify-between border-t border-border/50 bg-muted/20 px-4 py-1.5 text-[11px] text-muted-foreground">
          <div className="flex items-center gap-3">
            <span>{words} mot{words !== 1 ? "s" : ""}</span>
            <span>{chars} caractère{chars !== 1 ? "s" : ""}</span>
            <span>~{readingMin} min de lecture</span>
          </div>
          {preview && (
            <span className="flex items-center gap-1 text-gold font-medium">
              <Eye className="w-3 h-3" /> Aperçu
            </span>
          )}
        </div>
      </div>
    </>
  );
};

export default RichTextEditor;
