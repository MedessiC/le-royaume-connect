import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import UserAvatar from "@/components/UserAvatar";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { MessageCircle, MessageSquare, Send, Trash2, Smile, Paperclip, Users, Search, Pin } from "lucide-react";

type Profile = { id: string; full_name: string | null; avatar_url: string | null; country?: string | null };
type ParentMessage = {
  id: string;
  user_id: string;
  content: string;
  created_at: string;
  profile?: Profile;
};
type Message = {
  id: string;
  user_id: string;
  content: string;
  created_at: string;
  parent_id?: string | null;
  profile?: Profile;
  parent?: ParentMessage;
};
type ReplyTo = { id: string; name: string; preview: string } | null;

const Community = () => {
  const { user, isAdmin } = useAuth();
  const { toast } = useToast();
  const [messages, setMessages] = useState<Message[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [content, setContent] = useState("");
  const [posting, setPosting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [replyTo, setReplyTo] = useState<ReplyTo>(null);
  const [selectedProfile, setSelectedProfile] = useState<Profile | null>(null);
  const [onlineCount, setOnlineCount] = useState(0);
  const [onlineProfiles, setOnlineProfiles] = useState<Profile[]>([]);
  const [presenceSynced, setPresenceSynced] = useState(false);
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const presenceKey = useMemo(
    () => user?.id ?? `guest-${crypto.randomUUID?.() ?? Math.random().toString(36).slice(2)}`,
    [user?.id]
  );

  const updatePresenceState = (presenceState: Record<string, any>) => {
    const entries = Object.entries(presenceState || {});
    setOnlineCount(entries.length);

    const profiles: Profile[] = entries.map(([key, presences]) => {
      const meta = Array.isArray(presences) ? presences[0]?.metas?.[0] ?? presences[0] : presences;
      return {
        id: key,
        full_name: meta?.full_name ?? meta?.name ?? "Membre",
        avatar_url: meta?.avatar_url ?? null,
        country: meta?.country ?? null,
      };
    });

    setOnlineProfiles(profiles.slice(0, 6));
    setPresenceSynced(true);
  };

  useEffect(() => {
    document.title = "Discussion communautaire – MILLENIUM";
    fetchMessages();

    const channel = supabase
      .channel("community-messages-realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "community_messages" }, handleRealtimeEvent)
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!loading) {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, loading]);

  useEffect(() => {
    const presenceChannel = supabase
      .channel("presence-community", {
        config: {
          presence: { key: presenceKey, enabled: true },
        },
      })
      .on("presence", { event: "sync" }, () => {
        updatePresenceState((presenceChannel as any).presenceState());
      })
      .on("presence", { event: "join" }, () => {
        updatePresenceState((presenceChannel as any).presenceState());
      })
      .on("presence", { event: "leave" }, () => {
        updatePresenceState((presenceChannel as any).presenceState());
      })
      .subscribe((status) => {
        if (status === "SUBSCRIBED" && user) {
          presenceChannel
            .track({
              id: user.id,
              full_name: user.user_metadata?.full_name ?? "Membre",
              email: user.email,
            })
            .catch(() => {});
        }
      });

    return () => {
      presenceChannel.unsubscribe();
      supabase.removeChannel(presenceChannel).catch(() => {});
    };
  }, [presenceKey, user]);

  useEffect(() => {
    if (!loading && messages.length > 0) {
      const last = document.querySelector('.community-message:last-child');
      if (last) {
        last.classList.add('animate-fadein');
        setTimeout(() => last.classList.remove('animate-fadein'), 700);
      }
    }
  }, [messages, loading]);

  const handleRealtimeEvent = async (payload: any) => {
    if (!payload?.eventType) return;
    const eventType = payload.eventType.toUpperCase();

    if (eventType === "INSERT") {
      const id = payload.new?.id;
      if (id) {
        const newMessage = await fetchMessageById(id);
        if (newMessage) {
          setMessages((current) => {
            if (current.some((msg) => msg.id === newMessage.id)) return current;
            return [...current, newMessage].sort((a, b) => (a.created_at < b.created_at ? -1 : 1));
          });
        }
      }
    }

    if (eventType === "UPDATE") {
      const id = payload.new?.id;
      if (id) {
        const updatedMessage = await fetchMessageById(id);
        if (updatedMessage) {
          setMessages((current) => current.map((msg) => (msg.id === id ? updatedMessage : msg)));
        }
      }
    }

    if (eventType === "DELETE") {
      const id = payload.old?.id;
      if (id) {
        setMessages((current) => current.filter((msg) => msg.id !== id));
      }
    }
  };

  const fetchMessages = async () => {
    const { data: msgs, error } = await supabase
      .from("community_messages")
      .select("*")
      .order("created_at", { ascending: true })
      .limit(200);

    if (error) {
      toast({ title: "Erreur", description: error.message, variant: "destructive" });
      setLoading(false);
      return;
    }

    const parentIds = Array.from(new Set(msgs.filter((m) => m.parent_id).map((m) => m.parent_id!)));
    const { data: parentMsgs } = parentIds.length
      ? await supabase.from("community_messages").select("id, user_id, content, created_at").in("id", parentIds)
      : { data: [] };

    const userIds = Array.from(
      new Set([
        ...msgs.map((m) => m.user_id),
        ...(parentMsgs ?? []).map((p) => p.user_id),
      ])
    );

    const { data: profs } = await supabase
      .from("profiles")
      .select("id, full_name, avatar_url, country")
      .in("id", userIds);

    const profMap = new Map((profs ?? []).map((p) => [p.id, p as Profile]));
    const parentMap = new Map((parentMsgs ?? []).map((p) => [p.id, p as ParentMessage]));

    setMessages(
      msgs.map((m) => {
        const parent = m.parent_id ? parentMap.get(m.parent_id) : undefined;
        return {
          ...m,
          profile: profMap.get(m.user_id),
          parent: parent
            ? { ...parent, profile: profMap.get(parent.user_id) }
            : undefined,
        };
      })
    );
    setLoading(false);
  };

  const fetchMessageById = async (id: string): Promise<Message | null> => {
    const { data, error } = await supabase
      .from("community_messages")
      .select("*")
      .eq("id", id)
      .limit(1);

    if (error || !data?.[0]) return null;
    const msg = data[0];

    let parentData = null;
    if (msg.parent_id) {
      const { data: parentReply } = await supabase
        .from("community_messages")
        .select("id, user_id, content, created_at")
        .eq("id", msg.parent_id)
        .maybeSingle();
      parentData = parentReply;
    }

    const userIds = [msg.user_id];
    if (parentData?.user_id) userIds.push(parentData.user_id);

    const { data: profs } = await supabase
      .from("profiles")
      .select("id, full_name, avatar_url, country")
      .in("id", Array.from(new Set(userIds)));

    const profMap = new Map((profs ?? []).map((p) => [p.id, p as Profile]));

    return {
      ...msg,
      profile: profMap.get(msg.user_id),
      parent: parentData
        ? { ...parentData, profile: profMap.get(parentData.user_id) }
        : undefined,
    };
  };

  const post = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !content.trim()) return;
    setPosting(true);

    const payload: { user_id: string; content: string; parent_id?: string | null } = {
      user_id: user.id,
      content: content.trim(),
    };
    if (replyTo?.id) payload.parent_id = replyTo.id;

    const { error } = await supabase.from("community_messages").insert(payload);
    setPosting(false);
    if (error) {
      toast({ title: "Erreur", description: error.message, variant: "destructive" });
      return;
    }

    setContent("");
    setReplyTo(null);
  };

  const remove = async (id: string) => {
    const { error } = await supabase.from("community_messages").delete().eq("id", id);
    if (error) toast({ title: "Erreur", description: error.message, variant: "destructive" });
  };

  const initials = (name?: string | null) =>
    (name ?? "?").split(" ").map((s) => s[0]).slice(0, 2).join("").toUpperCase();

  const visibleMessages = searchTerm.trim()
    ? messages.filter((message) =>
        message.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
        message.profile?.full_name?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : messages;

  const fallbackProfiles = Array.from(
    new Map(
      messages
        .filter((message) => message.profile)
        .reverse()
        .map((message) => [message.profile!.id, message.profile!])
    ).values()
  ).slice(0, 6);

  const fallbackCount = new Set(messages.filter((message) => message.profile).map((message) => message.profile!.id)).size;
  const displayedProfiles = presenceSynced ? onlineProfiles : fallbackProfiles;
  const displayedCount = presenceSynced ? onlineCount : fallbackCount;

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <Navbar />
      <main className="flex-1 px-3 py-4 sm:px-4 sm:py-5">
        <div className="grid min-h-[calc(100vh-5.5rem)] grid-cols-1 gap-4 xl:grid-cols-[280px_minmax(0,1fr)_320px]">
          <aside className="rounded-[2rem] border border-border bg-card p-5 shadow-2xl shadow-royal/20">
            <div className="mb-6 flex items-center justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-[0.32em] text-muted-foreground">Serveur public</p>
                <h2 className="mt-2 text-xl font-semibold text-foreground">MILLENIUM Chat</h2>
              </div>
              <div className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-gold text-slate-950 shadow-lg shadow-gold/20">
                <Users className="h-5 w-5" />
              </div>
            </div>

              <div className="mb-5 rounded-3xl border border-border bg-popover p-4">
              <div className="flex items-center gap-3 rounded-2xl border border-border bg-card px-3 py-2">
                <Search className="h-4 w-4 text-muted-foreground" />
                  <input
                  type="search"
                  placeholder="Rechercher"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="h-10 w-full bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
                />
              </div>
            </div>

            <div className="space-y-2">
                {[
                { title: "général", description: "Discussion ouverte" },
                { title: "annonces", description: "Info & actualités" },
                { title: "questions", description: "Demandez et partagez" },
                { title: "enseignements", description: "Réflexion spirituelle" },
              ].map((channel) => (
                <button
                  key={channel.title}
                  type="button"
                  className="flex w-full flex-col rounded-3xl border border-border bg-popover px-4 py-4 text-left transition hover:border-gold/40 hover:bg-card"
                >
                  <span className="text-sm font-semibold text-foreground">#{channel.title}</span>
                  <span className="text-xs text-muted-foreground">{channel.description}</span>
                </button>
              ))}
            </div>

            <div className="mt-8 rounded-[1.75rem] border border-border bg-popover p-4">
              <div className="flex items-center justify-between gap-3 text-sm text-muted-foreground">
                <span>Membres actifs</span>
                <span className="rounded-full bg-card px-2 py-1 text-[11px] uppercase tracking-[0.2em] text-muted-foreground">{displayedCount} en ligne</span>
              </div>
              <div className="mt-4 space-y-3">
                {displayedProfiles.length ? (
                  displayedProfiles.map((profile) => (
                    <button
                      key={profile.id}
                      type="button"
                      onClick={() => setSelectedProfile(profile)}
                      className="flex w-full items-center gap-3 rounded-3xl bg-card px-3 py-3 text-left transition hover:border hover:border-gold/30"
                    >
                      <UserAvatar src={profile.avatar_url} name={profile.full_name || "Membre"} className="h-10 w-10" />
                      <div className="flex-1 overflow-hidden">
                        <p className="truncate text-sm font-semibold text-foreground">{profile.full_name || "Membre"}</p>
                        <p className="truncate text-xs text-muted-foreground">{profile.country ?? "Monde"}</p>
                      </div>
                    </button>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">Aucun membre actif pour l’instant.</p>
                )}
              </div>
            </div>
          </aside>

          <section className="flex min-h-[calc(100vh-5.5rem)] flex-col overflow-hidden rounded-[2rem] border border-border bg-popover shadow-2xl shadow-royal/20">
            <div className="border-b border-white/10 px-5 py-4">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Salon public</p>
                  <h1 className="text-2xl font-semibold text-foreground">#général</h1>
                </div>
                <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                  <span className="inline-flex items-center gap-2 rounded-full bg-card px-3 py-2">
                    <MessageCircle className="h-4 w-4 text-gold" /> {visibleMessages.length} messages
                  </span>
                  <span className="inline-flex items-center gap-2 rounded-full bg-card px-3 py-2">
                    <Users className="h-4 w-4 text-muted-foreground" /> Communauté publique
                  </span>
                </div>
              </div>
            </div>

            <div className="relative flex-1 overflow-hidden">
              {loading ? (
                <div className="flex h-full items-center justify-center px-6 py-10">
                  <div className="space-y-3 text-center">
                    <div className="h-2.5 w-52 animate-pulse rounded-full bg-muted"></div>
                    <div className="h-2.5 w-32 animate-pulse rounded-full bg-muted"></div>
                    <div className="h-2.5 w-64 animate-pulse rounded-full bg-muted"></div>
                  </div>
                </div>
              ) : (
                <ScrollArea className="h-full px-5 py-5">
                  <div className="space-y-4">
                    {visibleMessages.map((message) => {
                      const isMine = user && user.id === message.user_id;
                      const canDelete = user && (isMine || isAdmin);
                      return (
                        <div key={message.id} className="group flex gap-3 rounded-3xl bg-popover p-0 text-sm text-foreground">
                          <button
                            type="button"
                            onClick={() => message.profile && setSelectedProfile(message.profile)}
                            className="shrink-0"
                          >
                            <UserAvatar src={message.profile?.avatar_url} name={message.profile?.full_name || "Membre"} className="h-10 w-10 ring-1 ring-white/10" />
                          </button>
                            <div className="flex-1 rounded-3xl bg-card px-3 py-3">
                            <div className="flex flex-wrap items-center justify-between gap-2">
                              <div className="min-w-0">
                                <p className="truncate text-sm font-semibold text-foreground">{message.profile?.full_name || "Membre"}</p>
                                <p className="text-xs text-muted-foreground">{new Date(message.created_at).toLocaleString("fr-FR", { hour: "2-digit", minute: "2-digit" })}</p>
                              </div>
                              <div className="flex items-center gap-2 opacity-0 transition duration-150 group-hover:opacity-100">
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  onClick={() => {
                                    const name = message.profile?.full_name || "Membre";
                                    setReplyTo({
                                      id: message.id,
                                      name,
                                      preview: message.content.length > 120 ? `${message.content.slice(0, 120)}...` : message.content,
                                    });
                                  }}
                                  aria-label="Répondre"
                                >
                                  <MessageSquare className="h-4 w-4" />
                                </Button>
                                {canDelete && (
                                  <Button size="icon" variant="ghost" onClick={() => remove(message.id)} aria-label="Supprimer">
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                )}
                              </div>
                            </div>

                            {message.parent && (
                              <div className="mt-3 rounded-3xl border border-border bg-popover px-3 py-3 text-xs text-muted-foreground">
                                <div className="flex items-center gap-2">
                                  <span className="inline-block h-2 w-2 rounded-full bg-gold" />
                                  <p className="font-semibold text-foreground">Réponse à {message.parent.profile?.full_name || "un membre"}</p>
                                </div>
                                <div className="mt-2 rounded-3xl bg-card px-3 py-2 text-sm text-muted-foreground">
                                  <p className="line-clamp-3 leading-6">{message.parent.content}</p>
                                </div>
                              </div>
                            )}

                            <div className={`mt-3 rounded-3xl px-4 py-3 ${isMine ? "bg-popover text-foreground" : "bg-card text-foreground"}`}>
                              <p className="whitespace-pre-wrap leading-6">{message.content}</p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                    <div ref={bottomRef} />
                  </div>
                </ScrollArea>
              )}

              <div className="absolute inset-x-0 bottom-0 border-t border-border bg-popover px-5 py-4 backdrop-blur-xl">
                {user ? (
                  <form onSubmit={post} className="flex flex-col gap-3">
                    {replyTo && (
                      <div className="rounded-3xl border border-border bg-popover px-4 py-4 text-sm text-muted-foreground shadow-sm shadow-royal/12">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="text-[11px] uppercase tracking-[0.24em] text-muted-foreground">Réponse à</p>
                            <p className="mt-1 text-sm font-semibold text-foreground">{replyTo.name}</p>
                          </div>
                          <button type="button" onClick={() => setReplyTo(null)} className="rounded-full px-3 py-2 text-sm text-muted-foreground transition hover:bg-card hover:text-foreground">
                            Annuler
                          </button>
                        </div>
                        <div className="mt-3 rounded-3xl bg-card px-3 py-2 text-sm text-muted-foreground">
                          <p className="line-clamp-2 leading-6">{replyTo.preview}</p>
                        </div>
                      </div>
                    )}
                    <div className="flex items-end gap-3">
                      <Textarea
                        rows={2}
                        maxLength={2000}
                        placeholder={replyTo ? `Répondre à ${replyTo.name}...` : "Tapez votre message ici..."}
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        className="min-h-[4.5rem] flex-1 rounded-3xl border border-border bg-card px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-gold focus:ring-gold/10"
                        required
                      />
                      <Button type="submit" variant="hero" size="icon" disabled={posting || !content.trim()} aria-label="Envoyer">
                        <Send className="h-5 w-5" />
                      </Button>
                    </div>
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>{content.length}/2000</span>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <span className="inline-flex items-center gap-2">
                          <Smile className="h-4 w-4" />
                          Emojis
                        </span>
                        <span className="inline-flex items-center gap-2">
                          <Paperclip className="h-4 w-4" />
                          Attacher
                        </span>
                      </div>
                    </div>
                  </form>
                ) : (
                  <div className="rounded-3xl border border-border bg-card p-6 text-center">
                    <p className="mb-4 text-base font-semibold text-foreground">Connectez-vous pour discuter</p>
                    <Link to="/auth">
                      <Button variant="hero">Se connecter</Button>
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </section>

          <aside className="rounded-[2rem] border border-border bg-card p-5 shadow-2xl shadow-royal/20">
            <div className="mb-6 flex items-center justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-[0.32em] text-muted-foreground">Communauté</p>
                <h2 className="mt-2 text-lg font-semibold text-foreground">Membres actifs</h2>
              </div>
              <span className="rounded-full bg-card px-3 py-1 text-[11px] uppercase tracking-[0.2em] text-muted-foreground">En direct</span>
            </div>

            <div className="space-y-3">
              {messages.slice(-6).map((message) => (
                <button
                  key={message.id}
                  type="button"
                  onClick={() => message.profile && setSelectedProfile(message.profile)}
                  className="flex w-full items-center gap-3 rounded-3xl border border-border bg-popover px-3 py-3 text-left transition hover:border-gold/40"
                >
                  <UserAvatar src={message.profile?.avatar_url} name={message.profile?.full_name || "Membre"} className="h-11 w-11" />
                  <div className="flex-1 overflow-hidden">
                    <p className="truncate text-sm font-semibold text-foreground">{message.profile?.full_name || "Membre"}</p>
                    <p className="truncate text-xs text-muted-foreground">{message.profile?.country ?? "Monde"}</p>
                  </div>
                </button>
              ))}
            </div>

            <div className="mt-8 rounded-3xl border border-border bg-popover p-4">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">Messages épinglés</p>
                  <h3 className="text-sm font-semibold text-foreground">À ne pas manquer</h3>
                </div>
                <Pin className="h-4 w-4 text-gold" />
              </div>
              <div className="space-y-4">
                {messages.slice(-2).map((pinned) => (
                  <div key={pinned.id} className="rounded-3xl border border-border bg-card px-4 py-3 text-sm text-muted-foreground">
                    <p className="truncate font-medium text-foreground">{pinned.profile?.full_name || "Membre"}</p>
                    <p className="mt-1 line-clamp-2 text-muted-foreground">{pinned.content}</p>
                  </div>
                ))}
              </div>
            </div>
          </aside>
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
                <UserAvatar src={selectedProfile.avatar_url} name={selectedProfile.full_name || "Membre"} className="h-14 w-14" />
                <div>
                  <div className="text-lg font-semibold text-foreground">{selectedProfile.full_name || "Membre"}</div>
                  <div className="text-sm text-muted-foreground">ID public : {selectedProfile.id}</div>
                </div>
              </div>
              {selectedProfile.country && (
                <div>
                  <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">Pays</p>
                  <p className="text-sm text-foreground">{selectedProfile.country}</p>
                </div>
              )}
              <div className="rounded-2xl border border-border bg-secondary p-4 text-sm text-muted-foreground">
                Cet espace affiche les informations publiques du profil sélectionné.
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
