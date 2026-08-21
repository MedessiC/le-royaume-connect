import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import {
  Bell, ArrowRight, CheckCheck, MessageSquare, Heart,
  UserPlus, BookOpen, Reply, X, Check
} from "lucide-react";

type NotificationItem = {
  id: string;
  type: string;
  title: string;
  message?: string;
  href?: string;
  read: boolean;
  created_at: string;
  actor_id?: string;
  actor?: { full_name?: string; avatar_url?: string } | null;
};

const NotificationBell = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!user) return;

    let isMounted = true;

    loadNotifications();

    const topicPrefix = `user-notifications:${user.id}`;

    // Nettoyage défensif : supabase.removeChannel() est ASYNCHRONE en interne
    // (il attend la résolution de unsubscribe() avant de retirer le channel
    // de sa liste). Si cet effet se redéclenche avant que le cleanup du
    // montage précédent ait fini (StrictMode, ou `user` qui change de
    // référence à chaque render), supabase.channel(topic) risque de
    // RÉUTILISER un channel déjà subscribed portant le même topic, d'où
    // l'erreur "cannot add postgres_changes callbacks after subscribe()".
    // On force donc la suppression de tout channel résiduel avant de
    // recréer, ET on utilise un suffixe unique par montage pour ne jamais
    // dépendre d'un timing de nettoyage.
    supabase
      .getChannels()
      .filter((c) => c.topic === `realtime:${topicPrefix}` || c.topic.startsWith(`realtime:${topicPrefix}:`))
      .forEach((c) => {
        supabase.removeChannel(c);
      });

    const channel = supabase
      .channel(`${topicPrefix}:${crypto.randomUUID()}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          if (!isMounted) return;
          const newNotif = payload.new as NotificationItem;
          toast({
            title: newNotif.title,
            description: newNotif.message || undefined,
          });
          loadNotifications();
        }
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${user.id}`,
        },
        () => {
          if (isMounted) loadNotifications();
        }
      )
      .subscribe((status) => {
        if (status === "SUBSCRIBED" && isMounted) {
          loadNotifications();
        }
        if (status === "CHANNEL_ERROR" || status === "TIMED_OUT") {
          console.warn("Realtime notification channel failed to subscribe", user.id, status);
        }
      });

    return () => {
      isMounted = false;
      supabase.removeChannel(channel);
    };
  }, [user]);

  const loadNotifications = async () => {
    if (!user) return;

    try {
      const { data } = await supabase
        .from("notifications")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(8);

      const { count } = await supabase
        .from("notifications")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id)
        .eq("read", false);

      setNotifications((data || []) as NotificationItem[]);
      setUnreadCount(count || 0);
    } catch (error) {
      console.warn("Failed to load notifications", error);
      setNotifications([]);
      setUnreadCount(0);
    }
  };

  const markAsRead = async (notifId: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    await supabase.from("notifications").update({ read: true }).eq("id", notifId);
    setNotifications((prev) =>
      prev.map((n) => (n.id === notifId ? { ...n, read: true } : n))
    );
    setUnreadCount((c) => Math.max(0, c - 1));
  };

  const markAllAsRead = async () => {
    if (!user) return;
    await supabase
      .from("notifications")
      .update({ read: true })
      .eq("user_id", user.id)
      .eq("read", false);

    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    setUnreadCount(0);
    toast({ title: "Toutes les notifications marquées comme lues" });
  };

  if (!user) return null;

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "comment": return <MessageSquare className="w-3.5 h-3.5 text-blue-500" />;
      case "like": return <Heart className="w-3.5 h-3.5 text-rose-500" />;
      case "follow": return <UserPlus className="w-3.5 h-3.5 text-emerald-500" />;
      case "teaching": return <BookOpen className="w-3.5 h-3.5 text-gold" />;
      case "reply": return <Reply className="w-3.5 h-3.5 text-indigo-500" />;
      default: return <Bell className="w-3.5 h-3.5 text-gold" />;
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative h-10 w-10 rounded-2xl hover:bg-gold/10 transition-all"
          aria-label="Notifications"
        >
          <Bell className="w-5 h-5 text-foreground/80" />
          {unreadCount > 0 && (
            <span className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-gold text-[10px] font-extrabold text-slate-950 shadow-gold animate-pulse">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>

      <PopoverContent className="w-80 sm:w-96 p-0 rounded-3xl border border-border/70 shadow-2xl overflow-hidden font-body" align="end">

        {/* Header */}
        <div className="flex items-center justify-between border-b border-border/60 bg-muted/30 px-4 py-3">
          <div className="flex items-center gap-2">
            <h3 className="font-display font-extrabold text-sm text-foreground">Notifications</h3>
            {unreadCount > 0 && (
              <Badge className="bg-gold/20 text-gold border border-gold/30 text-[10px] font-extrabold px-2 py-0.5">
                {unreadCount} nouvelle{unreadCount > 1 ? "s" : ""}
              </Badge>
            )}
          </div>
          {unreadCount > 0 && (
            <button
              type="button"
              onClick={markAllAsRead}
              className="inline-flex items-center gap-1 text-[11px] font-semibold text-gold hover:underline transition-all"
            >
              <CheckCheck className="w-3.5 h-3.5" />
              Tout marquer comme lu
            </button>
          )}
        </div>

        {/* List */}
        <div className="max-h-[380px] overflow-y-auto divide-y divide-border/40">
          {notifications.length === 0 ? (
            <div className="p-8 text-center space-y-2">
              <div className="w-10 h-10 rounded-2xl bg-muted/60 flex items-center justify-center mx-auto text-muted-foreground">
                <Bell className="w-5 h-5 opacity-40" />
              </div>
              <p className="text-xs font-semibold text-foreground">Aucune notification</p>
              <p className="text-[11px] text-muted-foreground">Vous êtes à jour ! Vous recevrez des alertes ici lors des interactions.</p>
            </div>
          ) : (
            notifications.map((notif) => (
              <Link
                key={notif.id}
                to={notif.href || "/notifications"}
                onClick={() => setOpen(false)}
                className={`group flex items-start gap-3 p-3.5 transition-colors relative ${
                  !notif.read ? "bg-gold/5 hover:bg-gold/10" : "hover:bg-muted/40"
                }`}
              >
                {/* Type icon / Actor Avatar */}
                <div className="relative shrink-0 mt-0.5">
                  {notif.actor?.avatar_url ? (
                    <img src={notif.actor.avatar_url} alt="" className="w-9 h-9 rounded-xl object-cover border border-border/60" />
                  ) : (
                    <div className="w-9 h-9 rounded-xl bg-secondary flex items-center justify-center font-bold text-xs border border-border/60">
                      {getTypeIcon(notif.type)}
                    </div>
                  )}
                  <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-background border border-border flex items-center justify-center shadow-xs">
                    {getTypeIcon(notif.type)}
                  </span>
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0 pr-4">
                  <p className={`text-xs leading-snug truncate ${!notif.read ? "font-bold text-foreground" : "font-medium text-foreground/80"}`}>
                    {notif.title}
                  </p>
                  {notif.message && (
                    <p className="text-[11px] text-muted-foreground line-clamp-2 mt-0.5 leading-relaxed">
                      {notif.message}
                    </p>
                  )}
                  <span className="text-[10px] text-muted-foreground/60 mt-1 block">
                    {new Date(notif.created_at).toLocaleDateString("fr-FR", {
                      hour: "2-digit",
                      minute: "2-digit",
                      day: "numeric",
                      month: "short"
                    })}
                  </span>
                </div>

                {/* Unread dot / Mark read button */}
                {!notif.read && (
                  <button
                    type="button"
                    title="Marquer comme lu"
                    onClick={(e) => markAsRead(notif.id, e)}
                    className="absolute right-3 top-3.5 w-5 h-5 rounded-full bg-gold/20 hover:bg-gold hover:text-slate-950 flex items-center justify-center text-gold transition-all"
                  >
                    <Check className="w-3 h-3" />
                  </button>
                )}
              </Link>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-border/60 bg-muted/20 p-2 text-center">
          <Link
            to="/notifications"
            onClick={() => setOpen(false)}
            className="inline-flex items-center justify-center gap-1.5 w-full py-2 rounded-2xl text-xs font-bold text-gold hover:bg-gold/10 transition-colors"
          >
            <span>Voir toutes les notifications</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

      </PopoverContent>
    </Popover>
  );
};

export default NotificationBell;