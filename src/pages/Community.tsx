import { useEffect, useMemo, useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import UserAvatar from "@/components/UserAvatar";
import ChatHeader from "@/components/community/ChatHeader";
import ChatMessageList from "@/components/community/ChatMessageList";
import ChatComposer from "@/components/community/ChatComposer";
import { useCommunityChat } from "@/components/community/useCommunityChat";
import type { Profile } from "@/components/community/types";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Search, Users } from "lucide-react";

const Community = () => {
  const { user, profile, isAdmin } = useAuth();
  const [selectedProfile, setSelectedProfile] = useState<Profile | null>(null);
  const [onlineCount, setOnlineCount] = useState(0);
  const [onlineProfiles, setOnlineProfiles] = useState<Profile[]>([]);
  const [presenceSynced, setPresenceSynced] = useState(false);

  const {
    visibleMessages,
    loading,
    posting,
    content,
    replyTo,
    searchTerm,
    stickToBottom,
    setContent,
    setSearchTerm,
    setStickToBottom,
    setReplyTo,
    post,
    remove,
    setReply,
    insertEmoji,
  } = useCommunityChat({
    user,
    profile: user && profile ? { id: user.id, ...profile } : null,
  });

  const presenceKey = useMemo(
    () => user?.id ?? `guest-${crypto.randomUUID?.() ?? Math.random().toString(36).slice(2)}`,
    [user?.id],
  );

  const updatePresenceState = (presenceState: Record<string, unknown>) => {
    const entries = Object.entries(presenceState || {});
    setOnlineCount(entries.length);

    const profiles: Profile[] = entries.map(([key, presences]) => {
      const meta = Array.isArray(presences)
        ? (presences[0] as { metas?: Array<Record<string, string>> })?.metas?.[0] ??
          (presences[0] as Record<string, string>)
        : (presences as Record<string, string>);
      return {
        id: key,
        full_name: meta?.full_name ?? meta?.name ?? "Membre",
        avatar_url: meta?.avatar_url ?? null,
        country: meta?.country ?? null,
      };
    });

    setOnlineProfiles(profiles);
    setPresenceSynced(true);
  };

  useEffect(() => {
    document.title = "Discussion communautaire – MILLENIUM";
  }, []);

  useEffect(() => {
    const presenceChannel = supabase
      .channel("presence-community", {
        config: {
          presence: { key: presenceKey, enabled: true },
        },
      })
      .on("presence", { event: "sync" }, () => {
        updatePresenceState(
          (presenceChannel as unknown as { presenceState: () => Record<string, unknown> }).presenceState(),
        );
      })
      .on("presence", { event: "join" }, () => {
        updatePresenceState(
          (presenceChannel as unknown as { presenceState: () => Record<string, unknown> }).presenceState(),
        );
      })
      .on("presence", { event: "leave" }, () => {
        updatePresenceState(
          (presenceChannel as unknown as { presenceState: () => Record<string, unknown> }).presenceState(),
        );
      })
      .subscribe((status) => {
        if (status === "SUBSCRIBED" && user) {
          presenceChannel
            .track({
              id: user.id,
              full_name: user.user_metadata?.full_name ?? profile?.full_name ?? "Membre",
              avatar_url: profile?.avatar_url ?? null,
            })
            .catch(() => {});
        }
      });

    return () => {
      presenceChannel.unsubscribe();
      supabase.removeChannel(presenceChannel).catch(() => {});
    };
  }, [presenceKey, profile?.avatar_url, profile?.full_name, user]);

  const displayedProfiles = presenceSynced ? onlineProfiles : [];
  const displayedCount = presenceSynced ? onlineCount : 0;

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <Navbar />
      <main className="flex-1 px-2 py-3 sm:px-4 sm:py-4">
        <div className="mx-auto grid min-h-[calc(100vh-5.5rem)] max-w-6xl grid-cols-1 gap-3 lg:grid-cols-[260px_minmax(0,1fr)]">
          <aside className="hidden rounded-2xl border border-border bg-card p-4 shadow-lg lg:block">
            <div className="mb-4 flex items-center gap-3">
              <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-gold text-slate-950">
                <Users className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-base font-semibold">MILLENIUM Chat</h2>
                <p className="text-xs text-muted-foreground">Salon public</p>
              </div>
            </div>

            <div className="mb-4 flex items-center gap-2 rounded-xl border border-border bg-popover px-3 py-2">
              <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
              <input
                type="search"
                placeholder="Rechercher un message"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="h-9 w-full bg-transparent text-sm focus:outline-none"
              />
            </div>

            <div className="rounded-xl border border-gold/30 bg-gold/5 px-3 py-3">
              <p className="text-sm font-semibold text-foreground">#général</p>
              <p className="text-xs text-muted-foreground">Discussion ouverte</p>
            </div>

            <div className="mt-6">
              <div className="mb-3 flex items-center justify-between text-xs text-muted-foreground">
                <span>Membres en ligne</span>
                <span className="rounded-full bg-muted px-2 py-0.5">{displayedCount}</span>
              </div>
              <div className="max-h-[40vh] space-y-2 overflow-y-auto">
                {displayedProfiles.length ? (
                  displayedProfiles.map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => setSelectedProfile(p)}
                      className="flex w-full items-center gap-2 rounded-xl px-2 py-2 text-left transition hover:bg-muted"
                    >
                      <UserAvatar src={p.avatar_url} name={p.full_name || "Membre"} className="h-8 w-8" />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium">{p.full_name || "Membre"}</p>
                        <p className="truncate text-xs text-muted-foreground">{p.country ?? "En ligne"}</p>
                      </div>
                      <span className="h-2 w-2 shrink-0 rounded-full bg-green-500" />
                    </button>
                  ))
                ) : (
                  <p className="text-xs text-muted-foreground">Aucun membre connecté</p>
                )}
              </div>
            </div>
          </aside>

          <section className="flex min-h-[calc(100vh-5.5rem)] flex-col overflow-hidden rounded-2xl border border-border shadow-xl">
            <ChatHeader messageCount={visibleMessages.length} onlineCount={displayedCount} />
            <ChatMessageList
              messages={visibleMessages}
              loading={loading}
              currentUserId={user?.id}
              isAdmin={isAdmin}
              stickToBottom={stickToBottom}
              onStickToBottomChange={setStickToBottom}
              onReply={setReply}
              onDelete={remove}
              onProfileClick={setSelectedProfile}
            />
            <ChatComposer
              content={content}
              posting={posting}
              replyTo={replyTo}
              onContentChange={setContent}
              onSubmit={post}
              onCancelReply={() => setReplyTo(null)}
              onInsertEmoji={insertEmoji}
              isLoggedIn={!!user}
            />
          </section>
        </div>
      </main>

      <Dialog open={!!selectedProfile} onOpenChange={(open) => !open && setSelectedProfile(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Profil public</DialogTitle>
            <DialogDescription>Informations visibles par tous les membres.</DialogDescription>
          </DialogHeader>
          {selectedProfile && (
            <div className="space-y-4 pt-4">
              <div className="flex items-center gap-4">
                <UserAvatar
                  src={selectedProfile.avatar_url}
                  name={selectedProfile.full_name || "Membre"}
                  className="h-14 w-14"
                />
                <div>
                  <div className="text-lg font-semibold">{selectedProfile.full_name || "Membre"}</div>
                  {selectedProfile.country && (
                    <div className="text-sm text-muted-foreground">{selectedProfile.country}</div>
                  )}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
};

export default Community;
