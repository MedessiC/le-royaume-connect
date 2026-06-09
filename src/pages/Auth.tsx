import { useEffect, useState } from "react";
import PhoneInput, { isValidPhoneNumber } from "react-phone-number-input";
import "react-phone-number-input/style.css";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Mail, Lock, User, ArrowLeft } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "@/i18n";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { signInWithGoogle } from "@/integrations/google";
import { useAuth } from "@/hooks/useAuth";

const emailSchema = z.string().trim().email({ message: "Email invalide" }).max(255);
const passwordSchema = z.string().min(6, { message: "Mot de passe : 6 caractères min" }).max(72);
const nameSchema = z.string().trim().min(1, { message: "Nom requis" }).max(100);
const phoneSchema = z.string().trim().min(1, { message: "Numéro de téléphone requis" }).refine((value) => isValidPhoneNumber(value), { message: "Numéro de téléphone invalide" });

const Auth = () => {
  const [mode, setMode] = useState<"login" | "signup" | "forgot">("login");
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [status, setStatus] = useState<string | null>(null);
  const [resetCooldown, setResetCooldown] = useState<number>(0);
  const { toast } = useToast();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  const from = (location.state as { from?: { pathname: string } } | null)?.from?.pathname ?? "/feed";

  const buildAuthError = (error: unknown) => {
    const raw = typeof error === "string" ? error : (error as any)?.message ?? "Une erreur est survenue";
    const message = String(raw);

    if (/invalid login credentials|invalid password/i.test(message)) {
      return {
        title: t("auth.invalidCredentials"),
        description: t("auth.invalidCredentialsDescription"),
      };
    }

    if (/email not confirmed|not confirmed|confirm your email|email verification/i.test(message)) {
      return {
        title: t("auth.emailNotConfirmed"),
        description: t("auth.emailNotConfirmedDescription"),
      };
    }

    if (/already registered|already exists|duplicate|already a member|user already exists/i.test(message)) {
      return {
        title: t("auth.emailTaken"),
        description: t("auth.emailTakenDescription"),
      };
    }

    if (/invalid email|email invalide/i.test(message)) {
      return {
        title: t("auth.invalidEmail"),
        description: t("auth.invalidEmailDescription"),
      };
    }

    if (/password/i.test(message) && /weak|min|short|6/i.test(message)) {
      return {
        title: t("auth.invalidPassword"),
        description: t("auth.invalidPasswordDescription"),
      };
    }

    if (/network|timeout|service unavailable/i.test(message)) {
      return {
        title: t("auth.connectionError"),
        description: t("auth.connectionErrorDescription"),
      };
    }

    return {
      title: t("auth.authError"),
      description: message,
    };
  };

  useEffect(() => {
    if (user) navigate(from, { replace: true });
  }, [user, navigate, from]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStatus(null);
    setLoading(true);

    try {
      const emailV = emailSchema.parse(email);

      if (mode === "signup") {
        if (!name.trim()) {
          toast({ title: t("auth.nameRequired"), description: t("auth.nameRequiredDescription"), variant: "destructive" });
          setLoading(false);
          return;
        }

        const nameV = nameSchema.parse(name);
        const passwordV = passwordSchema.parse(password);
        const phoneV = phoneSchema.parse(phone);

        if (passwordV !== confirmPassword) {
          toast({ title: t("auth.passwordMismatch"), description: t("auth.passwordMismatchDescription"), variant: "destructive" });
          setLoading(false);
          return;
        }

        const { data, error } = await supabase.auth.signUp({
          email: emailV,
          password: passwordV,
          options: {
            emailRedirectTo: `${window.location.origin}/auth`,
            data: { full_name: nameV, phone_number: phoneV },
          },
        });

        if (error) throw error;
        if (!data) throw new Error("Impossible de créer le compte pour le moment.");

        toast({ title: t("auth.signUpSuccess"), description: t("auth.checkEmail") });
        setLoading(false);
        navigate("/auth/check-email", { state: { email: emailV } });
        return;
      }

      if (mode === "forgot") {
        if (resetCooldown > 0) {
          toast({ title: "Patientez", description: `Veuillez attendre ${resetCooldown}s avant de demander un nouveau lien.`, variant: "destructive" });
          setLoading(false);
          return;
        }

        await supabase.auth.resetPasswordForEmail(emailV, {
          redirectTo: `${window.location.origin}/auth/reset`,
        });

        toast({ title: t("auth.resetSuccess"), description: t("auth.checkEmail") });
        setMode("login");
        setPassword("");
        setResetCooldown(60);
        return;
      }

      const passV = passwordSchema.parse(password);
      const { error } = await supabase.auth.signInWithPassword({
        email: emailV,
        password: passV,
      });
      if (error) throw error;

      toast({ title: t("auth.signInSuccess"), description: t("auth.signInSuccessDescription") });
      navigate(from, { replace: true });
    } catch (err) {
      console.error("Supabase auth error", err);
      const nextToast = buildAuthError(err);
      toast({ ...nextToast, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setLoading(true);
    const result = await signInWithGoogle();
    if (!result.success) {
      toast({ title: "Erreur Google", description: result.error || "Une erreur est survenue", variant: "destructive" });
      setLoading(false);
    }
    // If successful, signInWithGoogle will redirect
  };

  // cooldown timer for reset requests
  useEffect(() => {
    if (resetCooldown <= 0) return;
    const t = setInterval(() => setResetCooldown((s) => (s > 0 ? s - 1 : 0)), 1000);
    return () => clearInterval(t);
  }, [resetCooldown]);

  return (
    <div className="min-h-screen bg-gradient-hero flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <Link to="/" className="inline-flex items-center gap-2 text-gold/70 hover:text-gold text-sm font-body mb-8 transition-colors">
          <ArrowLeft className="w-4 h-4" />
          {t("auth.returnHome")}
        </Link>

        <div className="bg-card rounded-lg shadow-royal p-8 border border-border">
          <div className="flex items-center justify-center gap-2 mb-2">
            <span className="font-display text-lg font-bold text-foreground">MILLENIUM</span>
          </div>
          <p className="text-center text-muted-foreground text-sm font-body mb-6">
            {mode === "login" ? t("auth.loginTitle") : mode === "signup" ? t("auth.signupTitle") : t("auth.resetTitle")}
          </p>

          <Button type="button" variant="outline" className="w-full mb-4" onClick={handleGoogle} disabled={loading}>
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            {t("auth.googleButton")}
          </Button>

          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-border" /></div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-2 text-muted-foreground">{t("auth.orDivider")}</span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === "signup" && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="name" className="font-body text-sm">{t("auth.nameLabel")}</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder={t("auth.namePlaceholder")} className="pl-10 font-body" required />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone" className="font-body text-sm">{t("auth.phoneLabel")}</Label>
                  <PhoneInput
                    country="FR"
                    international
                    id="phone"
                    value={phone || undefined}
                    onChange={(value) => setPhone(value ?? "")}
                    placeholder={t("auth.phonePlaceholder")}
                    className="w-full rounded-xl border border-border bg-transparent py-3 pl-4 pr-4 text-sm text-foreground outline-none transition focus:border-gold focus:ring-2 focus:ring-gold/20"
                  />
                </div>
              </>
            )}

            <div className="space-y-2">
              <Label htmlFor="email" className="font-body text-sm">{t("auth.emailLabel")}</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder={t("auth.emailPlaceholder")} className="pl-10 font-body" required />
              </div>
            </div>

            {mode !== "forgot" && (
              <div className="space-y-2">
                <Label htmlFor="password" className="font-body text-sm">{t("auth.passwordLabel")}</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder={t("auth.passwordPlaceholder")} className="pl-10 font-body" required />
                </div>
              </div>
            )}

            {mode === "signup" && (
              <div className="space-y-2">
                <Label htmlFor="confirm-password" className="font-body text-sm">{t("auth.confirmPasswordLabel")}</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input id="confirm-password" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder={t("auth.confirmPasswordPlaceholder")} className="pl-10 font-body" required />
                </div>
              </div>
            )}

            <Button type="submit" variant="hero" className="w-full" size="lg" disabled={loading}>
              {loading ? "..." : mode === "login" ? t("auth.loginButton") : mode === "signup" ? t("auth.signupButton") : t("auth.resetButton")}
            </Button>
          </form>

          <div className="mt-6 text-center">
            {mode !== "forgot" ? (
              <>
                <button type="button" onClick={() => setMode(mode === "login" ? "signup" : "login")} className="text-sm text-muted-foreground hover:text-gold font-body transition-colors">
                  {mode === "login" ? t("auth.noAccount") : t("auth.hasAccount")}
                </button>
                <div className="mt-3">
                  <button type="button" onClick={() => setMode("forgot")} className="text-sm text-muted-foreground hover:text-gold">
                    {t("auth.forgotPassword")}
                  </button>
                </div>
              </>
            ) : (
              <div>
                <button type="button" onClick={() => setMode("login")} className="text-sm text-muted-foreground hover:text-gold">
                  {t("auth.backToLogin")}
                </button>
              </div>
            )}
          </div>
          {status && <div className="mt-4 text-sm text-muted-foreground">{status}</div>}
        </div>
      </div>
    </div>
  );
};

export default Auth;
