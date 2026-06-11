import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Bell, Trash2, CheckCircle2, Circle } from "lucide-react";

type Notification = {
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

const NotificationsPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) navigate("/auth");
    loadNotifications();
  }, [user]);

  const loadNotifications = async () => {
    if (!user) return;
    const { data } = await supabase
      .from("notifications")
      .select(
        `
        *,
        actor:actor_id(id, full_name, avatar_url)
      `
      )
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    setNotifications((data || []) as Notification[]);
    setLoading(false);
  };

  const markAsRead = async (notifId: string) => {
    await supabase
      .from("notifications")
      .update({ read: true })
      .eq("id", notifId);
    setNotifications((prev) =>
      prev.map((n) => (n.id === notifId ? { ...n, read: true } : n))
    );
  };

  const markAllAsRead = async () => {
    await supabase
      .from("notifications")
      .update({ read: true })
      .eq("user_id", user!.id)
      .eq("read", false);
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    toast({ title: "Toutes les notifications marquées comme lues" });
  };

  const deleteNotification = async (notifId: string) => {
    await supabase.from("notifications").delete().eq("id", notifId);
    setNotifications((prev) => prev.filter((n) => n.id !== notifId));
    toast({ title: "Notification supprimée" });
  };

  const deleteAll = async () => {
    await supabase
      .from("notifications")
      .delete()
      .eq("user_id", user!.id);
    setNotifications([]);
    toast({ title: "Toutes les notifications supprimées" });
  };

  const getNotificationIcon = (type: string) => {
    const icons: Record<string, string> = {
      comment: "💬",
      like: "❤️",
      follow: "👤",
      teaching: "📖",
      reply: "↩️",
      mention: "📌",
    };
    return icons[type] || "🔔";
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <p className="text-muted-foreground">Chargement...</p>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      <main className="flex-1 max-w-2xl mx-auto w-full px-4 py-8 md:py-12">
        {/* Header */}
        <div className="mb-8 space-y-4">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-gold transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Retour
          </Link>

          <div className="flex items-center justify-between gap-4">
            <div>
              <h1 className="text-4xl md:text-5xl font-display text-gold">
                Notifications
              </h1>
              {unreadCount > 0 && (
                <Badge className="mt-2 bg-gold text-background">
                  {unreadCount} non lue{unreadCount > 1 ? "s" : ""}
                </Badge>
              )}
            </div>
            <div className="flex gap-2">
              {unreadCount > 0 && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={markAllAsRead}
                  className="gap-2"
                >
                  <CheckCircle2 className="w-4 h-4" /> Tout marquer comme lu
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Notifications List */}
        {notifications.length === 0 ? (
          <Card className="border-gold/20 text-center p-12">
            <Bell className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
            <h2 className="text-lg font-semibold text-foreground mb-2">
              Pas de notifications
            </h2>
            <p className="text-muted-foreground">
              Vous êtes à jour! Revenez plus tard pour les nouveautés.
            </p>
          </Card>
        ) : (
          <div className="space-y-3">
            {notifications.map((notif) => (
              <Card
                key={notif.id}
                className={`border-gold/20 transition-all hover:border-gold/40 cursor-pointer ${
                  !notif.read ? "bg-gold/5" : ""
                }`}
                onClick={() => notif.href && navigate(notif.href)}
              >
                <CardContent className="pt-6 pb-6">
                  <div className="flex items-start gap-4">
                    {/* Icon */}
                    <div className="text-2xl mt-1">
                      {getNotificationIcon(notif.type)}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <h3 className="font-semibold text-foreground flex items-center gap-2">
                            {notif.title}
                            {!notif.read && (
                              <Circle className="w-2 h-2 fill-gold text-gold" />
                            )}
                          </h3>
                          {notif.message && (
                            <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                              {notif.message}
                            </p>
                          )}
                          <p className="text-xs text-muted-foreground mt-2">
                            {new Date(notif.created_at).toLocaleDateString(
                              "fr-FR",
                              {
                                day: "numeric",
                                month: "long",
                                year: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              }
                            )}
                          </p>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-2">
                          {!notif.read && (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={(e) => {
                                e.stopPropagation();
                                markAsRead(notif.id);
                              }}
                              className="h-8 w-8 p-0"
                            >
                              <CheckCircle2 className="w-4 h-4 text-gold" />
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteNotification(notif.id);
                            }}
                            className="h-8 w-8 p-0"
                          >
                            <Trash2 className="w-4 h-4 text-destructive" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}

            {/* Delete All Button */}
            {notifications.length > 0 && (
              <div className="flex justify-center pt-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={deleteAll}
                  className="text-destructive hover:text-destructive"
                >
                  Supprimer tout
                </Button>
              </div>
            )}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default NotificationsPage;
