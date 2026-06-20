import { CheckCheck, Clock, MessageSquare, Trash2 } from "lucide-react";
import UserAvatar from "@/components/UserAvatar";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { formatMessageTime } from "./groupMessages";
import type { ChatMessage, Profile } from "./types";

type ChatBubbleProps = {
  message: ChatMessage;
  isMine: boolean;
  showAvatar: boolean;
  showName: boolean;
  isGrouped: boolean;
  canDelete: boolean;
  onReply: () => void;
  onDelete: () => void;
  onProfileClick: (profile: Profile) => void;
};

const ChatBubble = ({
  message,
  isMine,
  showAvatar,
  showName,
  isGrouped,
  canDelete,
  onReply,
  onDelete,
  onProfileClick,
}: ChatBubbleProps) => {
  const isPending = message.status === "pending";
  const isFailed = message.status === "failed";

  return (
    <div
      className={cn(
        "group flex w-full",
        isGrouped ? "mt-0.5" : "mt-2",
        isMine ? "justify-end" : "justify-start",
      )}
    >
      {!isMine && (
        <div className="mr-2 w-8 shrink-0 self-end">
          {showAvatar && message.profile ? (
            <button type="button" onClick={() => onProfileClick(message.profile!)}>
              <UserAvatar
                src={message.profile.avatar_url}
                name={message.profile.full_name || "Membre"}
                className="h-8 w-8"
              />
            </button>
          ) : null}
        </div>
      )}

      <div className={cn("relative max-w-[78%] min-w-[4rem]", isMine ? "items-end" : "items-start")}>
        <div
          className={cn(
            "relative rounded-lg px-2.5 py-1.5 shadow-sm",
            isMine
              ? "rounded-tr-none bg-[#d9fdd3] dark:bg-[#005c4b]"
              : "rounded-tl-none bg-white dark:bg-[#202c33]",
            isPending && "opacity-70",
            isFailed && "ring-1 ring-destructive/50",
          )}
        >
          {!isMine && showName && (
            <p className="mb-0.5 text-xs font-semibold text-gold">
              {message.profile?.full_name || "Membre"}
            </p>
          )}

          {message.parent && (
            <div
              className={cn(
                "mb-1 rounded border-l-4 border-gold px-2 py-1 text-xs",
                isMine
                  ? "bg-black/5 dark:bg-black/20"
                  : "bg-[#f0f2f5] dark:bg-[#2a3942]",
              )}
            >
              <p className="truncate font-medium text-gold">
                {message.parent.profile?.full_name || "Membre"}
              </p>
              <p className="line-clamp-2 text-[#667781] dark:text-[#8696a0]">
                {message.parent.content}
              </p>
            </div>
          )}

          <p className="whitespace-pre-wrap pr-14 text-[15px] leading-snug text-[#111b21] dark:text-[#e9edef]">
            {message.content}
          </p>

          <div className="absolute bottom-1 right-2 flex items-center gap-0.5">
            <span className="text-[10px] text-[#667781] dark:text-[#8696a0]">
              {formatMessageTime(message.created_at)}
            </span>
            {isMine && (
              <span className="ml-0.5 text-[#667781] dark:text-[#8696a0]">
                {isPending ? (
                  <Clock className="h-3 w-3" />
                ) : isFailed ? (
                  <span className="text-[10px] text-destructive">!</span>
                ) : (
                  <CheckCheck className="h-3.5 w-3.5 text-[#53bdeb]" />
                )}
              </span>
            )}
          </div>
        </div>

        <div
          className={cn(
            "absolute top-1/2 flex -translate-y-1/2 gap-0.5 opacity-0 transition-opacity group-hover:opacity-100",
            isMine ? "-left-16" : "-right-16",
          )}
        >
          <Button
            size="icon"
            variant="ghost"
            className="h-7 w-7 rounded-full bg-white shadow dark:bg-[#2a3942]"
            onClick={onReply}
            aria-label="Répondre"
          >
            <MessageSquare className="h-3.5 w-3.5" />
          </Button>
          {canDelete && (
            <Button
              size="icon"
              variant="ghost"
              className="h-7 w-7 rounded-full bg-white shadow dark:bg-[#2a3942]"
              onClick={onDelete}
              aria-label="Supprimer"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatBubble;
