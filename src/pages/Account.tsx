import { useState, useEffect } from "react";
import PhoneInput from "react-phone-number-input";
import "react-phone-number-input/style.css";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useTranslation } from "@/i18n";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import AvatarUpload from "@/components/AvatarUpload";
import CountrySelect from "@/components/CountrySelect";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import {
  User, Lock, Shield, LogOut, MailCheck, MailWarning,
  Calendar, Globe, Phone, Bookmark, HelpCircle,
  ChevronRight, Loader2, Mail, ArrowUpRight
} from "lucide-react";

type ActiveTab = "profile" | "security" | "preferences" | "support";

const TABS = [
  { id: "profile",     label: "Profil",      labelFull: "Profil & Bio",          icon: User        },
  { id: "security",    label: "Sécurité",    labelFull: "Sécurité & Accès",      icon: Lock        },
  { id: "preferences", label: "Notifs",      labelFull: "Préférences",            icon: Shield      },
  { id: "support",     label: "Support",     labelFull: "Support & Aide",         icon: HelpCircle  },
] as const;

const Account = () => {
  const { user, isAdmin, loading, signOut } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t, locale } = useTranslation();

  const [activeTab, setActiveTab] = useState<ActiveTab>("profile");

  const [fullName, setFullName]               = useState("");
  const [phone, setPhone]                     = useState("");
  const [country, setCountry]                 = useState("");
  const [bio, setBio]                         = useState("");
  const [avatarUrl, setAvatarUrl]             = useState<string | null>(null);
  const [savingProfile, setSavingProfile]     = useState(false);
  const [emailEdit, setEmailEdit]             = useState("");
  const [savingEmail, setSavingEmail]         = useState(false);
  const [resendLoading, setResendLoading]     = useState(false);
  const [emailVerified, setEmailVerified]     = useState<boolean | null>(null);
  const [createdAt, setCreatedAt]             = useState<string | null>(null);

  const [newPassword, setNewPassword]         = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [savingPassword, setSavingPassword]   = useState(false);

  const [notifNews, setNotifNews]   = useState(false);
  const [notifReply, setNotifReply] = useState(false);
  const [savingNotif, setSavingNotif] = useState(false);

  useEffect(() => {
    document.title = `${t("account.title")} – MILLENIUM`;
    if (!loading && !user) navigate("/auth");
  }, [user, loading, navigate, t]);

  useEffect(() => {
    if (!user) return;

    const loadProfile = async () => {
      const { data } = await supabase.from("profiles").select("*,created_at").eq("id", user.id).maybeSingle();
      if (data) {
        setFullName(data.full_name ?? "");
        setPhone(data.phone ?? "");
        setCountry(data.country ?? "");
        setBio(data.bio ?? "");
        setAvatarUrl(data.avatar_url);
        setCreatedAt(data.created_at ?? null);
        setNotifNews(!!data.notif_news);
        setNotifReply(!!data.notif_reply);
      } else {
        const defaultName   = user.user_metadata?.full_name ?? user.user_metadata?.name ?? "";
        const defaultAvatar = user.user_metadata?.avatar_url ?? null;
        const insertResult  = await supabase
          .from("profiles")
          .insert({ id: user.id, full_name: defaultName || null, avatar_url: defaultAvatar })
          .select("id, full_name, avatar_url, country, bio, created_at, notif_news, notif_reply")
          .maybeSingle();

        if (insertResult.data) {
          setFullName(insertResult.data.full_name ?? "");
          setPhone(insertResult.data.phone ?? "");
          setCountry(insertResult.data.country ?? "");
          setBio(insertResult.data.bio ?? "");
          setAvatarUrl(insertResult.data.avatar_url ?? null);
          setCreatedAt(insertResult.data.created_at ?? null);
          setNotifNews(!!insertResult.data.notif_news);
          setNotifReply(!!insertResult.data.notif_reply);
        }
      }
    };

    loadProfile();

    supabase.auth.getUser().then(({ data }) => {
      if (data?.user) {
        setEmailVerified(!!data.user.email_confirmed_at);
        setEmailEdit(data.user.email ?? "");
      }
    });
  }, [user]);

  const saveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSavingProfile(true);
    const { error } = await supabase
      .from("profiles")
      .update({ full_name: fullName.trim() || null, phone: phone.trim() || null, country: country.trim() || null, bio: bio.trim() || null })
      .eq("id", user.id);
    setSavingProfile(false);
    if (error) return toast({ title: t("auth.authError"), description: error.message, variant: "destructive" });
    toast({ title: t("account.saved") });
  };

  const changePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 6)     return toast({ title: "Mot de passe trop court", description: "Minimum 6 caractères", variant: "destructive" });
    if (newPassword !== confirmPassword) return toast({ title: "Mots de passe différents", variant: "destructive" });
    setSavingPassword(true);
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    setSavingPassword(false);
    if (error) return toast({ title: "Erreur", description: error.message, variant: "destructive" });
    setNewPassword(""); setConfirmPassword("");
    toast({ title: "Mot de passe modifié" });
  };

  const handleAvatarUpdate = async (newUrl: string) => {
    try {
      const { error } = await supabase.from("profiles").update({ avatar_url: newUrl }).eq("id", user.id);
      if (error) throw error;
      setAvatarUrl(newUrl);
    } catch (error: any) {
      toast({ title: "Erreur", description: error.message, variant: "destructive" });
    }
  };

  const handleAvatarDelete = async () => {
    try {
      const { error } = await supabase.from("profiles").update({ avatar_url: null }).eq("id", user.id);
      if (error) throw error;
      setAvatarUrl(null);
    } catch (error: any) {
      toast({ title: "Erreur", description: error.message, variant: "destructive" });
    }
  };

  const handleEmailChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !emailEdit || emailEdit === user.email) return;
    setSavingEmail(true);
    const { error } = await supabase.auth.updateUser({ email: emailEdit });
    setSavingEmail(false);
    if (error) return toast({ title: "Erreur", description: error.message, variant: "destructive" });
    toast({ title: "E-mail modifié", description: "Vérifiez votre boîte de réception pour confirmer." });
  };

  const saveNotif = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSavingNotif(true);
    const { error } = await supabase.from("profiles").update({ notif_news: notifNews, notif_reply: notifReply }).eq("id", user.id);
    setSavingNotif(false);
    if (error) return toast({ title: "Erreur", description: error.message, variant: "destructive" });
    toast({ title: "Préférences mises à jour" });
  };

  const handleSignOut = async () => { await signOut(); navigate("/auth"); };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-10 h-10 animate-spin text-gold" />
          <p className="text-muted-foreground text-sm">Chargement de votre compte…</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  const initials = (fullName || user.email || "?")[0].toUpperCase();

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <Navbar />

      <main className="flex-1 pt-16 sm:pt-20 pb-16">
        <div className="max-w-6xl mx-auto w-full px-4 sm:px-6">

          {/* ── Page header ── */}
          <div className="py-6 sm:py-8">
            <h1 className="text-2xl sm:text-4xl font-display font-extrabold tracking-tight">
              Mon <span className="text-gradient-gold">Compte</span>
            </h1>
            <p className="mt-1 text-muted-foreground text-sm">
              Gérez vos informations de profil, préférences et accès de sécurité.
            </p>
          </div>

          {/* ── Profile identity card (always visible) ── */}
          <div className="mb-4 sm:mb-6 flex items-center gap-4 rounded-2xl border border-border/70 bg-card p-4 shadow-sm">
            {/* Avatar */}
            <div className="relative shrink-0">
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full border-2 border-gold/35 overflow-hidden bg-muted">
                {avatarUrl ? (
                  <img src={avatarUrl} alt={fullName || "Avatar"} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-lg font-bold bg-gold/10 text-gold">
                    {initials}
                  </div>
                )}
              </div>
              {isAdmin && (
                <span
                  className="absolute -bottom-1 -right-1 inline-flex items-center justify-center w-5 h-5 rounded-full bg-gold text-slate-950 text-[9px] font-black shadow border border-background"
                  title="Administrateur"
                >
                  ADM
                </span>
              )}
            </div>

            {/* Name + email */}
            <div className="min-w-0 flex-1">
              <p className="font-display font-bold text-sm sm:text-base truncate">
                {fullName || "Membres MILLENIUM"}
              </p>
              <p className="text-xs text-muted-foreground truncate">{user.email}</p>
              {createdAt && (
                <p className="mt-0.5 flex items-center gap-1 text-[10px] sm:text-xs text-muted-foreground">
                  <Calendar className="w-3 h-3 shrink-0" />
                  Membre depuis {new Date(createdAt).toLocaleDateString("fr-FR", { month: "short", year: "numeric" })}
                </p>
              )}
            </div>

            {/* Logout button – always reachable */}
            <Button
              variant="outline"
              size="sm"
              onClick={handleSignOut}
              className="shrink-0 border-destructive/30 text-destructive hover:bg-destructive/10 rounded-xl gap-1.5 text-xs px-3 h-9"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Déconnexion</span>
            </Button>
          </div>

          {/* ── Tab navigation ── */}
          <div className="mb-4 sm:mb-6 -mx-4 sm:mx-0 px-4 sm:px-0">
            {/* Mobile: horizontal scroll */}
            <div className="flex gap-2 overflow-x-auto scrollbar-none pb-1 sm:hidden">
              {TABS.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveTab(tab.id as ActiveTab)}
                    className={`flex shrink-0 items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all border ${
                      activeTab === tab.id
                        ? "bg-gold/10 border-gold/40 text-gold"
                        : "bg-card border-border/60 text-muted-foreground"
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    {tab.label}
                  </button>
                );
              })}
              <Link
                to="/collections"
                className="flex shrink-0 items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap bg-card border border-border/60 text-muted-foreground"
              >
                <Bookmark className="w-3.5 h-3.5" />
                Collections
              </Link>
            </div>

            {/* Desktop: hidden — sidebar handles it */}
          </div>

          {/* ── Layout grid: sidebar (lg+) + content ── */}
          <div className="grid lg:grid-cols-[240px_1fr] gap-6 items-start">

            {/* Sidebar — desktop only */}
            <nav className="hidden lg:flex flex-col rounded-2xl border border-border/60 bg-card overflow-hidden shadow-sm" aria-label="Navigation compte">
              {TABS.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveTab(tab.id as ActiveTab)}
                    className={`flex items-center justify-between px-4 py-3.5 text-sm font-semibold transition-all border-b border-border/40 last:border-b-0 text-left ${
                      activeTab === tab.id
                        ? "bg-gold/10 text-gold border-r-2 border-r-gold"
                        : "text-muted-foreground hover:text-foreground hover:bg-secondary/40"
                    }`}
                  >
                    <span className="flex items-center gap-3">
                      <Icon className="w-4 h-4" />
                      {tab.labelFull}
                    </span>
                    <ChevronRight className={`w-4 h-4 opacity-40 transition-transform ${activeTab === tab.id ? "translate-x-0.5 text-gold" : ""}`} />
                  </button>
                );
              })}
              <Link
                to="/collections"
                className="flex items-center justify-between px-4 py-3.5 text-sm font-semibold text-muted-foreground hover:text-foreground hover:bg-secondary/40 border-t border-border/60"
              >
                <span className="flex items-center gap-3">
                  <Bookmark className="w-4 h-4" />
                  Mes Collections
                </span>
                <ChevronRight className="w-4 h-4 opacity-40" />
              </Link>

              <div className="p-3 border-t border-border/50">
                <Button
                  variant="outline"
                  onClick={handleSignOut}
                  className="w-full border-destructive/30 text-destructive hover:bg-destructive/10 rounded-xl gap-2 h-10 text-sm"
                >
                  <LogOut className="w-4 h-4" />
                  Déconnexion
                </Button>
              </div>
            </nav>

            {/* Content panel */}
            <div className="rounded-2xl border border-border/70 bg-card p-5 sm:p-7 shadow-sm">

              {/* ── TAB: Profil ── */}
              {activeTab === "profile" && (
                <div className="space-y-6">
                  <div>
                    <h2 className="font-display text-lg font-bold">Détails du Profil</h2>
                    <p className="mt-0.5 text-xs text-muted-foreground">Ces informations s'affichent publiquement sur votre fiche membre.</p>
                  </div>

                  <div className="pb-5 border-b border-border/60">
                    <AvatarUpload
                      currentAvatarUrl={avatarUrl}
                      userName={fullName || user.email || "Utilisateur"}
                      userId={user.id}
                      onAvatarChange={handleAvatarUpdate}
                      onAvatarDelete={handleAvatarDelete}
                    />
                  </div>

                  <form onSubmit={saveProfile} className="space-y-4">
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <Label htmlFor="account-name" className="text-xs font-semibold text-muted-foreground">Nom complet</Label>
                        <div className="relative">
                          <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/60" />
                          <Input id="account-name" value={fullName} onChange={(e) => setFullName(e.target.value)} maxLength={100} className="pl-10 h-11 rounded-xl" placeholder="Nom public" />
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <Label htmlFor="account-phone" className="text-xs font-semibold text-muted-foreground">Téléphone</Label>
                        <div className="relative">
                          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground/60 z-10">
                            <Phone className="w-4 h-4" />
                          </span>
                          <PhoneInput
                            id="account-phone"
                            international
                            country="BJ"
                            value={phone || undefined}
                            onChange={(value) => setPhone(value ?? "")}
                            placeholder="+229 00 00 00 00"
                            className="w-full h-11 rounded-xl border border-border bg-transparent pl-10 pr-4 text-sm text-foreground outline-none transition focus-within:border-gold focus-within:ring-2 focus-within:ring-gold/20"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="account-country" className="text-xs font-semibold text-muted-foreground">Pays de résidence</Label>
                      <div className="relative">
                        <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/60 z-10" />
                        <div className="pl-10">
                          <CountrySelect value={country} onChange={setCountry} placeholder="Choisissez votre pays" />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="account-bio" className="text-xs font-semibold text-muted-foreground">Bio / Présentation</Label>
                      <Textarea id="account-bio" value={bio} onChange={(e) => setBio(e.target.value)} rows={4} maxLength={500} className="rounded-xl p-3" placeholder="Décrivez votre parcours de foi ou votre rôle dans l'œuvre..." />
                    </div>

                    <Button type="submit" variant="hero" disabled={savingProfile} className="w-full sm:w-auto rounded-xl h-11 px-6 shadow-gold">
                      {savingProfile ? <><Loader2 className="w-4 h-4 animate-spin" /> Sauvegarde…</> : "Enregistrer les modifications"}
                    </Button>
                  </form>
                </div>
              )}

              {/* ── TAB: Sécurité ── */}
              {activeTab === "security" && (
                <div className="space-y-8">
                  <div className="space-y-4 pb-6 border-b border-border/60">
                    <div>
                      <h2 className="font-display text-lg font-bold">Identité & E-mail</h2>
                      <p className="mt-0.5 text-xs text-muted-foreground">Gérez votre adresse e-mail et son statut de vérification.</p>
                    </div>

                    <div className="p-4 rounded-2xl bg-secondary/40 border border-border/60 space-y-4">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div>
                          <p className="text-xs text-muted-foreground">Adresse e-mail actuelle</p>
                          <p className="font-bold text-sm text-foreground break-all">{user.email}</p>
                        </div>
                        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border bg-card shrink-0">
                          {emailVerified ? (
                            <><MailCheck className="w-4 h-4 text-green-600" /><span className="text-green-600">Vérifié</span></>
                          ) : (
                            <><MailWarning className="w-4 h-4 text-amber-500" /><span className="text-amber-500">Non vérifié</span></>
                          )}
                        </div>
                      </div>

                      <form onSubmit={handleEmailChange} className="flex flex-col sm:flex-row gap-2">
                        <Input type="email" value={emailEdit} onChange={(e) => setEmailEdit(e.target.value)} className="h-10 rounded-xl flex-1" placeholder="Nouvel e-mail" required />
                        <Button type="submit" variant="outline" disabled={savingEmail || emailEdit === user.email} className="rounded-xl shrink-0">
                          {savingEmail ? "Modification…" : "Modifier"}
                        </Button>
                      </form>

                      {!emailVerified && (
                        <Button
                          type="button"
                          onClick={async () => {
                            setResendLoading(true);
                            const { error } = await supabase.auth.resend({ type: "signup", email: user.email! });
                            setResendLoading(false);
                            if (error) return toast({ title: t("auth.authError"), description: error.message, variant: "destructive" });
                            toast({ title: t("account.confirmationSent"), description: t("account.confirmationSentDescription") });
                          }}
                          disabled={resendLoading}
                          variant="secondary"
                          size="sm"
                          className="rounded-xl text-xs"
                        >
                          {resendLoading ? "Envoi…" : "Renvoyer l'e-mail de confirmation"}
                        </Button>
                      )}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <h2 className="font-display text-base font-bold">Changer le mot de passe</h2>
                      <p className="mt-0.5 text-xs text-muted-foreground">Sécurisez votre compte avec un nouveau mot de passe.</p>
                    </div>
                    <form onSubmit={changePassword} className="space-y-4">
                      <div className="grid sm:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <Label htmlFor="new-pw" className="text-xs font-semibold text-muted-foreground">Nouveau mot de passe</Label>
                          <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/60" />
                            <Input id="new-pw" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} minLength={6} required className="pl-10 h-11 rounded-xl" placeholder="6 caractères min" />
                          </div>
                        </div>
                        <div className="space-y-1.5">
                          <Label htmlFor="confirm-pw" className="text-xs font-semibold text-muted-foreground">Confirmer</Label>
                          <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/60" />
                            <Input id="confirm-pw" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} minLength={6} required className="pl-10 h-11 rounded-xl" placeholder="Répétez" />
                          </div>
                        </div>
                      </div>
                      <Button type="submit" variant="hero" disabled={savingPassword} className="w-full sm:w-auto rounded-xl h-11 px-6 shadow-gold">
                        {savingPassword ? "Mise à jour…" : "Mettre à jour le mot de passe"}
                      </Button>
                    </form>
                  </div>
                </div>
              )}

              {/* ── TAB: Préférences ── */}
              {activeTab === "preferences" && (
                <div className="space-y-6">
                  <div>
                    <h2 className="font-display text-lg font-bold">Préférences de Notification</h2>
                    <p className="mt-0.5 text-xs text-muted-foreground">Ajustez ce que vous recevez de la communauté.</p>
                  </div>

                  <form onSubmit={saveNotif} className="space-y-6">
                    <div className="space-y-3">
                      <label htmlFor="notif-news" className="flex items-start gap-3 p-4 rounded-2xl bg-secondary/30 border border-border/40 hover:bg-secondary/50 cursor-pointer transition-colors">
                        <input id="notif-news" type="checkbox" checked={notifNews} onChange={(e) => setNotifNews(e.target.checked)} className="w-4 h-4 rounded border-border text-gold focus:ring-gold mt-0.5 shrink-0" />
                        <div className="space-y-0.5">
                          <p className="text-sm font-semibold text-foreground">Nouveautés & Enseignements officiels</p>
                          <p className="text-xs text-muted-foreground">Recevoir un avertissement pour chaque nouvelle prédication ou message publié.</p>
                        </div>
                      </label>

                      <label htmlFor="notif-reply" className="flex items-start gap-3 p-4 rounded-2xl bg-secondary/30 border border-border/40 hover:bg-secondary/50 cursor-pointer transition-colors">
                        <input id="notif-reply" type="checkbox" checked={notifReply} onChange={(e) => setNotifReply(e.target.checked)} className="w-4 h-4 rounded border-border text-gold focus:ring-gold mt-0.5 shrink-0" />
                        <div className="space-y-0.5">
                          <p className="text-sm font-semibold text-foreground">Réponses à vos commentaires</p>
                          <p className="text-xs text-muted-foreground">Être notifié lorsqu'un membre répond à vos messages dans les forums.</p>
                        </div>
                      </label>
                    </div>

                    <Button type="submit" variant="hero" disabled={savingNotif} className="w-full sm:w-auto rounded-xl h-11 px-6 shadow-gold">
                      {savingNotif ? "Enregistrement…" : "Enregistrer mes préférences"}
                    </Button>
                  </form>
                </div>
              )}

              {/* ── TAB: Support ── */}
              {activeTab === "support" && (
                <div className="space-y-6">
                  <div>
                    <h2 className="font-display text-lg font-bold">Support & Assistance</h2>
                    <p className="mt-0.5 text-xs text-muted-foreground">Un problème ou une question sur la plateforme ? Notre équipe vous aide.</p>
                  </div>

                  <div className="p-5 sm:p-6 rounded-2xl border border-border/60 bg-secondary/20 space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-card border border-border/60 flex items-center justify-center text-muted-foreground shrink-0">
                        <Mail className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="font-display text-sm font-bold text-foreground">Besoin d'aide ?</h3>
                        <p className="text-xs text-muted-foreground">contact@leregnemillenaire.com</p>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      Si vous rencontrez des difficultés pour utiliser le lecteur audio, modifier vos collections, ou valider votre e-mail, écrivez-nous. Nous répondons généralement en moins de 24h.
                    </p>
                    <a
                      href="mailto:contact@leregnemillenaire.com"
                      className="inline-flex items-center gap-2 rounded-xl bg-gold hover:bg-gold/90 text-slate-950 font-bold text-xs tracking-wider uppercase px-5 py-3 shadow-gold transition-colors"
                    >
                      Contacter le support
                      <ArrowUpRight className="w-4 h-4" />
                    </a>
                  </div>
                </div>
              )}

            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Account;
