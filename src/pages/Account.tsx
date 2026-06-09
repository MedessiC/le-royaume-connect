import { useState, useEffect } from "react";
import PhoneInput from "react-phone-number-input";
import "react-phone-number-input/style.css";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTranslation } from "@/i18n";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import UserAvatar from "@/components/UserAvatar";
import CountrySelect from "@/components/CountrySelect";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { User, Lock, Shield, LogOut, MailCheck, MailWarning, Upload, Trash2 } from "lucide-react";

const Account = () => {
  const { user, isAdmin, loading, signOut } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t, locale } = useTranslation();

  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [country, setCountry] = useState("");
  const [bio, setBio] = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [savingProfile, setSavingProfile] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [emailEdit, setEmailEdit] = useState("");
  const [savingEmail, setSavingEmail] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [emailVerified, setEmailVerified] = useState<boolean | null>(null);
  const [createdAt, setCreatedAt] = useState<string | null>(null);

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [savingPassword, setSavingPassword] = useState(false);

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
      } else {
        const fullName = user.user_metadata?.full_name ?? user.user_metadata?.name ?? "";
        const avatarUrl = user.user_metadata?.avatar_url ?? null;
        const insertResult = await supabase
          .from("profiles")
          .insert({ id: user.id, full_name: fullName || null, avatar_url: avatarUrl })
          .select("id, full_name, avatar_url, country, bio, created_at");

        if (insertResult.data?.[0]) {
          setFullName(insertResult.data[0].full_name ?? "");
          setPhone(insertResult.data[0].phone ?? "");
          setCountry(insertResult.data[0].country ?? "");
          setBio(insertResult.data[0].bio ?? "");
          setAvatarUrl(insertResult.data[0].avatar_url ?? null);
          setCreatedAt(insertResult.data[0].created_at ?? null);
        }
      }
    };

    loadProfile();

    supabase.auth.getUser().then(({ data, error }) => {
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
      .update({
        full_name: fullName.trim() || null,
        phone: phone.trim() || null,
        country: country.trim() || null,
        bio: bio.trim() || null,
      })
      .eq("id", user.id);
    setSavingProfile(false);
    if (error) return toast({ title: t("auth.authError"), description: error.message, variant: "destructive" });
    toast({ title: t("account.saved") });
  };

  const changePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      return toast({ title: "Mot de passe trop court", description: "Minimum 6 caractères", variant: "destructive" });
    }
    if (newPassword !== confirmPassword) {
      return toast({ title: "Mots de passe différents", variant: "destructive" });
    }
    setSavingPassword(true);
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    setSavingPassword(false);
    if (error) return toast({ title: "Erreur", description: error.message, variant: "destructive" });
    setNewPassword(""); setConfirmPassword("");
    toast({ title: "Mot de passe modifié" });
  };

  // Avatar upload
  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!user || !e.target.files?.[0]) return;
    setUploadingAvatar(true);
    const file = e.target.files[0];
    const ext = file.name.split('.').pop();
    const filePath = `avatars/${user.id}.${ext}`;
    const { error: uploadError } = await supabase.storage.from('avatars').upload(filePath, file, { upsert: true });
    if (uploadError) {
      toast({ title: t("auth.authError"), description: uploadError.message, variant: "destructive" });
      setUploadingAvatar(false);
      return;
    }
    const { data } = supabase.storage.from('avatars').getPublicUrl(filePath);
    setAvatarUrl(data.publicUrl);
    // Update profile
    await supabase.from('profiles').update({ avatar_url: data.publicUrl }).eq('id', user.id);
    setUploadingAvatar(false);
    toast({ title: "Avatar mis à jour" });
  };

  // Email update
  const handleEmailChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !emailEdit || emailEdit === user.email) return;
    setSavingEmail(true);
    const { error } = await supabase.auth.updateUser({ email: emailEdit });
    setSavingEmail(false);
    if (error) return toast({ title: "Erreur", description: error.message, variant: "destructive" });
    toast({ title: "E-mail modifié", description: "Vérifiez votre boîte de réception pour confirmer." });
  };



  const initials = (fullName || user.email || "?").split(/\s|@/).map((s) => s[0]).slice(0, 2).join("").toUpperCase();

  // Préférences notifications
  const [notifNews, setNotifNews] = useState(false);
  const [notifReply, setNotifReply] = useState(false);
  const [savingNotif, setSavingNotif] = useState(false);

  useEffect(() => {
    if (!user) return;
    supabase.from("profiles").select("notif_news, notif_reply").eq("id", user.id).maybeSingle().then(({ data }) => {
      if (data) {
        setNotifNews(!!data.notif_news);
        setNotifReply(!!data.notif_reply);
      }
    });
  }, [user]);


  const saveNotif = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSavingNotif(true);
    const { error } = await supabase
      .from("profiles")
      .update({ notif_news: notifNews, notif_reply: notifReply })
      .eq("id", user.id);
    setSavingNotif(false);
    if (error) return toast({ title: "Erreur", description: error.message, variant: "destructive" });
    toast({ title: "Préférences mises à jour" });
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/auth");
  };

  if (loading) {
    return <div className="flex justify-center items-center h-screen">Chargement...</div>;
  }

  if (!user) {
    return null;
  }

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Navbar />
      <main className="flex-1 max-w-4xl mx-auto w-full px-4 py-8 md:py-12">
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <h1 className="text-4xl md:text-5xl font-display text-gold">{t("account.title")}</h1>
          <Button asChild variant="secondary" size="sm">
            <Link to="/collections">Voir mes collections</Link>
          </Button>
        </div>

        {/* Avatar et Email */}
        <Card className="mb-6 border-gold/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 font-display">
              <User className="w-5 h-5 text-gold" /> {t("account.myProfile")}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <Label className="mb-2">{t("account.avatar")}</Label>
              <div className="flex items-center gap-4">
                <UserAvatar src={avatarUrl} name={fullName || user.email || "Utilisateur"} className="w-16 h-16" />
                <Label htmlFor="avatar-upload" className="cursor-pointer">
                  <Button type="button" variant="outline" asChild>
                    <span>
                      <Upload className="w-4 h-4" /> {t("account.upload")}
                    </span>
                  </Button>
                  <input id="avatar-upload" type="file" accept="image/*" onChange={handleAvatarChange} disabled={uploadingAvatar} hidden />
                </Label>
                <Button asChild variant="secondary" size="sm">
                  <Link to={`/profile/${user.id}`}>{t("account.viewPublicProfile")}</Link>
                </Button>
              </div>
            </div>

            <div>
              <Label className="mb-2">E-mail: <strong>{user.email}</strong></Label>
              <div className="flex items-center gap-2 mb-4">
                {emailVerified ? (
                  <>
                    <MailCheck className="w-5 h-5 text-green-600" />
                    <span className="text-sm text-green-600">{t("account.verified")}</span>
                  </>
                ) : (
                  <>
                    <MailWarning className="w-5 h-5 text-orange-500" />
                    <span className="text-sm text-orange-500">{t("account.notVerified")}</span>
                  </>
                )}
              </div>
              <form onSubmit={handleEmailChange} className="flex gap-2 mb-4">
                <Input type="email" value={emailEdit} onChange={(e) => setEmailEdit(e.target.value)} />
                <Button type="submit" variant="hero" disabled={savingEmail}>
                  {savingEmail ? t("account.saving") : t("account.update")}
                </Button>
              </form>
              {!emailVerified && (
                <Button onClick={async () => {
                  setResendLoading(true);
                  const { error } = await supabase.auth.resend({ type: "signup", email: user.email });
                  setResendLoading(false);
                  if (error) return toast({ title: t("auth.authError"), description: error.message, variant: "destructive" });
                  toast({ title: t("account.confirmationSent"), description: t("account.confirmationSentDescription") });
                }} disabled={resendLoading} variant="outline" size="sm">
                  {resendLoading ? t("account.sending") : t("account.resendConfirmation")}
                </Button>
              )}
            </div>

            {createdAt && (
              <div className="text-sm text-muted-foreground">
                {t("account.accountCreated", { date: new Date(createdAt).toLocaleDateString(locale === "fr" ? "fr-FR" : locale === "es" ? "es-ES" : "en-US") })}
              </div>
            )}

            {isAdmin && <Badge className="bg-gold text-background">Administrateur</Badge>}
          </CardContent>
        </Card>

        {/* Notifications */}
        <Card className="mb-6 border-gold/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 font-display">
              <Shield className="w-5 h-5 text-gold" /> {t("account.notificationPreferences")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={(e) => {
              e.preventDefault();
              saveNotif(e);
            }} className="space-y-4">
              <div className="flex items-center justify-between">
                <label htmlFor="notif-news">{t("account.notifNews")}</label>
                <input id="notif-news" type="checkbox" checked={notifNews} onChange={(e) => setNotifNews(e.target.checked)} />
              </div>
              <div className="flex items-center justify-between">
                <label htmlFor="notif-reply">{t("account.notifReply")}</label>
                <input id="notif-reply" type="checkbox" checked={notifReply} onChange={(e) => setNotifReply(e.target.checked)} />
              </div>
              <Button type="submit" variant="hero" disabled={savingNotif}>
                {savingNotif ? t("account.saving") : t("account.saveNotificationPreferences")}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Support */}
        <Card className="mb-6 border-gold/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 font-display">
              <User className="w-5 h-5 text-gold" /> {t("account.support")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-2">{t("account.supportPrompt")}</p>
            <a href="mailto:contact@leregnemillenaire.com" className="underline text-gold">{t("account.contactSupport")}</a>
          </CardContent>
        </Card>
        <Card className="mb-6 border-gold/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 font-display">
              <User className="w-5 h-5 text-gold" /> {t("account.profileDetails")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={saveProfile} className="space-y-4">
              <div>
                <Label htmlFor="name">{t("account.fullName")}</Label>
                <Input id="name" value={fullName} onChange={(e) => setFullName(e.target.value)} maxLength={100} />
              </div>
              <div>
                <Label htmlFor="phone">{t("account.phoneNumber")}</Label>
                <PhoneInput
                  international
                  country="FR"
                  id="phone"
                  value={phone || undefined}
                  onChange={(value) => setPhone(value ?? "")}
                  placeholder="+33 6 12 34 56 78"
                  className="w-full rounded-xl border border-border bg-transparent py-3 pl-4 pr-4 text-sm text-foreground outline-none transition focus:border-gold focus:ring-2 focus:ring-gold/20"
                />
              </div>
              <div>
                <Label htmlFor="country">{t("account.country")}</Label>
                <CountrySelect value={country} onChange={setCountry} placeholder={t("account.countryPlaceholder")} />
              </div>
              <div>
                <Label htmlFor="bio">{t("account.bio")}</Label>
                <Textarea
                  id="bio"
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  rows={4}
                  maxLength={500}
                  placeholder={t("account.bioPlaceholder")}
                />
              </div>
              <Button type="submit" variant="hero" disabled={savingProfile}>
                {savingProfile ? t("account.saving") : t("account.save")}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Mot de passe */}
        <Card className="mb-6 border-gold/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 font-display">
              <Lock className="w-5 h-5 text-gold" /> {t("account.changePassword")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={changePassword} className="space-y-4">
              <div>
                <Label htmlFor="new-pw">{t("account.newPassword")}</Label>
                <Input id="new-pw" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} minLength={6} required />
              </div>
              <div>
                <Label htmlFor="confirm-pw">{t("account.confirmPassword")}</Label>
                <Input id="confirm-pw" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} minLength={6} required />
              </div>
              <Button type="submit" variant="hero" disabled={savingPassword}>
                {savingPassword ? t("account.saving") : t("account.update")}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Déconnexion */}
        <Card className="border-destructive/30">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-foreground">{t("account.signOut")}</h3>
              <p className="text-sm text-muted-foreground">{t("account.signOutDescription")}</p>
            </div>
            <Button variant="outline" onClick={handleSignOut}>
              <LogOut className="w-4 h-4" /> {t("account.signOut")}
            </Button>
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  );
};

export default Account;
