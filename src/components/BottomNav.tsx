import { useEffect, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { Home, Users, Info, User as UserIcon, BookOpen, Settings, Shield, Heart } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useTranslation } from "@/i18n";
import UserAvatar from "@/components/UserAvatar";

type NavItem = {
  to: string;
  icon: React.ReactNode;
  label: string;
  exact?: boolean;
};

const BottomNav = () => {
  const { user, profile, isAdmin } = useAuth();
  const location = useLocation();
  const [pageLoading, setPageLoading] = useState(false);

  useEffect(() => {
    if (pageLoading) setPageLoading(false);
  }, [location]);

  const handleNavClick = () => setPageLoading(true);
  const { t } = useTranslation();

  const navItems: NavItem[] = [
    { to: "/", icon: <Home strokeWidth={1.75} />, label: t("bottomNav.home"), exact: true },
    { to: "/feed", icon: <BookOpen strokeWidth={1.75} />, label: t("bottomNav.teachings") },
    { to: "/community", icon: <Users strokeWidth={1.75} />, label: t("bottomNav.community") },
    { to: "/about", icon: <Info strokeWidth={1.75} />, label: t("bottomNav.about") },
    { to: "/donate", icon: <Heart strokeWidth={1.75} />, label: t("bottomNav.donate") },
    {
      to: "/account",
      icon: profile?.avatar_url ? (
        <UserAvatar src={profile.avatar_url} name={profile.full_name || user?.email || "Utilisateur"} className="w-5 h-5 rounded-full ring-1 ring-border" />
      ) : (
        <Settings strokeWidth={1.75} />
      ),
      label: t("bottomNav.settings"),
    },
    ...(isAdmin ? [{ to: "/admin", icon: <Shield strokeWidth={1.75} />, label: t("nav.admin") }] : []),
  ];

  return (
    <nav
      className="fixed inset-x-3 bottom-3 top-auto md:hidden z-50"
      style={{ WebkitBackdropFilter: "blur(20px)", backdropFilter: "blur(20px)" }}
    >
      {/* Loading bar */}
      {pageLoading && (
        <div className="absolute inset-x-8 -top-1.5 h-[2px] rounded-full bg-gradient-to-r from-transparent via-gold to-transparent animate-pulse" />
      )}

      {/* Container */}
      <div className="relative bg-background/90 border border-border/60 rounded-2xl shadow-xl overflow-hidden">
        {/* Gold top accent */}
        <div className="absolute inset-x-0 top-0 h-[1.5px] bg-gradient-to-r from-transparent via-gold/40 to-transparent" />

        <div className="px-1 py-1">
          <div className={`grid ${isAdmin ? "grid-cols-7" : "grid-cols-6"} gap-0`}>
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.exact}
                onClick={handleNavClick}
                className={({ isActive }) =>
                  `relative flex flex-col items-center justify-center gap-0.5 rounded-xl py-2.5 px-1 text-[9.5px] font-medium leading-tight tracking-wide transition-all duration-200 ${
                    isActive
                      ? "text-gold bg-gold/10"
                      : "text-foreground/55 hover:text-foreground/80"
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    {/* Active indicator dot */}
                    {isActive && (
                      <span className="absolute top-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-gold shadow-[0_0_6px_hsl(51_100%_50%/0.7)]" />
                    )}
                    <span className={`w-5 h-5 flex items-center justify-center transition-transform duration-200 ${isActive ? "scale-110" : ""}`}>
                      {item.icon}
                    </span>
                    <span className="truncate max-w-full">{item.label}</span>
                  </>
                )}
              </NavLink>
            ))}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default BottomNav;
