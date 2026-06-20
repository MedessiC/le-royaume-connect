import { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ChevronDown, LogOut, Shield, Settings, User as UserIcon, Heart, Bell, Sun, Moon } from "lucide-react";
import ReactCountryFlag from "react-country-flag";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useTranslation } from "@/i18n";
import BottomNav from "@/components/BottomNav";
import NotificationBell from "@/components/NotificationBell";
import SearchBar from "@/components/SearchBar";
import UserAvatar from "@/components/UserAvatar";
import useTheme from "@/hooks/useTheme";

const Navbar = () => {
  const { user, profile, isAdmin, signOut } = useAuth();
  const { t, locale, setLocale } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const [pageLoading, setPageLoading] = useState(false);
  const [languageOpen, setLanguageOpen] = useState(false);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [notifications, setNotifications] = useState<{
    id: string;
    title: string;
    message: string;
    createdAt: string;
    read: boolean;
    href?: string;
  }[]>([]);
  const [notifNews, setNotifNews] = useState(false);
  const [notifReply, setNotifReply] = useState(false);
  const unreadCount = useMemo(() => notifications.filter((notification) => !notification.read).length, [notifications]);

  const { theme, resolvedTheme, toggle } = useTheme();

  const notificationStorageKey = user ? `millenium-notifications-${user.id}` : "millenium-notifications";

  const addNotification = (notification: { title: string; message: string; href?: string }) => {
    setNotifications((prevNotifications) => {
      const nextNotifications = [
        {
          id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
          title: notification.title,
          message: notification.message,
          href: notification.href,
          createdAt: new Date().toISOString(),
          read: false,
        },
        ...prevNotifications,
      ].slice(0, 16);
      if (notificationStorageKey) {
        try {
          window.localStorage.setItem(notificationStorageKey, JSON.stringify(nextNotifications));
        } catch {
          // ignore storage failures
        }
      }
      return nextNotifications;
    });
  };

  const markAllRead = () => {
    setNotifications((prevNotifications) => {
      const nextNotifications = prevNotifications.map((notification) => ({ ...notification, read: true }));
      if (notificationStorageKey) {
        try {
          window.localStorage.setItem(notificationStorageKey, JSON.stringify(nextNotifications));
        } catch {
          // ignore storage failures
        }
      }
      return nextNotifications;
    });
  };

  useEffect(() => {
    if (pageLoading) {
      setPageLoading(false);
    }
  }, [location]);

  useEffect(() => {
    if (!user) {
      setNotifications([]);
      setNotifNews(false);
      setNotifReply(false);
      return;
    }

    try {
      const stored = window.localStorage.getItem(notificationStorageKey);
      if (stored) {
        setNotifications(JSON.parse(stored));
      }
    } catch {
      // ignore parse errors
    }

    supabase
      .from("profiles")
      .select("notif_news, notif_reply")
      .eq("id", user.id)
      .maybeSingle()
      .then(({ data }) => {
        if (data) {
          setNotifNews(!!data.notif_news);
          setNotifReply(!!data.notif_reply);
        }
      });
  }, [user, notificationStorageKey]);

  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel("community-notifications")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "community_messages" }, async (payload) => {
        const message = payload.new;
        if (!message || message.user_id === user.id) return;

        if (message.parent_id && notifReply) {
          const { data: parentMessage } = await supabase
            .from("community_messages")
            .select("user_id, content")
            .eq("id", message.parent_id)
            .maybeSingle();

          if (parentMessage?.user_id === user.id) {
            addNotification({
              title: "Nouvelle réponse",
              message: `${message.content.slice(0, 80)}${message.content.length > 80 ? "..." : ""}`,
              href: "/community",
            });
            return;
          }
        }

        if (notifNews) {
          addNotification({
            title: "Nouveau message",
            message: `${message.content.slice(0, 80)}${message.content.length > 80 ? "..." : ""}`,
            href: "/community",
          });
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel).catch(() => {});
    };
  }, [user, notifNews, notifReply]);

  const handleNavClick = () => setPageLoading(true);

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  const translatePage = (lang: "fr" | "en" | "es" | "zh") => {
    setLocale(lang);
    setLanguageOpen(false);
  };

  const languages = [
    { code: "fr", name: "Français", countryCode: "FR" },
    { code: "en", name: "English", countryCode: "GB" },
    { code: "es", name: "Español", countryCode: "ES" },
    { code: "zh", name: "中文", countryCode: "CN" },
  ];

  const navLinks = (
    <>
      <Link to="/" onClick={handleNavClick} className="text-sm text-foreground/80 hover:text-gold transition-colors">
        {t("nav.home")}
      </Link>
      <Link to="/feed" onClick={handleNavClick} className="text-sm text-foreground/80 hover:text-gold transition-colors">{t("nav.feed")}</Link>
      <Link to="/community" onClick={handleNavClick} className="text-sm text-foreground/80 hover:text-gold transition-colors">{t("nav.community")}</Link>
      <Link to="/about" onClick={handleNavClick} className="text-sm text-foreground/80 hover:text-gold transition-colors">{t("nav.about")}</Link>
      <Link to="/donate" onClick={handleNavClick} className="text-sm text-foreground/80 hover:text-gold transition-colors inline-flex items-center gap-1">
        <Heart className="w-4 h-4" /> {t("nav.donate")}
      </Link>
    </>
  );

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 relative bg-popover/95 backdrop-blur-xl border-b border-border shadow-2xl">
        {pageLoading && <div className="absolute inset-x-0 top-0 h-1 bg-gold animate-pulse" />}
        <div className="w-full flex items-center justify-between h-14 sm:h-16 px-3 sm:px-4 md:px-6">
          <Link to="/" onClick={handleNavClick} className="flex items-center gap-2 flex-shrink-0">
            <span className="font-display text-base sm:text-lg font-bold tracking-[0.18em] text-gold">MILLENIUM</span>
          </Link>

          <div className="flex items-center gap-1 sm:gap-2 md:hidden ml-auto">
            <button
              type="button"
              onClick={toggle}
              aria-label={resolvedTheme === "dark" ? t("common.lightMode") : t("common.darkMode")}
              className="inline-flex items-center justify-center h-10 w-10 rounded-full border border-gold/30 bg-card/90 text-foreground transition hover:border-gold hover:text-gold"
            >
              {resolvedTheme === "dark" ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>

            {user && (<> 
              <Popover onOpenChange={(open) => {
                setNotificationOpen(open);
                if (open) markAllRead();
              }}>
                <PopoverTrigger asChild>
                  <button type="button" className="relative inline-flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-full border border-gold/30 bg-card/90 text-foreground transition hover:border-gold hover:text-gold flex-shrink-0">
                    <Bell className="w-4 h-4 sm:w-5 sm:h-5" />
                    {unreadCount > 0 && (
                      <span className="absolute -right-1 -top-1 inline-flex h-4 sm:h-5 min-w-[1rem] sm:min-w-[1.25rem] items-center justify-center rounded-full bg-gold px-1 sm:px-1.5 text-[8px] sm:text-[10px] font-semibold text-slate-950">
                        {unreadCount}
                      </span>
                    )}
                  </button>
                </PopoverTrigger>
                <PopoverContent className="w-64 sm:w-72">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-semibold">Notifications</p>
                      <button type="button" onClick={markAllRead} className="text-xs text-muted-foreground hover:text-foreground">Tout lire</button>
                    </div>
                    {notifications.length === 0 ? (
                      <p className="text-sm text-muted-foreground">Aucune notification.</p>
                    ) : (
                      notifications.map((notification) => (
                        <Link
                          key={notification.id}
                          to={notification.href ?? "/community"}
                          onClick={() => setNotificationOpen(false)}
                          className="block rounded-2xl border border-border bg-card p-3 text-sm text-foreground transition hover:border-gold/30"
                        >
                          <div className="flex items-center justify-between gap-2">
                            <p className="font-semibold text-foreground">{notification.title}</p>
                            <span className="text-[11px] text-muted-foreground">{new Date(notification.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                          </div>
                          <p className="mt-1 text-muted-foreground line-clamp-2">{notification.message}</p>
                        </Link>
                      ))
                    )}
                  </div>
                </PopoverContent>
                </Popover>
              </>
            )}
            {!user && (
              <Link to="/auth" onClick={handleNavClick} className="rounded-full border border-gold/30 bg-gold/10 px-2 sm:px-3 py-1.5 sm:py-2 text-[10px] sm:text-xs font-semibold uppercase tracking-[0.12em] sm:tracking-[0.16em] text-gold transition hover:bg-gold/20 flex-shrink-0">
                {t("nav.login")}
              </Link>
            )}
            <div className="relative flex-shrink-0">
              <button
                type="button"
                onClick={() => setLanguageOpen((prev) => !prev)}
                className="inline-flex items-center gap-1 sm:gap-2 rounded-full border border-gold/30 bg-card/90 px-2 sm:px-3 py-1.5 sm:py-2 text-[10px] sm:text-xs font-semibold uppercase tracking-[0.12em] sm:tracking-[0.16em] text-foreground transition hover:border-gold hover:text-gold"
                aria-expanded={languageOpen}
                aria-label={t("common.changeLanguage")}
              >
                <ReactCountryFlag svg countryCode={languages.find((lang) => lang.code === locale)?.countryCode || "FR"} style={{ width: "14px", height: "14px" }} />
                <span className="hidden xs:inline">{locale.toUpperCase()}</span>
                <ChevronDown className="w-3 h-3" />
              </button>
              {languageOpen && (
              <div className="absolute right-0 mt-2 w-40 z-10 overflow-hidden rounded-3xl border border-border bg-popover/95 shadow-2xl backdrop-blur-xl">
                  {languages.map((lang) => (
                    <button
                      key={lang.code}
                      type="button"
                      onClick={() => {
                        translatePage(lang.code);
                      }}
                      className="flex w-full items-center gap-2 px-3 py-2 text-left text-xs sm:text-sm text-foreground transition hover:bg-gold/10"
                    >
                      <ReactCountryFlag svg countryCode={lang.countryCode} style={{ width: "16px", height: "16px" }} />
                      <span>{lang.name}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Desktop */}
          <div className="hidden md:flex items-center gap-6">
            {navLinks}
            <button
              type="button"
              onClick={toggle}
              aria-label={resolvedTheme === "dark" ? t("common.lightMode") : t("common.darkMode")}
              className="inline-flex items-center justify-center h-10 w-10 rounded-full border border-gold/30 bg-card/90 text-foreground transition hover:border-gold hover:text-gold"
            >
              {resolvedTheme === "dark" ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
            <div className="relative">
              <button
                type="button"
                onClick={() => setLanguageOpen((prev) => !prev)}
                className="inline-flex items-center gap-2 rounded-full border border-gold/30 bg-card/90 px-3 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-foreground transition hover:border-gold hover:text-gold"
                aria-expanded={languageOpen}
                aria-label={t("common.changeLanguage")}
              >
                <ReactCountryFlag svg countryCode={languages.find((lang) => lang.code === locale)?.countryCode || "FR"} style={{ width: "18px", height: "18px" }} />
                <span>{locale.toUpperCase()}</span>
                <ChevronDown className="w-3.5 h-3.5" />
              </button>
              {languageOpen && (
                <div className="absolute right-0 mt-2 w-40 z-10 overflow-hidden rounded-3xl border border-border bg-popover/95 shadow-2xl backdrop-blur-xl">
                  {languages.map((lang) => (
                    <button
                      key={lang.code}
                      type="button"
                      onClick={() => {
                        translatePage(lang.code);
                      }}
                      className="flex w-full items-center gap-2 px-3 py-2 text-left text-xs sm:text-sm text-foreground transition hover:bg-gold/10"
                    >
                      <ReactCountryFlag svg countryCode={lang.countryCode} style={{ width: "16px", height: "16px" }} />
                      <span>{lang.name}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
            {user ? (
              <>
                <Popover onOpenChange={(open) => {
                  setNotificationOpen(open);
                  if (open) markAllRead();
                }}>
                  <PopoverTrigger asChild>
                    <button type="button" className="relative inline-flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-full border border-gold/30 bg-card/90 text-foreground transition hover:border-gold hover:text-gold">
                      <Bell className="w-4 h-4 sm:w-5 sm:h-5" />
                      {unreadCount > 0 && (
                        <span className="absolute -right-1 -top-1 inline-flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-gold px-1.5 text-[10px] font-semibold text-slate-950">
                          {unreadCount}
                        </span>
                      )}
                    </button>
                  </PopoverTrigger>
                  <PopoverContent className="w-72 sm:w-80">
                    <div className="space-y-2 sm:space-y-3">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-semibold">Notifications</p>
                        <button type="button" onClick={markAllRead} className="text-xs text-muted-foreground hover:text-foreground">Tout lire</button>
                      </div>
                      {notifications.length === 0 ? (
                        <p className="text-sm text-muted-foreground">Aucune notification.</p>
                      ) : (
                        notifications.map((notification) => (
                          <Link
                            key={notification.id}
                            to={notification.href ?? "/community"}
                            onClick={() => setNotificationOpen(false)}
                            className="block rounded-2xl border border-border bg-card p-3 text-sm text-foreground transition hover:border-gold/30"
                          >
                            <div className="flex items-center justify-between gap-2">
                              <p className="font-semibold text-foreground">{notification.title}</p>
                              <span className="text-[11px] text-muted-foreground">{new Date(notification.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                            </div>
                            <p className="mt-1 text-muted-foreground line-clamp-2">{notification.message}</p>
                          </Link>
                        ))
                      )}
                    </div>
                  </PopoverContent>
                </Popover>
                <div className="flex items-center gap-3">
                  <Link to="/account" onClick={handleNavClick} className="text-sm text-foreground/80 hover:text-gold transition-colors inline-flex items-center gap-1">
                    <Settings className="w-4 h-4" /> {t("nav.settings")}
                  </Link>
                  {isAdmin && (
                    <Link to="/admin" className="text-sm text-gold hover:opacity-80 inline-flex items-center gap-1">
                      <Shield className="w-4 h-4" /> {t("nav.admin")}
                    </Link>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <Link to="/account" onClick={handleNavClick}>
                    <Button variant="hero-outline" size="sm" className="inline-flex items-center gap-2">
                      {profile?.avatar_url ? (
                        <UserAvatar
                          src={profile.avatar_url}
                          name={profile.full_name || user?.email || "Utilisateur"}
                          className="w-4 h-4"
                        />
                      ) : (
                        <UserIcon className="w-4 h-4" />
                      )}
                      {t("nav.account")}
                    </Button>
                  </Link>
                  <Button variant="ghost" size="icon" onClick={handleSignOut} aria-label={t("nav.logout")} className="text-foreground/80 hover:text-gold">
                    <LogOut className="w-4 h-4" />
                  </Button>
                </div>
              </>
            ) : (
              <Link to="/auth" onClick={handleNavClick} className="rounded-full border border-gold/30 bg-gold/10 px-3 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-gold transition hover:bg-gold/20">
                {t("nav.login")}
              </Link>
            )}
          </div>
        </div>
      </nav>
      <BottomNav />
    </>
  );
};

export default Navbar;
