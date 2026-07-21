import { useCallback, useEffect, useMemo, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { sortMessages } from "./groupMessages";
import type { ChatMessage, ParentMessage, Profile, ReplyTo } from "./types";
import { moderateMessage } from "@/lib/moderation";

type UseCommunityChatOptions = {
  user: User | null;
  profile: Profile | null;
};

export function useCommunityChat({ user, profile }: UseCommunityChatOptions) {
  const { toast } = useToast();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [posting, setPosting] = useState(false);
  const [content, setContent] = useState("");
  const [replyTo, setReplyTo] = useState<ReplyTo>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [stickToBottom, setStickToBottom] = useState(true);
  const [messageLimit, setMessageLimit] = useState(30);

  const enrichMessages = useCallback(
    async (rows: Array<{ id: string; user_id: string; content: string; created_at: string; parent_id?: string | null }>) => {
      const parentIds = Array.from(
        new Set(rows.filter((m) => m.parent_id).map((m) => m.parent_id!)),
      );

      const { data: parentMsgs } = parentIds.length
        ? await supabase
            .from("community_messages")
            .select("id, user_id, content, created_at")
            .in("id", parentIds)
        : { data: [] };

      const userIds = Array.from(
        new Set([
          ...rows.map((m) => m.user_id),
          ...(parentMsgs ?? []).map((p) => p.user_id),
        ]),
      );

      const { data: profs } = await supabase
        .from("profiles")
        .select("id, full_name, avatar_url, country")
        .in("id", userIds);

      const profMap = new Map((profs ?? []).map((p) => [p.id, p as Profile]));
      const parentMap = new Map((parentMsgs ?? []).map((p) => [p.id, p as ParentMessage]));

      return sortMessages(
        rows.map((m) => {
          const parent = m.parent_id ? parentMap.get(m.parent_id) : undefined;
          return {
            ...m,
            status: "sent" as const,
            profile: profMap.get(m.user_id),
            parent: parent
              ? { ...parent, profile: profMap.get(parent.user_id) }
              : undefined,
          };
        }),
      );
    },
    [],
  );

  const fetchMessageById = useCallback(async (id: string): Promise<ChatMessage | null> => {
    const { data, error } = await supabase
      .from("community_messages")
      .select("*")
      .eq("id", id)
      .limit(1);

    if (error || !data?.[0]) return null;
    const enriched = await enrichMessages([data[0]]);
    return enriched[0] ?? null;
  }, [enrichMessages]);

  const fetchMessages = useCallback(async () => {
    const { data: msgs, error } = await supabase
      .from("community_messages")
      .select("*")
      .order("created_at", { ascending: false }) // Fetch most recent messages first
      .limit(messageLimit);

    if (error) {
      toast({ title: "Erreur", description: error.message, variant: "destructive" });
      setLoading(false);
      return;
    }

    // Reverse them to restore chronological order (oldest to newest)
    const reversed = msgs ? [...msgs].reverse() : [];
    setMessages(await enrichMessages(reversed));
    setLoading(false);
  }, [enrichMessages, toast, messageLimit]);

  const handleRealtimeEvent = useCallback(
    async (payload: { eventType?: string; new?: { id?: string }; old?: { id?: string } }) => {
      if (!payload?.eventType) return;
      const eventType = payload.eventType.toUpperCase();

      if (eventType === "INSERT") {
        const id = payload.new?.id;
        if (!id) return;
        const newMessage = await fetchMessageById(id);
        if (!newMessage) return;

        // Ne pas afficher les messages qui violeraient la modération
        const modResult = moderateMessage(newMessage.content);
        if (modResult.blocked) return;

        setMessages((current) => {
          if (current.some((msg) => msg.id === newMessage.id)) return current;
          const filtered = current.filter(
            (msg) =>
              !(
                msg.status === "pending" &&
                msg.user_id === newMessage.user_id &&
                msg.content === newMessage.content
              ),
          );
          return sortMessages([...filtered, newMessage]);
        });
        return;
      }

      if (eventType === "UPDATE") {
        const id = payload.new?.id;
        if (!id) return;
        const updatedMessage = await fetchMessageById(id);
        if (!updatedMessage) return;
        setMessages((current) =>
          sortMessages(current.map((msg) => (msg.id === id ? updatedMessage : msg))),
        );
        return;
      }

      if (eventType === "DELETE") {
        const id = payload.old?.id;
        if (!id) return;
        setMessages((current) => current.filter((msg) => msg.id !== id));
      }
    },
    [fetchMessageById],
  );

  useEffect(() => {
    fetchMessages();

    const channel = supabase
      .channel("community-messages-realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "community_messages" },
        handleRealtimeEvent,
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchMessages, handleRealtimeEvent]);

  const post = useCallback(async () => {
    if (!user || !content.trim() || posting) return;

    const trimmed = content.trim();

    // ── Modération avant envoi ─────────────────────────────────────────────
    const modResult = moderateMessage(trimmed);
    if (modResult.blocked) {
      toast({
        title: "Message bloqué par la modération",
        description: modResult.reason ?? "Ce contenu n'est pas autorisé dans cette communauté.",
        variant: "destructive",
      });
      return; // Ne pas envoyer, ne pas effacer la saisie
    }
    const parentId = replyTo?.id ?? null;
    const tempId = `pending-${crypto.randomUUID()}`;

    const optimistic: ChatMessage = {
      id: tempId,
      user_id: user.id,
      content: trimmed,
      created_at: new Date().toISOString(),
      parent_id: parentId,
      status: "pending",
      profile: profile ?? {
        id: user.id,
        full_name: user.user_metadata?.full_name ?? "Moi",
        avatar_url: null,
      },
      parent: replyTo
        ? {
            id: replyTo.id,
            user_id: "",
            content: replyTo.preview,
            created_at: new Date().toISOString(),
            profile: { id: "", full_name: replyTo.name, avatar_url: null },
          }
        : undefined,
    };

    setMessages((current) => sortMessages([...current, optimistic]));
    setContent("");
    setReplyTo(null);
    setStickToBottom(true);
    setPosting(true);

    const payload: { user_id: string; content: string; parent_id?: string | null } = {
      user_id: user.id,
      content: trimmed,
    };
    if (parentId) payload.parent_id = parentId;

    const { error } = await supabase.from("community_messages").insert(payload);
    setPosting(false);

    if (error) {
      setMessages((current) =>
        current.map((msg) => (msg.id === tempId ? { ...msg, status: "failed" } : msg)),
      );
      toast({ title: "Erreur", description: error.message, variant: "destructive" });
    }
  }, [content, posting, profile, replyTo, toast, user]);

  const remove = useCallback(
    async (id: string) => {
      // Optimistic removal from state immediately for responsive UX
      setMessages((current) => current.filter((msg) => msg.id !== id));

      if (id.startsWith("pending-")) return;

      const { error } = await supabase.from("community_messages").delete().eq("id", id);
      if (error) {
        toast({ title: "Erreur lors de la suppression", description: error.message, variant: "destructive" });
        // Re-fetch if deletion failed on backend
        fetchMessages();
      } else {
        toast({ title: "Message supprimé" });
      }
    },
    [fetchMessages, toast],
  );

  const visibleMessages = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return messages;
    return messages.filter(
      (message) =>
        message.content.toLowerCase().includes(term) ||
        message.profile?.full_name?.toLowerCase().includes(term),
    );
  }, [messages, searchTerm]);

  const setReply = useCallback((message: ChatMessage) => {
    setReplyTo({
      id: message.id,
      name: message.profile?.full_name || "Membre",
      preview: message.content.length > 120 ? `${message.content.slice(0, 120)}…` : message.content,
    });
  }, []);

  const insertEmoji = useCallback((emoji: string) => {
    setContent((prev) => `${prev}${emoji}`);
  }, []);

  const loadMoreOlder = useCallback(() => {
    setMessageLimit((prev) => prev + 30);
    setStickToBottom(false);
  }, []);

  const hasMoreOlder = useMemo(() => {
    return messages.length >= messageLimit;
  }, [messages.length, messageLimit]);

  return {
    messages,
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
    loadMoreOlder,
    hasMoreOlder,
  };
}
