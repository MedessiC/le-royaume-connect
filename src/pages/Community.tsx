import { useEffect, useMemo, useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import UserAvatar from "@/components/UserAvatar";
import ChatHeader from "@/components/community/ChatHeader";
import ChatMessageList from "@/components/community/ChatMessageList";
import ChatComposer from "@/components/community/ChatComposer";
import LiveKitSessionDialog from "@/components/community/LiveKitSessionDialog";
import { useCommunityChat } from "@/components/community/useCommunityChat";
import type { Profile } from "@/components/community/types";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { PhoneCall, Radio, Search, Square, Users, Video } from "lucide-react";

type LiveKitTokenMode = "call" | "live-host" | "viewer";

type LiveKitSession = {
  title: string;
  token: string;
  url: string;
  roomName: string;
  mode: LiveKitTokenMode;
};

type CommunityRoom = {
  id: string;
  name: string;
  title: string;
  type: "group_call" | "live";
  status: "idle" | "active" | "ended";
  host_id: string | null;
  started_at: string | null;
  ended_at: string | null;
};

type CommunityLive = {
  id: string;
  title: string;
  description: string | null;
  room_name: string;
  status: "scheduled" | "live" | "ended";
  host_id: string;
  started_at: string | null;
  ended_at: string | null;
};

type SupabaseMutableClient = typeof supabase & {
  from: (table: string) => {
    select: (columns?: string) => unknown;
    update: (values: Record<string, unknown>) => unknown;
    insert: (values: Record<string, unknown>) => unknown;
    upsert: (values: Record<string, unknown>, options?: Record<string, unknown>) => unknown;
  };
};

const LIVE_ROOM_NAME = "community-live";
const CALL_ROOM_NAME = "community-general";

const Community = () => {
  const { user, profile, isAdmin } = useAuth();
  const { toast } = useToast();
  const [selectedProfile, setSelectedProfile] = useState<Profile | null>(null);
  const [liveKitSession, setLiveKitSession] = useState<LiveKitSession | null>(null);
  const [startingSession, setStartingSession] = useState<LiveKitTokenMode | null>(null);
  const [showMembers, setShowMembers] = useState(false);
  const [showMobileSearch, setShowMobileSearch] = useState(false);
  const [onlineCount, setOnlineCount] = useState(0);
  const [onlineProfiles, setOnlineProfiles] = useState<Profile[]>([]);
  const [presenceSynced, setPresenceSynced] = useState(false);
  const [communityRoom, setCommunityRoom] = useState<CommunityRoom | null>(null);
  const [currentLive, setCurrentLive] = useState<CommunityLive | null>(null);

  const supabaseDb = supabase as SupabaseMutableClient;

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
    const loadMediaState = async () => {
      const roomQuery = supabaseDb
        .from("community_rooms")
        .select("id, name, title, type, status, host_id, started_at, ended_at") as {
        eq: (column: string, value: string) => { maybeSingle: () => Promise<{ data: CommunityRoom | null }> };
      };
      const liveQuery = supabaseDb
        .from("lives")
        .select("id, title, description, room_name, status, host_id, started_at, ended_at") as {
        order: (column: string, options: { ascending: boolean }) => {
          limit: (count: number) => { maybeSingle: () => Promise<{ data: CommunityLive | null }> };
        };
      };

      const [roomResult, liveResult] = await Promise.all([
        roomQuery.eq("name", CALL_ROOM_NAME).maybeSingle(),
        liveQuery.order("created_at", { ascending: false }).limit(1).maybeSingle(),
      ]);

      setCommunityRoom(roomResult.data ?? null);
      setCurrentLive(liveResult.data ?? null);
    };

    loadMediaState();

    const mediaChannel = supabase
      .channel("community-media-state")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "community_rooms" },
        (payload) => {
          const nextRoom = payload.new as CommunityRoom | null;
          if (nextRoom?.name === CALL_ROOM_NAME) setCommunityRoom(nextRoom);
        },
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "lives" },
        (payload) => {
          const nextLive = payload.new as CommunityLive | null;
          if (nextLive?.room_name === LIVE_ROOM_NAME) setCurrentLive(nextLive);
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(mediaChannel);
    };
  }, [supabaseDb]);

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

  const markCallActive = async () => {
    const query = supabaseDb
      .from("community_rooms")
      .update({
        status: "active",
        host_id: user?.id ?? null,
        started_at: new Date().toISOString(),
        ended_at: null,
      }) as {
      eq: (column: string, value: string) => Promise<{ error: { message: string } | null }>;
    };

    const { error } = await query.eq("name", CALL_ROOM_NAME);
    if (error) {
      toast({
        title: "Appel lancé sans statut public",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const markCallEnded = async () => {
    const query = supabaseDb
      .from("community_rooms")
      .update({
        status: "idle",
        ended_at: new Date().toISOString(),
      }) as {
      eq: (column: string, value: string) => Promise<{ error: { message: string } | null }>;
    };

    const { error } = await query.eq("name", CALL_ROOM_NAME);
    if (error) {
      toast({ title: "Impossible de terminer l'appel", description: error.message, variant: "destructive" });
    }
  };

  const ensureLiveIsActive = async () => {
    if (!user || !isAdmin) return;

    const payload = {
      title: "Live communautaire",
      description: "Direct de la communauté MILLENIUM",
      room_name: LIVE_ROOM_NAME,
      status: "live",
      host_id: user.id,
      started_at: new Date().toISOString(),
      ended_at: null,
    };

    const query = supabaseDb.from("lives").upsert(payload, { onConflict: "room_name" }) as Promise<{
      error: { message: string } | null;
    }>;
    const { error } = await query;

    if (error) {
      toast({ title: "Impossible de publier le live", description: error.message, variant: "destructive" });
    }
  };

  const endLive = async () => {
    if (!isAdmin) return;

    const query = supabaseDb
      .from("lives")
      .update({
        status: "ended",
        ended_at: new Date().toISOString(),
      }) as {
      eq: (column: string, value: string) => Promise<{ error: { message: string } | null }>;
    };

    const { error } = await query.eq("room_name", LIVE_ROOM_NAME);

    if (error) {
      toast({ title: "Impossible de terminer le live", description: error.message, variant: "destructive" });
      return;
    }

    setCurrentLive((live) => (live ? { ...live, status: "ended", ended_at: new Date().toISOString() } : live));
  };

  const startLiveKitSession = async (mode: LiveKitTokenMode) => {
    if (!user) {
      toast({
        title: "Connexion requise",
        description: "Connectez-vous pour rejoindre un appel ou un live.",
        variant: "destructive",
      });
      return;
    }

    if (mode === "live-host" && !isAdmin) {
      toast({
        title: "Accès admin requis",
        description: "Seuls les administrateurs peuvent lancer un live.",
        variant: "destructive",
      });
      return;
    }

    setStartingSession(mode);

    if (mode === "call") await markCallActive();
    if (mode === "live-host") await ensureLiveIsActive();

    const roomName = mode === "call" ? CALL_ROOM_NAME : LIVE_ROOM_NAME;
    const title =
      mode === "call"
        ? "Appel de groupe - #général"
        : mode === "viewer"
          ? "Suivre le live communautaire"
          : "Live communautaire";

    const { data, error } = await supabase.functions.invoke<LiveKitSession>("livekit-token", {
      body: { roomName, mode },
    });

    setStartingSession(null);

    if (error || !data?.token || !data?.url) {
      toast({
        title: "Impossible de démarrer",
        description: error?.message ?? "La fonction LiveKit n'a pas renvoyé de token.",
        variant: "destructive",
      });
      return;
    }

    setLiveKitSession({
      title,
      token: data.token,
      url: data.url,
      roomName: data.roomName,
      mode: data.mode,
    });
  };

  const renderMediaPanel = (compact = false) => {
    const callActive = communityRoom?.status === "active";
    const liveActive = currentLive?.status === "live";

    return (
      <div className={compact ? "space-y-2" : "grid gap-3 border-b border-[#d1d7db] bg-[#f0f2f5] p-3 dark:border-[#222d34] dark:bg-[#202c33] sm:grid-cols-2"}>
        <div className="rounded-xl border border-border bg-background p-3 shadow-sm">
          <div className="mb-3 flex items-center justify-between gap-3">
            <div className="flex min-w-0 items-center gap-2">
              <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-green-500/15 text-green-600">
                <PhoneCall className="h-4 w-4" />
              </span>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold">Appel général</p>
                <p className="text-xs text-muted-foreground">
                  {callActive ? "En cours maintenant" : "Salon vocal et vidéo ouvert"}
                </p>
              </div>
            </div>
            <span className={callActive ? "h-2.5 w-2.5 rounded-full bg-green-500" : "h-2.5 w-2.5 rounded-full bg-muted"} />
          </div>
          <div className="flex gap-2">
            <Button
              type="button"
              size="sm"
              className="flex-1"
              disabled={startingSession === "call"}
              onClick={() => startLiveKitSession("call")}
            >
              <Video className="h-4 w-4" />
              {callActive ? "Rejoindre" : "Démarrer"}
            </Button>
            {isAdmin && callActive && (
              <Button type="button" size="icon" variant="outline" onClick={markCallEnded} aria-label="Terminer l'appel">
                <Square className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>

        <div className="rounded-xl border border-border bg-background p-3 shadow-sm">
          <div className="mb-3 flex items-center justify-between gap-3">
            <div className="flex min-w-0 items-center gap-2">
              <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-red-500/15 text-red-600">
                <Radio className="h-4 w-4" />
              </span>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold">Live communautaire</p>
                <p className="text-xs text-muted-foreground">
                  {liveActive ? "Diffusion en direct" : isAdmin ? "Prêt à lancer" : "Aucun live actif"}
                </p>
              </div>
            </div>
            <span className={liveActive ? "rounded-full bg-red-500 px-2 py-0.5 text-[10px] font-bold text-white" : "rounded-full bg-muted px-2 py-0.5 text-[10px] text-muted-foreground"}>
              {liveActive ? "LIVE" : "OFF"}
            </span>
          </div>
          <div className="flex gap-2">
            {liveActive ? (
              <Button
                type="button"
                size="sm"
                className="flex-1"
                disabled={startingSession === "viewer"}
                onClick={() => startLiveKitSession(isAdmin ? "live-host" : "viewer")}
              >
                <Radio className="h-4 w-4" />
                {isAdmin ? "Entrer" : "Suivre"}
              </Button>
            ) : (
              <Button
                type="button"
                size="sm"
                className="flex-1"
                disabled={!isAdmin || startingSession === "live-host"}
                onClick={() => startLiveKitSession("live-host")}
              >
                <Radio className="h-4 w-4" />
                {isAdmin ? "Lancer" : "En attente"}
              </Button>
            )}
            {isAdmin && liveActive && (
              <Button type="button" size="icon" variant="outline" onClick={endLive} aria-label="Terminer le live">
                <Square className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderOnlineProfiles = (emptyLabel = "Aucun membre connecté") => (
    <div className="space-y-2">
      {displayedProfiles.length ? (
        displayedProfiles.map((p) => (
          <button
            key={p.id}
            type="button"
            onClick={() => {
              setSelectedProfile(p);
              setShowMembers(false);
            }}
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
        <p className="text-xs text-muted-foreground">{emptyLabel}</p>
      )}
    </div>
  );

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

            <div className="mt-3">{renderMediaPanel(true)}</div>

            <div className="mt-6">
              <div className="mb-3 flex items-center justify-between text-xs text-muted-foreground">
                <span>Membres en ligne</span>
                <span className="rounded-full bg-muted px-2 py-0.5">{displayedCount}</span>
              </div>
              <div className="max-h-[40vh] space-y-2 overflow-y-auto">
                {renderOnlineProfiles()}
              </div>
            </div>
          </aside>

          <section className="flex min-h-[calc(100vh-5.5rem)] flex-col overflow-hidden rounded-2xl border border-border shadow-xl">
            <ChatHeader
              messageCount={visibleMessages.length}
              onlineCount={displayedCount}
              callBusy={startingSession === "call"}
              liveBusy={startingSession === "live-host"}
              onStartCall={() => startLiveKitSession("call")}
              onStartLive={() => startLiveKitSession("live-host")}
              onShowMembers={() => setShowMembers(true)}
              onShowSearch={() => setShowMobileSearch((value) => !value)}
            />
            {showMobileSearch && (
              <div className="border-b border-[#d1d7db] bg-[#f0f2f5] px-3 py-2 dark:border-[#222d34] dark:bg-[#202c33] lg:hidden">
                <div className="flex items-center gap-2 rounded-full bg-white px-3 py-2 dark:bg-[#2a3942]">
                  <Search className="h-4 w-4 shrink-0 text-[#667781] dark:text-[#8696a0]" />
                  <input
                    type="search"
                    placeholder="Rechercher dans #général"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="h-8 w-full bg-transparent text-sm focus:outline-none"
                  />
                </div>
              </div>
            )}
            {renderMediaPanel()}
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

      <LiveKitSessionDialog
        open={!!liveKitSession}
        title={liveKitSession?.title ?? "Salon LiveKit"}
        token={liveKitSession?.token ?? null}
        serverUrl={liveKitSession?.url ?? null}
        onOpenChange={(open) => {
          if (!open) setLiveKitSession(null);
        }}
      />

      <Sheet open={showMembers} onOpenChange={setShowMembers}>
        <SheetContent side="right" className="w-[88vw] max-w-sm">
          <SheetHeader>
            <SheetTitle>Membres en ligne</SheetTitle>
            <SheetDescription>{displayedCount} membre(s) actuellement dans le salon.</SheetDescription>
          </SheetHeader>
          <div className="mt-6 max-h-[calc(100vh-10rem)] overflow-y-auto">
            {renderOnlineProfiles("Personne n'est connecté pour le moment")}
          </div>
        </SheetContent>
      </Sheet>

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
