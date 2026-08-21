import { useEffect, useState, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import {
  ArrowLeft, Bell, Trash2, CheckCircle2, Check,
  MessageSquare, Heart, UserPlus, BookOpen, Reply, Filter
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

type FilterType = "all" | "unread" | "teaching" | "comments";

const NotificationsPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterType>("all");

  useEffect(() => {
    document.title = "Notifications – MILLENIUM";
    if (!user) navigate("/auth");
    loadNotifications();
  }, [user]);

  const loadNotifications = async () => {
    if (!user) return;
    const { data } = await supabase
      .from("notifications")
      .select(`
        *,
        actor:actor_id(id, full_name, avatar_url)
      `)
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    setNotifications((data || []) as NotificationItem[]);
    setLoading(false);
  };

  const markAsRead = async (notifId: string) => {
    await supabase.from("notifications").update({ read: true }).eq("id", notifId);
    setNotifications((prev) =>
      prev.map((n) => (n.id === notifId ? { ...n, read: true } : n))
    );
  };

  const markAllAsRead = async () => {
    if (!user) return;
    await supabase
      .from("notifications")
      .update({ read: true })
      .eq("user_id", user.id)
      .eq("read", false);
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    toast({ title: "Toutes les notifications ont été marquées comme lues" });
  };

  const deleteNotification = async (notifId: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    await supabase.from("notifications").delete().eq("id", notifId);
    setNotifications((prev) => prev.filter((n) => n.id !== notifId));
    toast({ title: "Notification supprimée" });
  };

  const deleteAll = async () => {
    if (!user || !confirm("Supprimer l'intégralité de l'historique de vos notifications ?")) return;
    await supabase.from("notifications").delete().eq("user_id", user.id);
    setNotifications([]);
    toast({ title: "Historique supprimé" });
  };

  const filteredNotifs = useMemo(() => {
    return notifications.filter((n) => {
      if (filter === "unread") return !n.read;
      if (filter === "teaching") return n.type === "teaching";
      if (filter === "comments") return ["comment", "reply", "like"].includes(n.type);
      return true;
    });
  }, [notifications, filter]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const getTypeBadge = (type: string) => {
    switch (type) {
      case "comment":
        return { label: "Commentaire", icon: MessageSquare, class: "bg-blue-500/10 text-blue-500 border-blue-500/30" };
      case "like":
        return { label: "J'aime", icon: Heart, class: "bg-rose-500/10 text-rose-500 border-rose-500/30" };
      case "follow":
        return { label: "Abonné", icon: UserPlus, class: "bg-emerald-500/10 text-emerald-500 border-emerald-500/30" };
      case "teaching":
        return { label: "Enseignement", icon: BookOpen, class: "bg-gold/10 text-gold border-gold/30" };
      case "reply":
        return { label: "Réponse", icon: Reply, class: "bg-indigo-500/10 text-indigo-500 border-indigo-500/30" };
      default:
        return { label: "Alerte", icon: Bell, class: "bg-muted text-muted-foreground border-border" };
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-background font-body">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <p className="text-muted-foreground text-sm font-medium">Chargement de vos notifications…</p>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground font-body">
      <Navbar />

      <main className="flex-1 max-w-3xl mx-auto w-full px-4 py-8 sm:py-12">

        {/* Top Header */}
        <div className="mb-8 space-y-4">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-gold transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Retour</span>
          </Link>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl sm:text-4xl font-display font-extrabold tracking-tight">
                  Vos <span className="text-gradient-gold">Notifications</span>
                </h1>
                {unreadCount > 0 && (
                  <Badge className="bg-gold text-slate-950 font-extrabold text-xs">
                    {unreadCount} non lue{unreadCount > 1 ? "s" : ""}
                  </Badge>
                )}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Suivez les réactions à vos commentaires, les nouveaux enseignements et l'activité de la communauté.
              </p>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 flex-wrap">
              {unreadCount > 0 && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={markAllAsRead}
                  className="rounded-2xl h-9 text-xs font-bold gap-1.5"
                >
                  <CheckCircle2 className="w-3.5 h-3.5 text-gold" />
                  Tout marquer comme lu
                </Button>
              )}
              {notifications.length > 0 && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={deleteAll}
                  className="rounded-2xl h-9 text-xs font-bold gap-1.5 text-destructive hover:bg-destructive/10"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Effacer l'historique
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex gap-2 overflow-x-auto pb-4 mb-4 scrollbar-none border-b border-border/50">
          {[
            { id: "all", label: `Toutes (${notifications.length})` },
            { id: "unread", label: `Non lues (${unreadCount})` },
            { id: "teaching", label: "Enseignements" },
            { id: "comments", label: "Commentaires & J'aime" },
          ].map((f) => (
            <button
              key={f.id}
              type="button"
              onClick={() => setFilter(f.id as FilterType)}
              className={`px-3.5 py-1.5 rounded-2xl text-xs font-bold transition-all shrink-0 ${
                filter === f.id
                  ? "bg-gold text-slate-950 shadow-gold"
                  : "bg-card border border-border/60 text-muted-foreground hover:text-foreground hover:bg-secondary"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Notifications List */}
        <div className="space-y-3">
          {filteredNotifs.length === 0 ? (
            <Card className="border-border/60 bg-card p-10 text-center rounded-3xl">
              <div className="w-12 h-12 rounded-2xl bg-muted/60 flex items-center justify-center mx-auto text-muted-foreground mb-3">
                <Bell className="w-6 h-6 opacity-40" />
              </div>
              <h3 className="font-display text-base font-bold">Aucune notification trouvée</h3>
              <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
                {filter === "unread"
                  ? "Toutes vos notifications sont lues."
                  : "Aucune alerte n'a été enregistrée pour le moment."}
              </p>
            </Card>
          ) : (
            filteredNotifs.map((notif) => {
              const badgeInfo = getTypeBadge(notif.type);
              const BadgeIcon = badgeInfo.icon;
              return (
                <Card
                  key={notif.id}
                  onClick={() => markAsRead(notif.id)}
                  className={`border transition-all duration-200 rounded-3xl overflow-hidden ${
                    !notif.read
                      ? "border-gold/30 bg-gold/5 shadow-sm hover:border-gold/50"
                      : "border-border/60 bg-card hover:border-border"
                  }`}
                >
                  <CardContent className="p-4 sm:p-5 flex items-start gap-4">
                    {/* Actor avatar */}
                    <div className="relative shrink-0">
                      {notif.actor?.avatar_url ? (
                        <img
                          src={notif.actor.avatar_url}
                          alt=""
                          className="w-11 h-11 rounded-2xl object-cover border border-border"
                        />
                      ) : (
                        <div className="w-11 h-11 rounded-2xl bg-secondary flex items-center justify-center text-foreground font-bold text-sm border border-border">
                          <BadgeIcon className="w-5 h-5 text-gold" />
                        </div>
                      )}
                      <span className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-background border border-border flex items-center justify-center shadow-xs">
                        <BadgeIcon className="w-3 h-3 text-gold" />
                      </span>
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <Badge className={`text-[10px] font-extrabold border ${badgeInfo.class}`}>
                          {badgeInfo.label}
                        </Badge>
                        <span className="text-[11px] text-muted-foreground">
                          {new Date(notif.created_at).toLocaleDateString("fr-FR", {
                            day: "numeric",
                            month: "short",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>

                      <h4 className={`text-sm leading-snug ${!notif.read ? "font-extrabold text-foreground" : "font-semibold text-foreground/90"}`}>
                        {notif.title}
                      </h4>

                      {notif.message && (
                        <p className="text-xs text-muted-foreground mt-1 leading-relaxed line-clamp-2">
                          {notif.message}
                        </p>
                      )}

                      {notif.href && (
                        <Link
                          to={notif.href}
                          className="inline-flex items-center gap-1 text-xs font-bold text-gold hover:underline mt-2.5"
                        >
                          <span>Voir le contenu</span>
                          <ArrowLeft className="w-3 h-3 rotate-180" />
                        </Link>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1 shrink-0">
                      {!notif.read && (
                        <button
                          type="button"
                          title="Marquer comme lu"
                          onClick={(e) => {
                            e.stopPropagation();
                            markAsRead(notif.id);
                          }}
                          className="p-2 rounded-xl text-muted-foreground hover:text-gold hover:bg-gold/10 transition-colors"
                        >
                          <Check className="w-4 h-4" />
                        </button>
                      )}
                      <button
                        type="button"
                        title="Supprimer"
                        onClick={(e) => deleteNotification(notif.id, e)}
                        className="p-2 rounded-xl text-muted-foreground/60 hover:text-destructive hover:bg-destructive/10 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>

      </main>
      <Footer />
    </div>
  );
};

export default NotificationsPage;
