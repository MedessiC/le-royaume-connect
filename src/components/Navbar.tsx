import { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ChevronDown, LogOut, Shield, Settings, User as UserIcon, Heart, Bell, Sun, Moon, Search as SearchIcon } from "lucide-react";
import ReactCountryFlag from "react-country-flag";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useTranslation } from "@/i18n";
import BottomNav from "@/components/BottomNav";
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
  const [scrolled, setScrolled] = useState(false);
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
  const unreadCount = useMemo(() => notifications.filter((n) => !n.read).length, [notifications]);

  const { resolvedTheme, toggle } = useTheme();

  const notificationStorageKey = user ? `millenium-notifications-${user.id}` : "millenium-notifications";

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 16);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const addNotification = (notification: { title: string; message: string; href?: string }) => {
    setNotifications((prev) => {
      const next = [
        {
          id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
          title: notification.title,
          message: notification.message,
          href: notification.href,
          createdAt: new Date().toISOString(),
          read: false,
        },
        ...prev,
      ].slice(0, 16);
      if (notificationStorageKey) {
        try { window.localStorage.setItem(notificationStorageKey, JSON.stringify(next)); } catch {}
      }
      return next;
    });
  };

  const markAllRead = () => {
    setNotifications((prev) => {
      const next = prev.map((n) => ({ ...n, read: true }));
      if (notificationStorageKey) {
        try { window.localStorage.setItem(notificationStorageKey, JSON.stringify(next)); } catch {}
      }
      return next;
    });
  };

  useEffect(() => {
    if (pageLoading) setPageLoading(false);
  }, [location]);

  useEffect(() => {
    if (!user) { setNotifications([]); setNotifNews(false); setNotifReply(false); return; }
    try {
      const stored = window.localStorage.getItem(notificationStorageKey);
      if (stored) setNotifications(JSON.parse(stored));
    } catch {}
    supabase.from("profiles").select("notif_news, notif_reply").eq("id", user.id).maybeSingle().then(({ data }) => {
      if (data) { setNotifNews(!!data.notif_news); setNotifReply(!!data.notif_reply); }
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
          const { data: parentMessage } = await supabase.from("community_messages").select("user_id, content").eq("id", message.parent_id).maybeSingle();
          if (parentMessage?.user_id === user.id) {
            addNotification({ title: "Nouvelle réponse", message: `${message.content.slice(0, 80)}${message.content.length > 80 ? "..." : ""}`, href: "/community" });
            return;
          }
        }
        if (notifNews) {
          addNotification({ title: "Nouveau message", message: `${message.content.slice(0, 80)}${message.content.length > 80 ? "..." : ""}`, href: "/community" });
        }
      })
      .subscribe();
    return () => { supabase.removeChannel(channel).catch(() => {}); };
  }, [user, notifNews, notifReply]);

  const handleNavClick = () => setPageLoading(true);
  const handleSignOut = async () => { await signOut(); navigate("/"); };
  const translatePage = (lang: "fr" | "en" | "es" | "zh") => { setLocale(lang); setLanguageOpen(false); };

  const languages = [
    { code: "fr", name: "Français", countryCode: "FR" },
    { code: "en", name: "English", countryCode: "GB" },
    { code: "es", name: "Español", countryCode: "ES" },
    { code: "zh", name: "中文", countryCode: "CN" },
  ];

  const isActive = (path: string) => path === "/" ? location.pathname === "/" : location.pathname.startsWith(path);

  const navLinkClass = (path: string) =>
    `relative text-[0.825rem] font-semibold tracking-wide transition-colors duration-200 py-1 ${
      isActive(path)
        ? "text-gold nav-link-active"
        : "text-foreground/75 hover:text-foreground nav-link-hover"
    }`;

  const navLinks = (
    <>
      <Link to="/" onClick={handleNavClick} className={navLinkClass("/")}>
        {t("nav.home")}
      </Link>
      <Link to="/feed" onClick={handleNavClick} className={navLinkClass("/feed")}>{t("nav.feed")}</Link>
      <Link to="/community" onClick={handleNavClick} className={navLinkClass("/community")}>{t("nav.community")}</Link>
      <Link to="/about" onClick={handleNavClick} className={navLinkClass("/about")}>{t("nav.about")}</Link>
      <Link to="/donate" onClick={handleNavClick} className={`${navLinkClass("/donate")} inline-flex items-center gap-1.5`}>
        <Heart className="w-3.5 h-3.5" /> {t("nav.donate")}
      </Link>
    </>
  );

  const iconBtn = "inline-flex items-center justify-center h-9 w-9 rounded-xl border border-border/60 bg-card/60 text-foreground/75 transition-all duration-200 hover:border-gold/50 hover:text-gold hover:bg-gold/10";

  const langPicker = (
    <div className="relative">
      <button
        type="button"
        onClick={() => setLanguageOpen((prev) => !prev)}
        className={`${iconBtn} gap-1.5 w-auto px-2.5 text-[0.725rem] font-semibold tracking-wider uppercase`}
        aria-expanded={languageOpen}
        aria-label={t("common.changeLanguage")}
      >
        <ReactCountryFlag svg countryCode={languages.find((l) => l.code === locale)?.countryCode || "FR"} style={{ width: "14px", height: "14px" }} />
        <span>{locale.toUpperCase()}</span>
        <ChevronDown className={`w-3 h-3 transition-transform duration-200 ${languageOpen ? "rotate-180" : ""}`} />
      </button>
      {languageOpen && (
        <div className="absolute right-0 mt-2 w-40 z-50 overflow-hidden rounded-xl border border-border bg-popover/98 shadow-xl backdrop-blur-xl">
          {languages.map((lang) => (
            <button
              key={lang.code}
              type="button"
              onClick={() => translatePage(lang.code as "fr" | "en" | "es" | "zh")}
              className={`flex w-full items-center gap-2.5 px-3.5 py-2.5 text-left text-[0.8rem] transition-colors hover:bg-gold/10 ${locale === lang.code ? "text-gold font-bold" : "text-foreground/80"}`}
            >
              <ReactCountryFlag svg countryCode={lang.countryCode} style={{ width: "16px", height: "16px" }} />
              <span>{lang.name}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );

  const notifPopover = (
    <Popover onOpenChange={(open) => { setNotificationOpen(open); if (open) markAllRead(); }}>
      <PopoverTrigger asChild>
        <button type="button" className={`${iconBtn} relative`}>
          <Bell className="w-4 h-4" />
          {unreadCount > 0 && (
            <span className="absolute -right-1 -top-1 inline-flex h-4 min-w-[1rem] items-center justify-center rounded-full bg-gold px-1 text-[9px] font-bold text-slate-950">
              {unreadCount}
            </span>
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-72 sm:w-80 p-4" align="end">
        <div className="space-y-2.5">
          <div className="flex items-center justify-between mb-1">
            <p className="text-sm font-semibold">Notifications</p>
            <button type="button" onClick={markAllRead} className="text-xs text-muted-foreground hover:text-foreground transition-colors">Tout lire</button>
          </div>
          {notifications.length === 0 ? (
            <p className="text-sm text-muted-foreground py-2">Aucune notification.</p>
          ) : (
            notifications.map((n) => (
              <Link
                key={n.id}
                to={n.href ?? "/community"}
                onClick={() => setNotificationOpen(false)}
                className="block rounded-xl border border-border/70 bg-card p-3 text-sm transition-all hover:border-gold/30 hover:bg-gold/5"
              >
                <div className="flex items-center justify-between gap-2">
                  <p className="font-semibold text-foreground text-xs">{n.title}</p>
                  <span className="text-[10px] text-muted-foreground">{new Date(n.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                </div>
                <p className="mt-1 text-muted-foreground text-[0.75rem] line-clamp-2">{n.message}</p>
              </Link>
            ))
          )}
        </div>
      </PopoverContent>
    </Popover>
  );

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? "bg-background/95 backdrop-blur-xl border-b border-border/80 shadow-sm"
            : "bg-background/70 backdrop-blur-md border-b border-transparent"
        }`}
      >
        {/* Loading progress bar */}
        {pageLoading && <div className="absolute inset-x-0 top-0 h-[2.5px] bg-gradient-to-r from-transparent via-gold to-transparent animate-pulse" />}

        <div className="w-full flex items-center justify-between h-14 sm:h-16 px-4 sm:px-6 md:px-8 max-w-screen-2xl mx-auto">

          {/* Logo */}
          <Link to="/" onClick={handleNavClick} className="flex items-center gap-3 flex-shrink-0 group">
            <div className="flex flex-col items-start leading-none">
              <span className="font-display text-lg sm:text-xl font-extrabold tracking-tight text-foreground group-hover:text-gold transition-colors duration-200">
                MILLENIUM
              </span>
            </div>
          </Link>

          {/* Mobile right actions */}
          <div className="flex items-center gap-1.5 md:hidden ml-auto">
            <Link to="/search" onClick={handleNavClick} className={iconBtn}>
              <SearchIcon className="w-4 h-4" />
            </Link>

            <button
              type="button"
              onClick={toggle}
              aria-label={resolvedTheme === "dark" ? t("common.lightMode") : t("common.darkMode")}
              className={iconBtn}
            >
              {resolvedTheme === "dark" ? <Sun className="w-4 h-4 text-gold" /> : <Moon className="w-4 h-4" />}
            </button>
            {user && notifPopover}
            {!user && (
              <Link
                to="/auth"
                onClick={handleNavClick}
                className="rounded-xl border border-gold/40 bg-gold/10 px-3 py-1.5 text-[0.7rem] font-bold uppercase tracking-wider text-gold transition-all hover:bg-gold/20"
              >
                {t("nav.login")}
              </Link>
            )}
            {langPicker}
          </div>

          {/* Desktop nav links */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks}
          </div>

          {/* Desktop right actions */}
          <div className="hidden md:flex items-center gap-2.5">
            <Link to="/search" onClick={handleNavClick} className={iconBtn} aria-label="Recherche">
              <SearchIcon className="w-4 h-4" />
            </Link>

            <button
              type="button"
              onClick={toggle}
              aria-label={resolvedTheme === "dark" ? t("common.lightMode") : t("common.darkMode")}
              className={iconBtn}
            >
              {resolvedTheme === "dark" ? <Sun className="w-4 h-4 text-gold" /> : <Moon className="w-4 h-4" />}
            </button>

            {langPicker}

            {user ? (
              <>
                {notifPopover}
                {isAdmin && (
                  <Link to="/admin" className={`${iconBtn} text-gold border-gold/30 hover:bg-gold/15`}>
                    <Shield className="w-4 h-4" />
                  </Link>
                )}
                <Link to="/account" onClick={handleNavClick}>
                  <button type="button" className={`${iconBtn} gap-2 w-auto px-3 text-[0.78rem] font-semibold`}>
                    {profile?.avatar_url ? (
                      <UserAvatar src={profile.avatar_url} name={profile.full_name || user?.email || "Utilisateur"} className="w-5 h-5 rounded-full" />
                    ) : (
                      <UserIcon className="w-4 h-4" />
                    )}
                    {profile?.full_name?.split(" ")[0] || t("nav.account")}
                  </button>
                </Link>
                <button
                  type="button"
                  onClick={handleSignOut}
                  aria-label={t("nav.logout")}
                  className={`${iconBtn} text-muted-foreground hover:text-destructive hover:border-destructive/40`}
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </>
            ) : (
              <Link
                to="/auth"
                onClick={handleNavClick}
                className="rounded-xl border border-gold/40 bg-gold/10 px-4 py-2 text-[0.775rem] font-bold uppercase tracking-wider text-gold transition-all hover:bg-gold/20 hover:border-gold/60"
              >
                {t("nav.login")}
              </Link>
            )}
          </div>
        </div>
      </nav>

      <BottomNav />

      <style>{`
        .nav-link-active::after {
          content: '';
          position: absolute;
          bottom: -4px;
          left: 0;
          right: 0;
          height: 2px;
          background: hsl(var(--gold));
          border-radius: 999px;
        }
        .nav-link-hover {
          position: relative;
        }
        .nav-link-hover::after {
          content: '';
          position: absolute;
          bottom: -4px;
          left: 50%;
          right: 50%;
          height: 2px;
          background: hsl(var(--gold));
          border-radius: 999px;
          transition: left 0.2s ease, right 0.2s ease;
        }
        .nav-link-hover:hover::after {
          left: 0;
          right: 0;
        }
      `}</style>
    </>
  );
};

export default Navbar;
