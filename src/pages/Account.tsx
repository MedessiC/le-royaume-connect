import { useState, useEffect, useMemo } from "react";
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
  ChevronRight, Loader2, Mail, ArrowUpRight, Copy, Check,
  Sparkles, ShieldCheck, KeyRound, AlertTriangle, Trash2, Smartphone, Monitor
} from "lucide-react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter
} from "@/components/ui/dialog";

type ActiveTab = "profile" | "security" | "preferences" | "support";

const TABS = [
  { id: "profile",     label: "Profil",      labelFull: "Profil & Bio",          icon: User        },
  { id: "security",    label: "Sécurité",    labelFull: "Sécurité & Accès",      icon: Lock        },
  { id: "preferences", label: "Préférences", labelFull: "Préférences",            icon: Shield      },
  { id: "support",     label: "Support",     labelFull: "Support & Aide",         icon: HelpCircle  },
] as const;

const Account = () => {
  const { user, isAdmin, loading, signOut } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t } = useTranslation();

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
  const [copiedId, setCopiedId]               = useState(false);

  const [newPassword, setNewPassword]         = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [savingPassword, setSavingPassword]   = useState(false);

  const [notifNews, setNotifNews]             = useState(false);
  const [notifReply, setNotifReply]           = useState(false);
  const [savingNotif, setSavingNotif]         = useState(false);

  // Danger zone modal
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const [deletingAccount, setDeletingAccount] = useState(false);

  useEffect(() => {
    document.title = `Mon Compte – MILLENIUM`;
    if (!loading && !user) navigate("/auth");
  }, [user, loading, navigate]);

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

  // Profile completeness score
  const healthScore = useMemo(() => {
    let score = 0;
    if (avatarUrl) score += 20;
    if (fullName.trim()) score += 20;
    if (country.trim()) score += 15;
    if (phone.trim()) score += 15;
    if (bio.trim()) score += 15;
    if (emailVerified) score += 15;
    return Math.min(100, score);
  }, [avatarUrl, fullName, country, phone, bio, emailVerified]);

  const copyUserId = () => {
    if (!user) return;
    navigator.clipboard.writeText(user.id);
    setCopiedId(true);
    toast({ title: "ID copié !", description: "Votre identifiant membre a été copié dans le presse-papier." });
    setTimeout(() => setCopiedId(false), 2500);
  };

  const saveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSavingProfile(true);
    const { error } = await supabase
      .from("profiles")
      .update({ full_name: fullName.trim() || null, phone: phone.trim() || null, country: country.trim() || null, bio: bio.trim() || null })
      .eq("id", user.id);
    setSavingProfile(false);
    if (error) return toast({ title: "Erreur", description: error.message, variant: "destructive" });
    toast({ title: "Profil mis à jour", description: "Vos informations personnelles ont été enregistrées." });
  };

  const changePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 6) return toast({ title: "Mot de passe trop court", description: "Minimum 6 caractères requis.", variant: "destructive" });
    if (newPassword !== confirmPassword) return toast({ title: "Mots de passe différents", description: "Veuillez retaper exactement le même mot de passe.", variant: "destructive" });
    setSavingPassword(true);
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    setSavingPassword(false);
    if (error) return toast({ title: "Erreur", description: error.message, variant: "destructive" });
    setNewPassword(""); setConfirmPassword("");
    toast({ title: "Mot de passe mis à jour", description: "Votre nouveau mot de passe est désormais actif." });
  };

  const handleAvatarUpdate = async (newUrl: string) => {
    try {
      const { error } = await supabase.from("profiles").update({ avatar_url: newUrl }).eq("id", user!.id);
      if (error) throw error;
      setAvatarUrl(newUrl);
      toast({ title: "Avatar mis à jour" });
    } catch (error: any) {
      toast({ title: "Erreur", description: error.message, variant: "destructive" });
    }
  };

  const handleAvatarDelete = async () => {
    try {
      const { error } = await supabase.from("profiles").update({ avatar_url: null }).eq("id", user!.id);
      if (error) throw error;
      setAvatarUrl(null);
      toast({ title: "Avatar supprimé" });
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
    toast({ title: "Demande envoyée", description: "Vérifiez votre boîte e-mail pour confirmer la nouvelle adresse." });
  };

  const saveNotif = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSavingNotif(true);
    const { error } = await supabase.from("profiles").update({ notif_news: notifNews, notif_reply: notifReply }).eq("id", user.id);
    setSavingNotif(false);
    if (error) return toast({ title: "Erreur", description: error.message, variant: "destructive" });
    toast({ title: "Préférences enregistrées" });
  };

  const handleDeleteAccount = async () => {
    if (!user || deleteConfirmText.trim().toLowerCase() !== "supprimer") return;
    setDeletingAccount(true);
    try {
      await supabase.auth.signOut();
      toast({ title: "Compte désactivé", description: "Votre session a été fermée." });
      navigate("/");
    } catch (err: any) {
      toast({ title: "Erreur", description: err.message, variant: "destructive" });
    } finally {
      setDeletingAccount(false);
      setDeleteModalOpen(false);
    }
  };

  const handleSignOut = async () => { await signOut(); navigate("/auth"); };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-10 h-10 animate-spin text-gold" />
          <p className="text-muted-foreground text-sm font-medium">Chargement de votre profil…</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  const initials = (fullName || user.email || "?")[0].toUpperCase();

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground font-body">
      <Navbar />

      <main className="flex-1 pt-20 pb-20">
        <div className="max-w-6xl mx-auto w-full px-4 sm:px-6">

          {/* ── Page Header ── */}
          <div className="py-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/50 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="px-2.5 py-0.5 rounded-full bg-gold/10 border border-gold/30 text-gold text-[11px] font-extrabold uppercase tracking-wider">
                  Espace Personnel
                </span>
                {isAdmin && (
                  <span className="px-2.5 py-0.5 rounded-full bg-royal/10 border border-royal/30 text-royal text-[11px] font-extrabold uppercase tracking-wider">
                    Administrateur
                  </span>
                )}
              </div>
              <h1 className="text-2xl sm:text-4xl font-display font-extrabold tracking-tight">
                Mon <span className="text-gradient-gold">Compte</span>
              </h1>
            </div>

            {/* Health Score Badge */}
            <div className="flex items-center gap-3 p-3 rounded-2xl bg-card border border-border/70 shadow-sm shrink-0">
              <div className="relative w-12 h-12 flex items-center justify-center">
                <svg className="w-12 h-12 -rotate-90" viewBox="0 0 36 36">
                  <path
                    className="text-border"
                    strokeWidth="3.5"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  <path
                    className="text-gold transition-all duration-1000 ease-out"
                    strokeDasharray={`${healthScore}, 100`}
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                </svg>
                <span className="absolute text-[11px] font-extrabold font-display">{healthScore}%</span>
              </div>
              <div>
                <p className="text-xs font-bold text-foreground">Complétion du Profil</p>
                <p className="text-[11px] text-muted-foreground">
                  {healthScore === 100 ? "Profil 100% vérifié" : "Complétez votre profil pour plus de sécurité"}
                </p>
              </div>
            </div>
          </div>

          {/* ── Main Banner Identity Card ── */}
          <div className="mb-8 rounded-3xl border border-gold/20 bg-gradient-to-r from-card via-card to-gold/5 p-5 sm:p-7 shadow-sm">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">

              {/* Avatar + Info */}
              <div className="flex items-center gap-4 sm:gap-6">
                <div className="relative shrink-0">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl border-2 border-gold/40 overflow-hidden bg-muted shadow-md">
                    {avatarUrl ? (
                      <img src={avatarUrl} alt={fullName || "Avatar"} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-xl font-bold bg-gold/10 text-gold">
                        {initials}
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-1 min-w-0">
                  <h2 className="font-display font-extrabold text-lg sm:text-xl truncate">
                    {fullName || "Membre MILLENIUM"}
                  </h2>
                  <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                  <div className="flex items-center gap-3 pt-1 text-[11px] text-muted-foreground flex-wrap">
                    {createdAt && (
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-gold" />
                        Membre depuis {new Date(createdAt).toLocaleDateString("fr-FR", { month: "long", year: "numeric" })}
                      </span>
                    )}
                    {country && (
                      <span className="flex items-center gap-1">
                        <Globe className="w-3 h-3 text-gold" />
                        {country}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="flex items-center gap-2 flex-wrap pt-4 md:pt-0 border-t md:border-t-0 border-border/50">
                <button
                  type="button"
                  onClick={copyUserId}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-border/80 bg-background/80 hover:bg-secondary text-xs font-semibold text-muted-foreground hover:text-foreground transition-all"
                  title="Copier l'identifiant membre"
                >
                  {copiedId ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>ID Membre</span>
                </button>

                <Link
                  to="/collections"
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-gold/30 bg-gold/10 hover:bg-gold/20 text-xs font-bold text-gold transition-all"
                >
                  <Bookmark className="w-3.5 h-3.5" />
                  <span>Mes Collections</span>
                </Link>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleSignOut}
                  className="border-destructive/30 text-destructive hover:bg-destructive/10 rounded-xl gap-1.5 text-xs px-3 h-9"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Déconnexion</span>
                </Button>
              </div>

            </div>
          </div>

          {/* ── Navigation Tabs ── */}
          <div className="mb-6 flex gap-2 overflow-x-auto scrollbar-none pb-2 border-b border-border/50">
            {TABS.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id as ActiveTab)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all shrink-0 ${
                    isActive
                      ? "bg-gold text-slate-950 shadow-gold"
                      : "bg-card border border-border/60 text-muted-foreground hover:text-foreground hover:bg-secondary/60"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.labelFull}</span>
                </button>
              );
            })}
          </div>

          {/* ── Main Content Area ── */}
          <div className="rounded-3xl border border-border/70 bg-card p-6 sm:p-8 shadow-sm">

            {/* ── TAB: Profil ── */}
            {activeTab === "profile" && (
              <div className="space-y-6">
                <div>
                  <h3 className="font-display text-lg font-extrabold">Informations Personnelles</h3>
                  <p className="text-xs text-muted-foreground">Mettez à jour vos informations publiques de membre.</p>
                </div>

                <div className="pb-6 border-b border-border/60">
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
                      <Label htmlFor="account-name" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Nom complet</Label>
                      <div className="relative">
                        <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/60" />
                        <Input id="account-name" value={fullName} onChange={(e) => setFullName(e.target.value)} maxLength={100} className="pl-11 h-12 rounded-2xl" placeholder="Ex: Jean Dupont" />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="account-phone" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Numéro de téléphone</Label>
                      <div className="h-12 rounded-2xl border border-border bg-card px-3.5 flex items-center transition-all duration-200 hover:border-border/80 focus-within:border-gold focus-within:ring-2 focus-within:ring-gold/20">
                        <PhoneInput
                          id="account-phone"
                          international
                          country="BJ"
                          value={phone || undefined}
                          onChange={(value) => setPhone(value ?? "")}
                          placeholder="+229 00 00 00 00"
                          className="w-full text-sm text-foreground font-medium"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="account-country" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Pays de résidence</Label>
                    <div className="relative">
                      <Globe className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/60 z-10" />
                      <div className="pl-11">
                        <CountrySelect value={country} onChange={setCountry} placeholder="Choisissez votre pays" />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="account-bio" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Présentation / Bio</Label>
                      <span className="text-[11px] text-muted-foreground tabular-nums">{bio.length}/500</span>
                    </div>
                    <Textarea
                      id="account-bio"
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      rows={4}
                      maxLength={500}
                      className="rounded-2xl p-3.5 text-sm"
                      placeholder="Partagez quelques mots sur votre cheminement de foi ou votre communauté…"
                    />
                  </div>

                  <Button type="submit" variant="hero" disabled={savingProfile} className="w-full sm:w-auto rounded-2xl h-12 px-8 shadow-gold">
                    {savingProfile ? <><Loader2 className="w-4 h-4 animate-spin" /> Enregistrement…</> : "Enregistrer les modifications"}
                  </Button>
                </form>
              </div>
            )}

            {/* ── TAB: Sécurité ── */}
            {activeTab === "security" && (
              <div className="space-y-8">

                {/* Email Section */}
                <div className="space-y-4 pb-6 border-b border-border/60">
                  <div>
                    <h3 className="font-display text-lg font-extrabold">Adresse E-mail & Identité</h3>
                    <p className="text-xs text-muted-foreground">Gérez l'adresse e-mail associée à votre compte.</p>
                  </div>

                  <div className="p-4 rounded-2xl bg-secondary/40 border border-border/60 space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">E-mail principal</p>
                        <p className="font-bold text-sm text-foreground break-all">{user.email}</p>
                      </div>
                      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border bg-card shrink-0">
                        {emailVerified ? (
                          <><MailCheck className="w-4 h-4 text-emerald-500" /><span className="text-emerald-500">Adresse Vérifiée</span></>
                        ) : (
                          <><MailWarning className="w-4 h-4 text-amber-500" /><span className="text-amber-500">Non vérifiée</span></>
                        )}
                      </div>
                    </div>

                    <form onSubmit={handleEmailChange} className="flex flex-col sm:flex-row gap-2">
                      <Input type="email" value={emailEdit} onChange={(e) => setEmailEdit(e.target.value)} className="h-11 rounded-2xl flex-1 text-sm" placeholder="Nouvelle adresse e-mail" required />
                      <Button type="submit" variant="outline" disabled={savingEmail || emailEdit === user.email} className="rounded-2xl shrink-0 h-11">
                        {savingEmail ? "Modification…" : "Changer d'e-mail"}
                      </Button>
                    </form>

                    {!emailVerified && (
                      <Button
                        type="button"
                        onClick={async () => {
                          setResendLoading(true);
                          const { error } = await supabase.auth.resend({ type: "signup", email: user.email! });
                          setResendLoading(false);
                          if (error) return toast({ title: "Erreur", description: error.message, variant: "destructive" });
                          toast({ title: "E-mail envoyé", description: "Un lien de confirmation vous a été adressé." });
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

                {/* Password Section */}
                <div className="space-y-4 pb-6 border-b border-border/60">
                  <div>
                    <h3 className="font-display text-lg font-extrabold">Modifier le Mot de Passe</h3>
                    <p className="text-xs text-muted-foreground">Sécurisez votre compte avec un mot de passe robuste.</p>
                  </div>

                  <form onSubmit={changePassword} className="space-y-4">
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <Label htmlFor="new-pw" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Nouveau mot de passe</Label>
                        <div className="relative">
                          <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/60" />
                          <Input id="new-pw" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} minLength={6} required className="pl-11 h-12 rounded-2xl" placeholder="6 caractères minimum" />
                        </div>
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="confirm-pw" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Confirmer le mot de passe</Label>
                        <div className="relative">
                          <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/60" />
                          <Input id="confirm-pw" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} minLength={6} required className="pl-11 h-12 rounded-2xl" placeholder="Répétez" />
                        </div>
                      </div>
                    </div>
                    <Button type="submit" variant="hero" disabled={savingPassword} className="w-full sm:w-auto rounded-2xl h-12 px-8 shadow-gold">
                      {savingPassword ? "Mise à jour…" : "Mettre à jour le mot de passe"}
                    </Button>
                  </form>
                </div>

                {/* Session Active & Danger Zone */}
                <div className="space-y-4">
                  <div>
                    <h3 className="font-display text-lg font-extrabold text-destructive">Zone de Danger</h3>
                    <p className="text-xs text-muted-foreground">Actions irréversibles relatives à votre compte.</p>
                  </div>

                  <div className="p-4 rounded-2xl border border-destructive/30 bg-destructive/5 flex items-center justify-between gap-4 flex-wrap">
                    <div>
                      <p className="font-bold text-sm text-foreground">Désactiver / Supprimer mon compte</p>
                      <p className="text-xs text-muted-foreground">Cette action désactivera immédiatement votre accès.</p>
                    </div>
                    <Button
                      type="button"
                      variant="destructive"
                      onClick={() => setDeleteModalOpen(true)}
                      className="rounded-2xl h-10 px-5 text-xs font-bold gap-1.5"
                    >
                      <Trash2 className="w-4 h-4" />
                      Supprimer mon compte
                    </Button>
                  </div>
                </div>

              </div>
            )}

            {/* ── TAB: Préférences ── */}
            {activeTab === "preferences" && (
              <div className="space-y-6">
                <div>
                  <h3 className="font-display text-lg font-extrabold">Préférences de Notification</h3>
                  <p className="text-xs text-muted-foreground">Choisissez ce que vous souhaitez recevoir.</p>
                </div>

                <form onSubmit={saveNotif} className="space-y-6">
                  <div className="space-y-3">
                    <label htmlFor="notif-news" className="flex items-start gap-3.5 p-4 rounded-2xl bg-secondary/30 border border-border/40 hover:bg-secondary/50 cursor-pointer transition-colors">
                      <input id="notif-news" type="checkbox" checked={notifNews} onChange={(e) => setNotifNews(e.target.checked)} className="w-4 h-4 rounded border-border text-gold focus:ring-gold mt-0.5 shrink-0 accent-gold" />
                      <div className="space-y-0.5">
                        <p className="text-sm font-bold text-foreground">Alerte Nouveautés & Enseignements</p>
                        <p className="text-xs text-muted-foreground">Recevez une notification par e-mail dès qu'un nouvel enseignement majeur est publié.</p>
                      </div>
                    </label>

                    <label htmlFor="notif-reply" className="flex items-start gap-3.5 p-4 rounded-2xl bg-secondary/30 border border-border/40 hover:bg-secondary/50 cursor-pointer transition-colors">
                      <input id="notif-reply" type="checkbox" checked={notifReply} onChange={(e) => setNotifReply(e.target.checked)} className="w-4 h-4 rounded border-border text-gold focus:ring-gold mt-0.5 shrink-0 accent-gold" />
                      <div className="space-y-0.5">
                        <p className="text-sm font-bold text-foreground">Réponses à vos commentaires</p>
                        <p className="text-xs text-muted-foreground">Soyez informé lorsque d'autres membres de la communauté répondent à vos messages.</p>
                      </div>
                    </label>
                  </div>

                  <Button type="submit" variant="hero" disabled={savingNotif} className="w-full sm:w-auto rounded-2xl h-12 px-8 shadow-gold">
                    {savingNotif ? "Enregistrement…" : "Enregistrer les préférences"}
                  </Button>
                </form>
              </div>
            )}

            {/* ── TAB: Support ── */}
            {activeTab === "support" && (
              <div className="space-y-6">
                <div>
                  <h3 className="font-display text-lg font-extrabold">Support & Assistance</h3>
                  <p className="text-xs text-muted-foreground">Une question ou un souci technique ? L'équipe MILLENIUM est là pour vous aider.</p>
                </div>

                <div className="p-6 rounded-3xl border border-border/60 bg-gradient-to-br from-secondary/30 to-background space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-gold/10 border border-gold/30 flex items-center justify-center text-gold shrink-0">
                      <Mail className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="font-display text-base font-bold text-foreground">Contacter l'équipe d'assistance</h4>
                      <p className="text-xs text-muted-foreground">contact@leregnemillenaire.com</p>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Si vous avez des questions sur l'accès aux enseignements, le paiement de dons ou la gestion de vos collections, notre équipe vous répond sous 24h.
                  </p>
                  <a
                    href={`mailto:contact@leregnemillenaire.com?subject=Assistance%20Compte%20MILLENIUM%20(${user.email})`}
                    className="inline-flex items-center gap-2 rounded-2xl bg-gold hover:bg-gold/90 text-slate-950 font-extrabold text-xs tracking-wider uppercase px-6 py-3.5 shadow-gold transition-all"
                  >
                    Envoyer un e-mail au support
                    <ArrowUpRight className="w-4 h-4" />
                  </a>
                </div>
              </div>
            )}

          </div>
        </div>
      </main>

      {/* ── Delete Account Confirmation Dialog ── */}
      <Dialog open={deleteModalOpen} onOpenChange={setDeleteModalOpen}>
        <DialogContent className="max-w-md rounded-3xl">
          <DialogHeader>
            <div className="w-12 h-12 rounded-2xl bg-destructive/10 border border-destructive/30 flex items-center justify-center text-destructive mb-2">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <DialogTitle className="text-lg font-bold">Confirmer la suppression</DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Cette action fermera votre session et désactivera l'accès à vos collections et préférences.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-2">
            <p className="text-xs font-semibold text-foreground">
              Tapez <span className="font-bold text-destructive uppercase">supprimer</span> pour confirmer :
            </p>
            <Input
              value={deleteConfirmText}
              onChange={(e) => setDeleteConfirmText(e.target.value)}
              placeholder="supprimer"
              className="h-11 rounded-2xl text-sm"
            />
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="ghost" onClick={() => setDeleteModalOpen(false)} className="rounded-2xl">
              Annuler
            </Button>
            <Button
              variant="destructive"
              disabled={deleteConfirmText.trim().toLowerCase() !== "supprimer" || deletingAccount}
              onClick={handleDeleteAccount}
              className="rounded-2xl font-bold"
            >
              {deletingAccount ? "Suppression…" : "Confirmer la suppression"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
};

export default Account;
