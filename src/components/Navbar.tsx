import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { LogOut, Shield, User as UserIcon, Heart, Bell, Sun, Moon, Search as SearchIcon } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useTranslation } from "@/i18n";
import LanguageSelector from "@/components/LanguageSelector";
import useTheme from "@/hooks/useTheme";
import BottomNav from "@/components/BottomNav";
import NotificationBell from "@/components/NotificationBell";
import UserAvatar from "@/components/UserAvatar";

const Navbar = () => {
  const { user, profile, isAdmin, signOut } = useAuth();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const [pageLoading, setPageLoading] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const { resolvedTheme, toggle } = useTheme();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 16);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (pageLoading) setPageLoading(false);
  }, [location]);

  const handleNavClick = () => setPageLoading(true);
  const handleSignOut = async () => { await signOut(); navigate("/"); };

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

  const langPicker = <LanguageSelector variant="navbar" />;

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
            {user && <NotificationBell />}
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
                <NotificationBell />
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
