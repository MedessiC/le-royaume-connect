import { useEffect, useState } from "react";
import PhoneInput, { isValidPhoneNumber } from "react-phone-number-input";
import "react-phone-number-input/style.css";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Mail, Lock, User, ArrowLeft, Eye, EyeOff,
  Phone, ChevronRight, ChevronLeft, Loader2
} from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "@/i18n";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { signInWithGoogle } from "@/integrations/google";
import { useAuth } from "@/hooks/useAuth";

// ── Validation schemas ────────────────────────────────────────────────
const emailSchema = z.string().trim().email({ message: "Email invalide" }).max(255);
const passwordSchema = z.string().min(6, { message: "Mot de passe : 6 caractères min" }).max(72);
const nameSchema = z.string().trim().min(1, { message: "Nom requis" }).max(100);
const phoneSchema = z
  .string()
  .trim()
  .min(1, { message: "Numéro de téléphone requis" })
  .refine((v) => isValidPhoneNumber(v), { message: "Numéro de téléphone invalide" });

// ── Floating label input ──────────────────────────────────────────────
interface FieldProps {
  id: string;
  label: string;
  type?: string;
  value: string;
  onChange: (v: string) => void;
  icon: React.ReactNode;
  placeholder?: string;
  required?: boolean;
  autoComplete?: string;
  suffix?: React.ReactNode;
}

function Field({ id, label, type = "text", value, onChange, icon, placeholder, required, autoComplete, suffix }: FieldProps) {
  return (
    <div className="relative">
      <Label
        htmlFor={id}
        className={`absolute left-11 transition-all duration-200 pointer-events-none z-10 font-body ${
          value
            ? "top-1.5 text-[10px] font-semibold text-gold/80 tracking-wide uppercase"
            : "top-1/2 -translate-y-1/2 text-sm text-muted-foreground"
        }`}
      >
        {label}
      </Label>
      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground/70 z-10">
        {icon}
      </span>
      <Input
        id={id}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={value ? placeholder : ""}
        required={required}
        autoComplete={autoComplete}
        className={`pl-11 pr-10 h-14 rounded-xl border bg-card/60 backdrop-blur-sm text-foreground font-body text-sm
          transition-all duration-200
          border-border/60 hover:border-border
          focus:border-gold/60 focus:ring-2 focus:ring-gold/15 focus:bg-card
          ${value ? "pt-5 pb-1" : ""}
        `}
      />
      {suffix && (
        <span className="absolute right-3.5 top-1/2 -translate-y-1/2 z-10">
          {suffix}
        </span>
      )}
    </div>
  );
}

// ── Password strength meter ───────────────────────────────────────────
function PasswordStrength({ password }: { password: string }) {
  if (!password) return null;
  const score =
    (password.length >= 8 ? 1 : 0) +
    (/[A-Z]/.test(password) ? 1 : 0) +
    (/[0-9]/.test(password) ? 1 : 0) +
    (/[^A-Za-z0-9]/.test(password) ? 1 : 0);

  const labels = ["Faible", "Moyen", "Bon", "Fort"];
  const colors = ["bg-destructive", "bg-amber-500", "bg-emerald-400", "bg-gold"];
  const textColors = ["text-destructive", "text-amber-500", "text-emerald-400", "text-gold"];

  return (
    <div className="flex items-center gap-2 px-1">
      <div className="flex gap-1 flex-1">
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className={`h-1 flex-1 rounded-full transition-all duration-300 ${
              i < score ? colors[score - 1] : "bg-border"
            }`}
          />
        ))}
      </div>
      <span className={`text-[10px] font-semibold uppercase tracking-wider ${textColors[score - 1] || "text-muted-foreground"}`}>
        {score > 0 ? labels[score - 1] : ""}
      </span>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────
