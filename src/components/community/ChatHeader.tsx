import { MessageCircle, Phone, Radio, Search, Users, Video } from "lucide-react";
import UserAvatar from "@/components/UserAvatar";
import { Button } from "@/components/ui/button";

type ChatHeaderProps = {
  messageCount: number;
  onlineCount: number;
  callBusy: boolean;
  liveBusy: boolean;
  onStartCall: () => void;
  onStartLive: () => void;
  onShowMembers: () => void;
  onShowSearch: () => void;
};

const ChatHeader = ({
  messageCount,
  onlineCount,
  callBusy,
  liveBusy,
  onStartCall,
  onStartLive,
  onShowMembers,
  onShowSearch,
}: ChatHeaderProps) => (
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
    <div className="flex items-center gap-1">
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="h-9 w-9 rounded-full text-[#54656f] hover:bg-white/80 dark:text-[#aebac1] dark:hover:bg-[#2a3942]"
        onClick={onShowSearch}
        aria-label="Rechercher"
      >
        <Search className="h-4 w-4" />
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="h-9 w-9 rounded-full text-[#54656f] hover:bg-white/80 dark:text-[#aebac1] dark:hover:bg-[#2a3942]"
        onClick={onStartCall}
        disabled={callBusy}
        aria-label="Lancer un appel de groupe"
      >
        <Phone className="h-4 w-4" />
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="hidden h-9 w-9 rounded-full text-[#54656f] hover:bg-white/80 dark:text-[#aebac1] dark:hover:bg-[#2a3942] sm:inline-flex"
        onClick={onStartCall}
        disabled={callBusy}
        aria-label="Lancer un appel vidéo"
      >
        <Video className="h-4 w-4" />
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="h-9 w-9 rounded-full text-[#54656f] hover:bg-white/80 dark:text-[#aebac1] dark:hover:bg-[#2a3942]"
        onClick={onStartLive}
        disabled={liveBusy}
        aria-label="Démarrer un live"
      >
        <Radio className="h-4 w-4" />
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="h-9 w-9 rounded-full text-[#54656f] hover:bg-white/80 dark:text-[#aebac1] dark:hover:bg-[#2a3942] lg:hidden"
        onClick={onShowMembers}
        aria-label="Voir les membres"
      >
        <Users className="h-4 w-4" />
      </Button>
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
