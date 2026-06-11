import { useEffect, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { Home, Users, Info, User as UserIcon, BookOpen, Settings, Shield, Heart } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useTranslation } from "@/i18n";
import UserAvatar from "@/components/UserAvatar";

const BottomNav = () => {
  const { user, profile, isAdmin } = useAuth();
  const location = useLocation();
  const [pageLoading, setPageLoading] = useState(false);

  useEffect(() => {
    if (pageLoading) {
      setPageLoading(false);
    }
  }, [location]);

  const handleNavClick = () => setPageLoading(true);

  const { t } = useTranslation();

  return (
    <nav className="fixed inset-x-4 bottom-4 top-auto md:hidden z-50 bg-popover/95 backdrop-blur-md border border-border rounded-3xl shadow-2xl">
      {pageLoading && <div className="absolute inset-x-0 -top-2 h-1 rounded-t-3xl bg-gold animate-pulse" />}
      <div className="mx-auto px-2 py-2">
        <div className={`grid ${isAdmin ? "grid-cols-7" : "grid-cols-6"} gap-0.5`}>
          <NavLink
            to="/"
            onClick={handleNavClick}
            className={({ isActive }) =>
              `flex flex-col items-center justify-center gap-0.5 rounded-2xl py-2 px-1 text-[10px] leading-tight transition ${
                isActive ? "bg-gold/15 text-gold" : "text-foreground/80 hover:text-gold"
              }`
            }
          >
            <Home className="w-4.5 h-4.5" />
            <span className="whitespace-nowrap">{t("bottomNav.home")}</span>
          </NavLink>

          <NavLink
            to="/feed"
            onClick={handleNavClick}
            className={({ isActive }) =>
              `flex flex-col items-center justify-center gap-0.5 rounded-2xl py-2 px-1 text-[10px] leading-tight transition ${
                isActive ? "bg-gold/15 text-gold" : "text-foreground/80 hover:text-gold"
              }`
            }
          >
            <BookOpen className="w-4.5 h-4.5" />
            <span className="truncate">{t("bottomNav.teachings")}</span>
          </NavLink>

          <NavLink
            to="/community"
            onClick={handleNavClick}
            className={({ isActive }) =>
              `flex flex-col items-center justify-center gap-0.5 rounded-2xl py-2 px-1 text-[10px] leading-tight transition ${
                isActive ? "bg-gold/15 text-gold" : "text-foreground/80 hover:text-gold"
              }`
            }
          >
            <Users className="w-4.5 h-4.5" />
            <span className="truncate">{t("bottomNav.community")}</span>
          </NavLink>

          <NavLink
            to="/about"
            onClick={handleNavClick}
            className={({ isActive }) =>
              `flex flex-col items-center justify-center gap-0.5 rounded-2xl py-2 px-1 text-[10px] leading-tight transition ${
                isActive ? "bg-gold/15 text-gold" : "text-foreground/80 hover:text-gold"
              }`
            }
          >
            <Info className="w-4.5 h-4.5" />
            <span className="whitespace-nowrap">{t("bottomNav.about")}</span>
          </NavLink>

          <NavLink
            to="/donate"
            onClick={handleNavClick}
            className={({ isActive }) =>
              `flex flex-col items-center justify-center gap-0.5 rounded-2xl py-2 px-1 text-[10px] leading-tight transition ${
                isActive ? "bg-gold/15 text-gold" : "text-foreground/80 hover:text-gold"
              }`
            }
          >
            <Heart className="w-4.5 h-4.5" />
            <span className="whitespace-nowrap">{t("bottomNav.donate")}</span>
          </NavLink>

          <NavLink
            to="/account"
            onClick={handleNavClick}
            className={({ isActive }) =>
              `flex flex-col items-center justify-center gap-0.5 rounded-2xl py-2 px-1 text-[10px] leading-tight transition ${
                isActive ? "bg-gold/15 text-gold" : "text-foreground/80 hover:text-gold"
              }`
            }
          >
            {profile?.avatar_url ? (
              <UserAvatar
                src={profile.avatar_url}
                name={profile.full_name || user?.email || "Utilisateur"}
                className="w-4.5 h-4.5"
              />
            ) : (
              <Settings className="w-4.5 h-4.5" />
            )}
            <span className="whitespace-nowrap">{t("bottomNav.settings")}</span>
          </NavLink>

          {isAdmin && (
            <NavLink
              to="/admin"
              onClick={handleNavClick}
              className={({ isActive }) =>
                `flex flex-col items-center justify-center gap-0.5 rounded-2xl py-2 px-1 text-[10px] leading-tight transition ${
                  isActive ? "bg-gold/15 text-gold" : "text-foreground/80 hover:text-gold"
                }`
              }
            >
              <Shield className="w-4.5 h-4.5" />
              <span className="whitespace-nowrap">{t("nav.admin")}</span>
            </NavLink>
          )}
        </div>
      </div>
    </nav>
  );
};

export default BottomNav;
