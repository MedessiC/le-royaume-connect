import { useEffect, useRef } from "react";
import { ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import ChatBubble from "./ChatBubble";
import ChatDateSeparator from "./ChatDateSeparator";
import { buildMessageRenderList } from "./groupMessages";
import type { ChatMessage, Profile } from "./types";

type ChatMessageListProps = {
  messages: ChatMessage[];
  loading: boolean;
  currentUserId?: string;
  isAdmin: boolean;
  stickToBottom: boolean;
  onStickToBottomChange: (value: boolean) => void;
  onReply: (message: ChatMessage) => void;
  onDelete: (id: string) => void;
  onProfileClick: (profile: Profile) => void;
};

const ChatMessageList = ({
  messages,
  loading,
  currentUserId,
  isAdmin,
  stickToBottom,
  onStickToBottomChange,
  onReply,
  onDelete,
  onProfileClick,
}: ChatMessageListProps) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  const handleScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    const distanceFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
    onStickToBottomChange(distanceFromBottom < 80);
  };

  const scrollToBottom = (behavior: ScrollBehavior = "smooth") => {
    bottomRef.current?.scrollIntoView({ behavior });
  };

  useEffect(() => {
    if (stickToBottom && !loading) {
      scrollToBottom(messages.length <= 1 ? "auto" : "smooth");
    }
  }, [messages, loading, stickToBottom]);

  useEffect(() => {
    if (!loading) scrollToBottom("auto");
  }, [loading]);

  const renderItems = buildMessageRenderList(messages);

  if (loading) {
    return (
      <div className="flex flex-1 items-center justify-center bg-[#efeae2] dark:bg-[#0b141a]">
        <div className="space-y-3 text-center">
          <div className="mx-auto h-2.5 w-52 animate-pulse rounded-full bg-[#d1d7db]/60" />
          <div className="mx-auto h-2.5 w-32 animate-pulse rounded-full bg-[#d1d7db]/60" />
          <div className="mx-auto h-2.5 w-64 animate-pulse rounded-full bg-[#d1d7db]/60" />
        </div>
      </div>
    );
  }

  return (
    <div className="relative flex min-h-0 flex-1 flex-col">
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto bg-[#efeae2] px-3 py-3 dark:bg-[#0b141a]"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23c8c4bc' fill-opacity='0.15'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")",
        }}
      >
        {renderItems.length === 0 ? (
          <div className="flex h-full min-h-[200px] items-center justify-center">
            <p className="rounded-lg bg-white/80 px-4 py-2 text-sm text-[#667781] shadow-sm dark:bg-[#202c33] dark:text-[#8696a0]">
              Aucun message. Soyez le premier à écrire !
            </p>
          </div>
        ) : (
          renderItems.map((item) => {
            if (item.type === "date") {
              return <ChatDateSeparator key={item.key} label={item.label} />;
            }

            const { message, showAvatar, showName, isGrouped } = item;
            const isMine = currentUserId === message.user_id;
            const canDelete = !!currentUserId && (isMine || isAdmin);

            return (
              <ChatBubble
                key={item.key}
                message={message}
                isMine={isMine}
                showAvatar={showAvatar}
                showName={showName}
                isGrouped={isGrouped}
                canDelete={canDelete}
                onReply={() => onReply(message)}
                onDelete={() => onDelete(message.id)}
                onProfileClick={onProfileClick}
              />
            );
          })
        )}
        <div ref={bottomRef} className="h-1" />
      </div>

      {!stickToBottom && (
        <Button
          size="sm"
          variant="secondary"
          className="absolute bottom-3 right-4 z-10 gap-1 rounded-full bg-white shadow-lg dark:bg-[#202c33]"
          onClick={() => {
            onStickToBottomChange(true);
            scrollToBottom();
          }}
        >
          <ChevronDown className="h-4 w-4" />
          Nouveaux messages
        </Button>
      )}
    </div>
  );
};

export default ChatMessageList;