const Auth = () => {
  const [mode, setMode] = useState<"login" | "signup" | "forgot">("login");
  const [signupStep, setSignupStep] = useState<1 | 2>(1);
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [resetCooldown, setResetCooldown] = useState(0);
  const { toast } = useToast();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  const from = (location.state as { from?: { pathname: string } } | null)?.from?.pathname ?? "/feed";

  const buildAuthError = (error: unknown) => {
    const raw = typeof error === "string" ? error : (error as any)?.message ?? "Une erreur est survenue";
    const message = String(raw);
    if (/invalid login credentials|invalid password/i.test(message))
      return { title: t("auth.invalidCredentials"), description: t("auth.invalidCredentialsDescription") };
    if (/email not confirmed|not confirmed|confirm your email|email verification/i.test(message))
      return { title: t("auth.emailNotConfirmed"), description: t("auth.emailNotConfirmedDescription") };
    if (/already registered|already exists|duplicate|already a member|user already exists/i.test(message))
      return { title: t("auth.emailTaken"), description: t("auth.emailTakenDescription") };
    if (/invalid email|email invalide/i.test(message))
      return { title: t("auth.invalidEmail"), description: t("auth.invalidEmailDescription") };
    if (/password/i.test(message) && /weak|min|short|6/i.test(message))
      return { title: t("auth.invalidPassword"), description: t("auth.invalidPasswordDescription") };
    if (/network|timeout|service unavailable/i.test(message))
      return { title: t("auth.connectionError"), description: t("auth.connectionErrorDescription") };
    return { title: t("auth.authError"), description: message };
  };

  useEffect(() => {
    if (user) navigate(from, { replace: true });
  }, [user, navigate, from]);

  const validateSignupStep1 = () => {
    if (!name.trim()) {
      toast({ title: t("auth.nameRequired"), description: t("auth.nameRequiredDescription"), variant: "destructive" });
      return false;
    }
    if (!phone.trim()) {
      toast({ title: "Numéro de téléphone requis", description: "Veuillez renseigner votre numéro de téléphone", variant: "destructive" });
      return false;
    }
    if (!isValidPhoneNumber(phone)) {
      toast({ title: "Numéro invalide", description: "Veuillez entrer un numéro de téléphone valide", variant: "destructive" });
      return false;
    }
    return true;
  };

  const handleNextStep = () => {
    if (validateSignupStep1()) {
      setSignupStep(2);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (mode === "signup" && signupStep === 1) {
      handleNextStep();
      return;
    }

    setLoading(true);
    try {
      const emailV = emailSchema.parse(email);

      if (mode === "signup") {
        const nameV = nameSchema.parse(name);
        const passwordV = passwordSchema.parse(password);
        const phoneV = phoneSchema.parse(phone);

        if (passwordV !== confirmPassword) {
          toast({ title: t("auth.passwordMismatch"), description: t("auth.passwordMismatchDescription"), variant: "destructive" });
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
        navigate("/auth/check-email", { state: { email: emailV } });
        return;
      }

      if (mode === "forgot") {
        if (resetCooldown > 0) {
          toast({ title: "Patientez", description: `Attendez ${resetCooldown}s avant un nouvel envoi.`, variant: "destructive" });
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
      const { error } = await supabase.auth.signInWithPassword({ email: emailV, password: passV });
      if (error) throw error;
      toast({ title: t("auth.signInSuccess"), description: t("auth.signInSuccessDescription") });
      navigate(from, { replace: true });
    } catch (err) {
      console.error("Supabase auth error", err);
      toast({ ...buildAuthError(err), variant: "destructive" });
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
  };

  useEffect(() => {
    if (resetCooldown <= 0) return;
    const interval = setInterval(() => setResetCooldown((s) => (s > 0 ? s - 1 : 0)), 1000);
    return () => clearInterval(interval);
  }, [resetCooldown]);

  const switchMode = (next: "login" | "signup" | "forgot") => {
    setMode(next);
    setSignupStep(1);
    setPassword("");
    setConfirmPassword("");
  };

  // ── titles & CTAs ──────────────────────────────────────────────────
  const heading =
    mode === "login" ? "Bon retour parmi nous" :
    mode === "signup"
      ? (signupStep === 1 ? "Informations personnelles" : "Créer vos identifiants")
      : "Réinitialiser le mot de passe";

  const subheading =
    mode === "login" ? "Connectez-vous à votre espace MILLENIUM" :
    mode === "signup"
      ? (signupStep === 1 ? "Étape 1 sur 2 : Présentez-vous" : "Étape 2 sur 2 : Sécurisez votre accès")
      : "Nous vous enverrons un lien de réinitialisation";

  const ctaLabel =
    mode === "login" ? "Se connecter" :
    mode === "signup"
      ? (signupStep === 1 ? "Continuer" : "Créer mon compte")
      : resetCooldown > 0 ? `Renvoyer dans ${resetCooldown}s` : "Envoyer le lien";

  return (
    <div className="min-h-screen flex bg-background overflow-hidden">

      {/* ── Left Panel — Brand ─────────────────────────────────────── */}
      <div className="hidden lg:flex lg:w-[46%] relative flex-col justify-between p-12 bg-gradient-hero overflow-hidden">
        {/* Grid overlay */}
        <div className="absolute inset-0 hero-grid-overlay opacity-40 pointer-events-none" />

        {/* Glow orbs */}
        <div className="absolute top-1/4 left-1/4 w-72 h-72 rounded-full bg-gold/8 blur-[80px] pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full bg-royal/20 blur-[100px] pointer-events-none" />

        {/* Top logo (without star icon) */}
        <div className="relative z-10">
          <Link to="/" className="inline-flex items-center group">
            <span className="font-display font-black text-white tracking-[0.18em] text-lg hover:text-gold transition-colors">MILLENIUM</span>
          </Link>
        </div>

        {/* Center content */}
        <div className="relative z-10 flex flex-col gap-8">
          {/* Eyebrow */}
          <div className="hero-badge self-start">
            <span className="hero-badge-dot" />
            <span className="hero-badge-text">Le Règne Millénaire</span>
          </div>

          <div>
            <h1 className="font-serif text-4xl xl:text-5xl font-bold italic text-gold leading-tight mb-4">
              La foi au cœur<br />du numérique
            </h1>
            <p className="text-white/65 font-body text-base leading-relaxed max-w-sm">
              Accédez à des milliers d'enseignements, rejoignez une communauté mondiale et vivez votre foi au quotidien.
            </p>
          </div>

          {/* Stats strip */}
          <div className="flex gap-8 pt-4 border-t border-white/10">
            {[
              { value: "10K+", label: "Disciples" },
              { value: "500+", label: "Enseignements" },
              { value: "30+", label: "Pays" },
            ].map((stat) => (
              <div key={stat.label}>
                <p className="font-serif font-bold text-gold text-2xl italic">{stat.value}</p>
                <p className="text-white/50 text-xs font-body mt-0.5">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom testimonial */}
        <div className="relative z-10 bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-4">
          <p className="text-white/75 text-sm font-body italic leading-relaxed">
            "Les enseignements de MILLENIUM ont transformé ma vie. La vision de ZOVIZO est un phare pour notre génération."
          </p>
          <div className="flex items-center gap-2 mt-3">
            <div className="w-7 h-7 rounded-full bg-gold/30 flex items-center justify-center text-gold text-xs font-bold">
              M
            </div>
            <div>
              <p className="text-white/80 text-xs font-semibold">Marie K.</p>
              <p className="text-white/40 text-[10px]">Membre depuis 2021</p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Right Panel — Form ────────────────────────────────────── */}
      <div className="flex-1 flex flex-col items-center justify-center px-5 py-10 sm:px-10 relative">
        {/* Mobile brand + back */}
        <div className="w-full max-w-md mb-6 flex items-center justify-between lg:justify-end">
          <Link to="/" className="lg:hidden inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-gold transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Retour
          </Link>
          <Link to="/" className="hidden lg:inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-gold transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Accueil
          </Link>
        </div>

        <div className="w-full max-w-md">

          {/* ── Header ── */}
          <div className="mb-8">
            {/* Mobile logo (without star icon) */}
            <div className="flex items-center mb-6 lg:hidden">
              <span className="font-display font-black text-foreground tracking-[0.18em] text-lg">MILLENIUM</span>
            </div>

            <h2 className="font-display text-2xl sm:text-3xl font-bold text-foreground tracking-tight mb-1">
              {heading}
            </h2>
            <p className="text-muted-foreground text-sm font-body">
              {subheading}
            </p>
          </div>

          {/* ── Mode tabs (login / signup) ── */}
          {mode !== "forgot" && (
            <div className="flex bg-secondary/60 rounded-xl p-1 mb-7 border border-border/60">
              {(["login", "signup"] as const).map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => switchMode(m)}
                  className={`flex-1 py-2 rounded-lg text-sm font-semibold font-body transition-all duration-200 ${
                    mode === m
                      ? "bg-card shadow-sm text-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {m === "login" ? "Connexion" : "Inscription"}
                </button>
              ))}
            </div>
          )}

          {/* ── Progressive step progress bar (signup only) ── */}
          {mode === "signup" && (
            <div className="w-full h-1.5 bg-secondary rounded-full overflow-hidden mb-6 flex gap-1">
              <div className={`h-full flex-1 rounded-full transition-all duration-300 ${signupStep >= 1 ? "bg-gold" : "bg-border"}`} />
              <div className={`h-full flex-1 rounded-full transition-all duration-300 ${signupStep >= 2 ? "bg-gold" : "bg-border"}`} />
            </div>
          )}

          {/* ── Google SSO ── */}
          {mode !== "forgot" && (mode === "login" || (mode === "signup" && signupStep === 1)) && (
            <button
              type="button"
              onClick={handleGoogle}
              disabled={loading}
              className="w-full h-12 flex items-center justify-center gap-3 rounded-xl border border-border/80 bg-card hover:bg-secondary/80 hover:border-border transition-all duration-200 text-sm font-semibold font-body text-foreground mb-5 group disabled:opacity-50"
            >
              <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              <span>Continuer avec Google</span>
              <ChevronRight className="w-3.5 h-3.5 text-muted-foreground group-hover:translate-x-0.5 transition-transform" />
            </button>
          )}

          {/* ── Divider ── */}
          {mode !== "forgot" && (mode === "login" || (mode === "signup" && signupStep === 1)) && (
            <div className="flex items-center gap-3 mb-5">
              <div className="flex-1 h-px bg-border/60" />
              <span className="text-[11px] font-body font-medium text-muted-foreground uppercase tracking-wider">ou</span>
              <div className="flex-1 h-px bg-border/60" />
            </div>
          )}

          {/* ── Form ── */}
          <form onSubmit={handleSubmit} className="space-y-3">

            {/* signup STEP 1: Personal Info */}
            {mode === "signup" && signupStep === 1 && (
              <>
                <Field
                  id="auth-name"
                  label="Nom complet"
                  value={name}
                  onChange={setName}
                  icon={<User className="w-4 h-4" />}
                  placeholder="Jean Dupont"
                  required
                  autoComplete="name"
                />
                {/* Phone */}
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground/70 z-10">
                    <Phone className="w-4 h-4" />
                  </span>
                  <PhoneInput
                    id="auth-phone"
                    country="BJ"
                    international
                    value={phone || undefined}
                    onChange={(v) => setPhone(v ?? "")}
                    placeholder="Numéro de téléphone"
                    className="w-full h-14 rounded-xl border border-border/60 bg-card/60 pl-11 pr-4 text-sm text-foreground font-body backdrop-blur-sm transition-all duration-200 hover:border-border focus-within:border-gold/60 focus-within:ring-2 focus-within:ring-gold/15 focus-within:bg-card outline-none"
                  />
                </div>
              </>
            )}

            {/* signup STEP 2: Credentials */}
            {mode === "signup" && signupStep === 2 && (
              <>
                <Field
                  id="auth-email"
                  label="Adresse e-mail"
                  type="email"
                  value={email}
                  onChange={setEmail}
                  icon={<Mail className="w-4 h-4" />}
                  placeholder="nom@exemple.com"
                  required
                  autoComplete="email"
                />
                <div className="space-y-1.5">
                  <Field
                    id="auth-password"
                    label="Mot de passe"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={setPassword}
                    icon={<Lock className="w-4 h-4" />}
                    placeholder="6 caractères minimum"
                    required
                    autoComplete="new-password"
                    suffix={
                      <button
                        type="button"
                        tabIndex={-1}
                        onClick={() => setShowPassword((s) => !s)}
                        className="text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    }
                  />
                  <PasswordStrength password={password} />
                </div>
                <Field
                  id="auth-confirm-password"
                  label="Confirmer le mot de passe"
                  type={showConfirm ? "text" : "password"}
                  value={confirmPassword}
                  onChange={setConfirmPassword}
                  icon={<Lock className="w-4 h-4" />}
                  placeholder="Répétez le mot de passe"
                  required
                  autoComplete="new-password"
                  suffix={
                    <button
                      type="button"
                      tabIndex={-1}
                      onClick={() => setShowConfirm((s) => !s)}
                      className="text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  }
                />
              </>
            )}

            {/* Login Fields */}
            {mode === "login" && (
              <>
                <Field
                  id="auth-email"
                  label="Adresse e-mail"
                  type="email"
                  value={email}
                  onChange={setEmail}
                  icon={<Mail className="w-4 h-4" />}
                  placeholder="nom@exemple.com"
                  required
                  autoComplete="email"
                />
                <div className="space-y-1.5">
                  <Field
                    id="auth-password"
                    label="Mot de passe"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={setPassword}
                    icon={<Lock className="w-4 h-4" />}
                    placeholder="Votre mot de passe"
                    required
                    autoComplete="current-password"
                    suffix={
                      <button
                        type="button"
                        tabIndex={-1}
                        onClick={() => setShowPassword((s) => !s)}
                        className="text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    }
                  />
                </div>
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() => switchMode("forgot")}
                    className="text-xs font-body text-muted-foreground hover:text-gold transition-colors"
                  >
                    Mot de passe oublié ?
                  </button>
                </div>
              </>
            )}

            {/* Forgot Fields */}
            {mode === "forgot" && (
              <Field
                id="auth-email"
                label="Adresse e-mail"
                type="email"
                value={email}
                onChange={setEmail}
                icon={<Mail className="w-4 h-4" />}
                placeholder="nom@exemple.com"
                required
                autoComplete="email"
              />
            )}

            {/* Submit / Action buttons */}
            <div className="flex flex-col gap-2 pt-2">
              <button
                type="submit"
                disabled={loading || (mode === "forgot" && resetCooldown > 0)}
                className="w-full h-12 flex items-center justify-center gap-2 rounded-xl
                  bg-gold hover:bg-gold/90 active:scale-[0.98]
                  text-slate-950 font-display font-bold text-sm tracking-wide
                  transition-all duration-200
                  shadow-gold hover:shadow-xl
                  disabled:opacity-60 disabled:cursor-not-allowed disabled:active:scale-100"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <span>{ctaLabel}</span>
                    <ChevronRight className="w-4 h-4" />
                  </>
                )}
              </button>

              {/* Back to Step 1 button for registration */}
              {mode === "signup" && signupStep === 2 && (
                <button
                  type="button"
                  onClick={() => setSignupStep(1)}
                  className="w-full h-12 flex items-center justify-center gap-2 rounded-xl border border-border/80 hover:bg-secondary/40 text-sm font-semibold font-body text-muted-foreground transition-all duration-200"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Retour aux informations</span>
                </button>
              )}
            </div>
          </form>

          {/* ── Footer links ── */}
          <div className="mt-6 text-center space-y-2">
            {mode === "forgot" && (
              <button
                type="button"
                onClick={() => switchMode("login")}
                className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-gold font-body transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                Retour à la connexion
              </button>
            )}

            {mode !== "forgot" && (
              <p className="text-xs text-muted-foreground font-body">
                {mode === "login" ? "Pas encore de compte ? " : "Déjà membre ? "}
                <button
                  type="button"
                  onClick={() => switchMode(mode === "login" ? "signup" : "login")}
                  className="text-gold hover:text-gold/80 font-semibold underline-offset-2 hover:underline transition-colors"
                >
                  {mode === "login" ? "Créer un compte" : "Se connecter"}
                </button>
              </p>
            )}

            <p className="text-[10px] text-muted-foreground/60 font-body pt-2">
              En continuant, vous acceptez nos{" "}
              <span className="underline underline-offset-2 cursor-pointer hover:text-muted-foreground transition-colors">conditions d'utilisation</span>
              {" "}et notre{" "}
              <span className="underline underline-offset-2 cursor-pointer hover:text-muted-foreground transition-colors">politique de confidentialité</span>.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;
