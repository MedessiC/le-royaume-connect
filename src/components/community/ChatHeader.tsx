import { MessageCircle, Users } from "lucide-react";
import UserAvatar from "@/components/UserAvatar";

type ChatHeaderProps = {
  messageCount: number;
  onlineCount: number;
};

const ChatHeader = ({ messageCount, onlineCount }: ChatHeaderProps) => (
  <header className="flex shrink-0 items-center gap-3 border-b border-[#d1d7db] bg-[#f0f2f5] px-4 py-3 dark:border-[#222d34] dark:bg-[#202c33]">
    <UserAvatar
      src={null}
      name="Général"
      className="h-10 w-10 ring-2 ring-gold/30"
    />
    <div className="min-w-0 flex-1">
      <h1 className="truncate text-base font-semibold text-[#111b21] dark:text-[#e9edef]">
        #général
      </h1>
      <p className="truncate text-xs text-[#667781] dark:text-[#8696a0]">
        {onlineCount > 0 ? `${onlineCount} en ligne` : "Communauté MILLENIUM"}
      </p>
    </div>
    <div className="hidden items-center gap-2 sm:flex">
      <span className="inline-flex items-center gap-1.5 rounded-full bg-white/80 px-2.5 py-1 text-[11px] text-[#667781] dark:bg-[#2a3942] dark:text-[#8696a0]">
        <MessageCircle className="h-3.5 w-3.5 text-gold" />
        {messageCount}
      </span>
      <span className="inline-flex items-center gap-1.5 rounded-full bg-white/80 px-2.5 py-1 text-[11px] text-[#667781] dark:bg-[#2a3942] dark:text-[#8696a0]">
        <Users className="h-3.5 w-3.5" />
        Public
      </span>
    </div>
  </header>
);

export default ChatHeader;
