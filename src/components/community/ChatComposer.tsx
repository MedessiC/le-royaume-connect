import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { Send, Smile, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import type { ReplyTo } from "./types";

const COMMON_EMOJIS = [
  "😀", "😂", "😍", "🙏", "❤️", "👍", "🔥", "✨",
  "🎉", "💪", "😊", "🤗", "😢", "🙌", "⭐", "💯",
  "👋", "🕊️", "📖", "🌍", "🇧🇯", "⛪", "🙇", "💬",
];

type ChatComposerProps = {
  content: string;
  posting: boolean;
  replyTo: ReplyTo;
  onContentChange: (value: string) => void;
  onSubmit: () => void;
  onCancelReply: () => void;
  onInsertEmoji: (emoji: string) => void;
  isLoggedIn: boolean;
};

const ChatComposer = ({
  content,
  posting,
  replyTo,
  onContentChange,
  onSubmit,
  onCancelReply,
  onInsertEmoji,
  isLoggedIn,
}: ChatComposerProps) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 128)}px`;
  }, [content]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (content.trim() && !posting) onSubmit();
    }
  };

  if (!isLoggedIn) {
    return (
      <div className="border-t border-[#d1d7db] bg-[#f0f2f5] px-4 py-4 text-center dark:border-[#222d34] dark:bg-[#202c33]">
        <p className="mb-3 text-sm font-medium text-[#111b21] dark:text-[#e9edef]">
          Connectez-vous pour discuter
        </p>
        <Link to="/auth">
          <Button variant="hero" size="sm">
            Se connecter
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <footer className="shrink-0 border-t border-[#d1d7db] bg-[#f0f2f5] px-2 py-2 dark:border-[#222d34] dark:bg-[#202c33]">
      {replyTo && (
        <div className="mx-1 mb-2 flex items-start gap-2 rounded-lg border-l-4 border-gold bg-white px-3 py-2 dark:bg-[#2a3942]">
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold text-gold">{replyTo.name}</p>
            <p className="line-clamp-1 text-xs text-[#667781] dark:text-[#8696a0]">
              {replyTo.preview}
            </p>
          </div>
          <button
            type="button"
            onClick={onCancelReply}
            className="rounded-full p-1 text-[#667781] hover:bg-[#f0f2f5] dark:hover:bg-[#202c33]"
            aria-label="Annuler la réponse"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      <div className="flex items-end gap-2">
        <Popover>
          <PopoverTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-10 w-10 shrink-0 rounded-full text-[#54656f] hover:bg-[#e9edef] dark:hover:bg-[#2a3942]"
              aria-label="Emojis"
            >
              <Smile className="h-5 w-5" />
            </Button>
          </PopoverTrigger>
          <PopoverContent side="top" align="start" className="w-auto p-2">
            <div className="grid grid-cols-8 gap-1">
              {COMMON_EMOJIS.map((emoji) => (
                <button
                  key={emoji}
                  type="button"
                  className="rounded p-1.5 text-xl hover:bg-muted"
                  onClick={() => onInsertEmoji(emoji)}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </PopoverContent>
        </Popover>

        <div className="flex min-h-[42px] flex-1 items-end rounded-3xl bg-white px-4 py-2 dark:bg-[#2a3942]">
          <textarea
            ref={textareaRef}
            rows={1}
            maxLength={2000}
            placeholder={replyTo ? `Répondre à ${replyTo.name}…` : "Message"}
            value={content}
            onChange={(e) => onContentChange(e.target.value)}
            onKeyDown={handleKeyDown}
            className="max-h-32 w-full resize-none bg-transparent text-[15px] text-[#111b21] placeholder:text-[#667781] focus:outline-none dark:text-[#e9edef] dark:placeholder:text-[#8696a0]"
          />
        </div>

        <Button
          type="button"
          size="icon"
          disabled={posting || !content.trim()}
          onClick={onSubmit}
          className="h-11 w-11 shrink-0 rounded-full bg-gold text-slate-950 hover:bg-gold/90 disabled:opacity-50"
          aria-label="Envoyer"
        >
          <Send className="h-5 w-5" />
        </Button>
      </div>
    </footer>
  );
};

export default ChatComposer;
