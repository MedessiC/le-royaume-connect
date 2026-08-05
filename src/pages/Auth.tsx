import { useEffect, useState } from "react";
import PhoneInput, { isValidPhoneNumber } from "react-phone-number-input";
import "react-phone-number-input/style.css";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Mail, Lock, User, ArrowLeft, Eye, EyeOff,
  Phone, ChevronRight, ChevronLeft, Loader2, Check,
  ShieldCheck, HeartHandshake, Globe, BookOpen, Quote
} from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "@/i18n";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { signInWithGoogle } from "@/integrations/google";
import { useAuth } from "@/hooks/useAuth";

// ── Validation schemas ────────────────────────────────────────────────
const emailSchema = z.string().trim().email({ message: "Adresse e-mail invalide" }).max(255);
const passwordSchema = z.string().min(6, { message: "6 caractères minimum requis" }).max(72);
const nameSchema = z.string().trim().min(1, { message: "Le nom complet est obligatoire" }).max(100);
const phoneSchema = z
  .string()
  .trim()
  .min(1, { message: "Numéro de téléphone requis" })
  .refine((v) => isValidPhoneNumber(v), { message: "Format de téléphone invalide" });

// ── Clean input field component ────────────────────────────────────────
// ── Ultra-professional input field component ────────────────────────────
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
    <div className="space-y-1.5 group">
      <div className="flex items-center justify-between">
        <Label htmlFor={id} className="text-xs font-bold text-foreground/80 group-focus-within:text-gold transition-colors">
          {label} {required && <span className="text-gold">*</span>}
        </Label>
      </div>
      <div className="relative flex items-center">
        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground/70 group-focus-within:text-gold transition-colors z-10 pointer-events-none">
          {icon}
        </span>
        <Input
          id={id}
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          required={required}
          autoComplete={autoComplete}
          className="pl-10 pr-10 h-12 rounded-xl border border-border/80 bg-card text-foreground font-body text-sm font-medium
            transition-all duration-200 shadow-2xs placeholder:text-muted-foreground/50 placeholder:font-normal
            hover:border-border
            focus:border-gold focus:ring-4 focus:ring-gold/15 focus:bg-card outline-none
          "
        />
        {suffix && (
          <span className="absolute right-3.5 top-1/2 -translate-y-1/2 z-10 flex items-center">
            {suffix}
          </span>
        )}
      </div>
    </div>
  );
}

// ── Password Strength Checklist ─────────────────────────────────────────
function PasswordChecklist({ password }: { password: string }) {
  if (!password) return null;

  const checks = [
    { label: "Au moins 8 caractères", pass: password.length >= 8 },
    { label: "Une majuscule (A-Z)", pass: /[A-Z]/.test(password) },
    { label: "Un chiffre (0-9)", pass: /[0-9]/.test(password) },
    { label: "Un symbole spécial (!@#$)", pass: /[^A-Za-z0-9]/.test(password) },
  ];

  const passedCount = checks.filter((c) => c.pass).length;
  const scorePct = (passedCount / checks.length) * 100;

  return (
    <div className="space-y-2 p-3 rounded-xl border border-border/50 bg-muted/20 text-xs">
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Complexité</span>
        <span className={`text-[11px] font-bold ${
          passedCount <= 1 ? "text-destructive" : passedCount === 2 ? "text-amber-500" : passedCount === 3 ? "text-emerald-500" : "text-gold"
        }`}>
          {passedCount <= 1 ? "Faible" : passedCount === 2 ? "Moyen" : passedCount === 3 ? "Fort" : "Excellent"}
        </span>
      </div>
      <div className="h-1.5 w-full rounded-full bg-border/60 overflow-hidden">
        <div
          className={`h-full transition-all duration-300 ${
            passedCount <= 1 ? "bg-destructive" : passedCount === 2 ? "bg-amber-500" : passedCount === 3 ? "bg-emerald-500" : "bg-gold"
          }`}
          style={{ width: `${scorePct}%` }}
        />
      </div>
      <div className="grid grid-cols-2 gap-1.5 pt-1">
        {checks.map((c) => (
          <div key={c.label} className="flex items-center gap-1.5 text-[11px]">
            <div className={`w-3.5 h-3.5 rounded-full flex items-center justify-center shrink-0 ${
              c.pass ? "bg-emerald-500/20 text-emerald-500" : "bg-muted text-muted-foreground/40"
            }`}>
              <Check className="w-2.5 h-2.5" />
            </div>
            <span className={c.pass ? "text-foreground font-medium" : "text-muted-foreground/70"}>
              {c.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Genuine Testimonials ────────────────────────────────────────────────
const TESTIMONIALS = [
  {
    quote: "Les enseignements de MILLENIUM ont éclairé ma compréhension spirituelle et fortifié ma foi au quotidien.",
    author: "Marie K.",
    role: "Membre engagé",
    location: "Cotonou, Bénin"
  },
  {
    quote: "Une communauté authentique, chaleureuse et connectée pour vivre l'Évangile sans frontières.",
    author: "Samuel D.",
    role: "Fidèle auditeur",
    location: "Paris, France"
  },
  {
    quote: "Chaque prédication et étude est une source d'inspiration profonde pour toute notre famille.",
    author: "Emmanuel A.",
    role: "Membre depuis 2022",
    location: "Lomé, Togo"
  }
];

// ── Main Auth Component ────────────────────────────────────────────────
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
  const [rememberMe, setRememberMe] = useState(true);
  const [resetCooldown, setResetCooldown] = useState(0);
  const [activeTestimonial, setActiveTestimonial] = useState(0);

  const { toast } = useToast();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  const from = (location.state as { from?: { pathname: string } } | null)?.from?.pathname ?? "/feed";

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveTestimonial((prev) => (prev + 1) % TESTIMONIALS.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (user) navigate(from, { replace: true });
  }, [user, navigate, from]);

  const buildAuthError = (error: unknown) => {
    const raw = typeof error === "string" ? error : (error as any)?.message ?? "Une erreur est survenue";
    const message = String(raw);
    if (/invalid login credentials|invalid password/i.test(message))
      return { title: "Identifiants incorrects", description: "L'adresse e-mail ou le mot de passe est invalide." };
    if (/email not confirmed|not confirmed|confirm your email|email verification/i.test(message))
      return { title: "E-mail non confirmé", description: "Veuillez vérifier votre boîte de réception pour valider votre compte." };
    if (/already registered|already exists|duplicate|already a member|user already exists/i.test(message))
      return { title: "Compte déjà existant", description: "Un compte est déjà enregistré avec cette adresse e-mail." };
    if (/invalid email|email invalide/i.test(message))
      return { title: "E-mail invalide", description: "Veuillez saisir une adresse e-mail correcte." };
    if (/password/i.test(message) && /weak|min|short|6/i.test(message))
      return { title: "Mot de passe trop faible", description: "Le mot de passe doit comporter au moins 6 caractères." };
    if (/network|timeout|service unavailable/i.test(message))
      return { title: "Erreur de connexion", description: "Vérifiez votre connexion internet et réessayez." };
    return { title: "Erreur d'authentification", description: message };
  };

  const validateSignupStep1 = () => {
    if (!name.trim()) {
      toast({ title: "Nom requis", description: "Veuillez renseigner votre nom complet.", variant: "destructive" });
      return false;
    }
    if (!phone.trim()) {
      toast({ title: "Téléphone requis", description: "Veuillez renseigner votre numéro de téléphone.", variant: "destructive" });
      return false;
    }
    if (!isValidPhoneNumber(phone)) {
      toast({ title: "Numéro invalide", description: "Veuillez entrer un numéro de téléphone valide.", variant: "destructive" });
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
          toast({ title: "Mots de passe non identiques", description: "Veuillez retaper exactement le même mot de passe.", variant: "destructive" });
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

        toast({ title: "Inscription réussie !", description: "Consultez vos e-mails pour valider votre inscription." });
        navigate("/auth/check-email", { state: { email: emailV } });
        return;
      }

      if (mode === "forgot") {
        if (resetCooldown > 0) {
          toast({ title: "Patientez", description: `Veuillez attendre ${resetCooldown}s avant un nouvel envoi.`, variant: "destructive" });
          setLoading(false);
          return;
        }
        await supabase.auth.resetPasswordForEmail(emailV, {
          redirectTo: `${window.location.origin}/auth/reset`,
        });
        toast({ title: "E-mail envoyé !", description: "Un lien de réinitialisation vous a été transmis." });
        setMode("login");
        setPassword("");
        setResetCooldown(60);
        return;
      }

      const passV = passwordSchema.parse(password);
      const { error } = await supabase.auth.signInWithPassword({ email: emailV, password: passV });
      if (error) throw error;

      toast({ title: "Bienvenue !", description: "Connexion réussie." });
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
      toast({ title: "Connexion Google échouée", description: result.error || "Une erreur est survenue avec Google", variant: "destructive" });
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

  const currentTestimonial = TESTIMONIALS[activeTestimonial];

  return (
    <div className="min-h-screen flex bg-background font-body overflow-hidden">

      {/* ── Left Panel — Authentic Editorial Brand Section ────────── */}
      <div className="hidden lg:flex lg:w-[46%] relative flex-col justify-between p-12 bg-gradient-hero overflow-hidden">
        {/* Subtle grid overlay */}
        <div className="absolute inset-0 hero-grid-overlay opacity-20 pointer-events-none" />

        {/* Top Clean Logo */}
        <div className="relative z-10">
          <Link to="/" className="inline-flex items-center gap-3 group">
            <div className="w-9 h-9 rounded-xl bg-gold/15 border border-gold/30 flex items-center justify-center text-gold group-hover:scale-105 transition-transform">
              <BookOpen className="w-4 h-4" />
            </div>
            <span className="font-display font-black text-white tracking-[0.2em] text-xl hover:text-gold transition-colors">
              MILLENIUM
            </span>
          </Link>
        </div>

        {/* Center Editorial Pitch */}
        <div className="relative z-10 flex flex-col gap-7 my-auto max-w-lg">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-gold/30 bg-gold/10 text-gold text-xs font-semibold uppercase tracking-wider self-start">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Espace Membre Officiel</span>
          </div>

          <div>
            <h1 className="font-serif text-4xl xl:text-5xl font-bold text-white leading-[1.18] mb-4">
              Transmettre la foi et les <span className="text-gold italic font-normal">enseignements</span>
            </h1>
            <p className="text-white/75 text-base leading-relaxed font-normal">
              Accédez aux prédications, partagez vos réflexions et vivez la parole dans une communauté engagée.
            </p>
          </div>

          {/* Stats bar */}
          <div className="grid grid-cols-3 gap-3 pt-3 border-t border-white/15">
            {[
              { icon: BookOpen, label: "Enseignements", count: "500+" },
              { icon: Globe, label: "Pays", count: "40+" },
              { icon: HeartHandshake, label: "Membres", count: "10K+" },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.label} className="p-3 rounded-xl bg-white/5 border border-white/10">
                  <Icon className="w-4 h-4 text-gold mb-1" />
                  <p className="font-display font-bold text-white text-lg leading-none">{item.count}</p>
                  <p className="text-[11px] text-white/60 mt-1">{item.label}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Bottom Testimonial */}
        <div className="relative z-10 bg-white/10 border border-white/15 rounded-2xl p-5 backdrop-blur-sm">
          <Quote className="w-4 h-4 text-gold/70 mb-2" />
          <p className="text-white/90 text-sm italic leading-relaxed">
            "{currentTestimonial.quote}"
          </p>
          <div className="flex items-center justify-between mt-4 pt-3 border-t border-white/10">
            <div>
              <p className="text-white text-xs font-bold">{currentTestimonial.author}</p>
              <p className="text-white/50 text-[10px]">{currentTestimonial.role} • {currentTestimonial.location}</p>
            </div>
            <div className="flex gap-1.5">
              {TESTIMONIALS.map((_, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setActiveTestimonial(idx)}
                  className={`w-2 h-2 rounded-full transition-all ${
                    activeTestimonial === idx ? "bg-gold w-4" : "bg-white/30"
                  }`}
                  aria-label={`Témoignage ${idx + 1}`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Right Panel — Auth Form ──────────────────────────────────── */}
      <div className="flex-1 flex flex-col items-center justify-center px-5 py-8 sm:px-10 relative overflow-y-auto">
        {/* Navigation back */}
        <div className="w-full max-w-md mb-6 flex items-center justify-between">
          <Link to="/" className="inline-flex items-center gap-2 text-xs font-medium text-muted-foreground hover:text-gold transition-colors group">
            <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
            <span>Retour au site</span>
          </Link>
          <div className="lg:hidden flex items-center gap-1.5">
            <span className="font-display font-black text-foreground tracking-[0.15em] text-sm">MILLENIUM</span>
          </div>
        </div>

        <div className="w-full max-w-md my-auto space-y-6">

          {/* Header */}
          <div>
            <h2 className="font-display text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight mb-1.5">
              {mode === "login" && "Se connecter à votre compte"}
              {mode === "signup" && (signupStep === 1 ? "Créer un compte membre" : "Définir vos identifiants")}
              {mode === "forgot" && "Réinitialisation du mot de passe"}
            </h2>
            <p className="text-muted-foreground text-xs sm:text-sm">
              {mode === "login" && "Saisissez vos identifiants pour accéder à votre espace."}
              {mode === "signup" && (signupStep === 1 ? "Étape 1/2 : Informations personnelles" : "Étape 2/2 : E-mail et mot de passe")}
              {mode === "forgot" && "Saisissez votre e-mail pour recevoir le lien de réinitialisation."}
            </p>
          </div>

          {/* Mode switch tabs */}
          {mode !== "forgot" && (
            <div className="flex bg-secondary/60 rounded-xl p-1 border border-border/60">
              {(["login", "signup"] as const).map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => switchMode(m)}
                  className={`flex-1 py-2.5 rounded-lg text-xs font-bold transition-all duration-200 ${
                    mode === m
                      ? "bg-card shadow-sm text-foreground border border-border/40"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {m === "login" ? "Connexion" : "Inscription"}
                </button>
              ))}
            </div>
          )}

          {/* Signup step indicator */}
          {mode === "signup" && (
            <div className="flex items-center gap-2">
              <div className="flex-1 h-1.5 rounded-full bg-gold" />
              <div className={`flex-1 h-1.5 rounded-full transition-all duration-300 ${
                signupStep === 2 ? "bg-gold" : "bg-border/60"
              }`} />
            </div>
          )}

          {/* SSO Google Button */}
          {mode !== "forgot" && (mode === "login" || (mode === "signup" && signupStep === 1)) && (
            <button
              type="button"
              onClick={handleGoogle}
              disabled={loading}
              className="w-full h-12 flex items-center justify-center gap-3 rounded-xl border border-border/80 bg-card hover:bg-secondary/70 hover:border-border transition-all duration-200 text-xs font-bold text-foreground shadow-sm group disabled:opacity-50"
            >
              <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              <span>Continuer avec Google</span>
              <ChevronRight className="w-3.5 h-3.5 text-muted-foreground group-hover:translate-x-0.5 transition-transform" />
            </button>
          )}

          {/* Divider */}
          {mode !== "forgot" && (mode === "login" || (mode === "signup" && signupStep === 1)) && (
            <div className="flex items-center gap-3">
              <div className="flex-1 h-px bg-border/60" />
              <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest">ou par e-mail</span>
              <div className="flex-1 h-px bg-border/60" />
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">

            {/* Signup Step 1 */}
            {mode === "signup" && signupStep === 1 && (
              <>
                <Field
                  id="auth-name"
                  label="Nom complet"
                  value={name}
                  onChange={setName}
                  icon={<User className="w-4 h-4" />}
                  placeholder="Ex: Jean Dupont"
                  required
                  autoComplete="name"
                />

                <div className="space-y-1.5 group">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="auth-phone" className="text-xs font-bold text-foreground/80 group-focus-within:text-gold transition-colors">
                      Numéro de téléphone <span className="text-gold">*</span>
                    </Label>
                  </div>
                  <div className="h-12 rounded-xl border border-border/80 bg-card px-3.5 flex items-center transition-all duration-200 hover:border-border focus-within:border-gold focus-within:ring-4 focus-within:ring-gold/15 shadow-2xs">
                    <PhoneInput
                      id="auth-phone"
                      country="BJ"
                      international
                      value={phone || undefined}
                      onChange={(v) => setPhone(v ?? "")}
                      placeholder="+229 00 00 00 00"
                      className="w-full text-sm text-foreground font-medium"
                    />
                  </div>
                </div>
              </>
            )}

            {/* Signup Step 2 */}
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

                <div className="space-y-2">
                  <Field
                    id="auth-password"
                    label="Mot de passe"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={setPassword}
                    icon={<Lock className="w-4 h-4" />}
                    placeholder="Saisissez votre mot de passe"
                    required
                    autoComplete="new-password"
                    suffix={
                      <button
                        type="button"
                        tabIndex={-1}
                        onClick={() => setShowPassword((s) => !s)}
                        className="text-muted-foreground hover:text-foreground transition-colors p-1"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    }
                  />
                  <PasswordChecklist password={password} />
                </div>

                <Field
                  id="auth-confirm-password"
                  label="Confirmer le mot de passe"
                  type={showConfirm ? "text" : "password"}
                  value={confirmPassword}
                  onChange={setConfirmPassword}
                  icon={<Lock className="w-4 h-4" />}
                  placeholder="Répétez votre mot de passe"
                  required
                  autoComplete="new-password"
                  suffix={
                    <button
                      type="button"
                      tabIndex={-1}
                      onClick={() => setShowConfirm((s) => !s)}
                      className="text-muted-foreground hover:text-foreground transition-colors p-1"
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

                <Field
                  id="auth-password"
                  label="Mot de passe"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={setPassword}
                  icon={<Lock className="w-4 h-4" />}
                  placeholder="Saisissez votre mot de passe"
                  required
                  autoComplete="current-password"
                  suffix={
                    <button
                      type="button"
                      tabIndex={-1}
                      onClick={() => setShowPassword((s) => !s)}
                      className="text-muted-foreground hover:text-foreground transition-colors p-1"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  }
                />

                <div className="flex items-center justify-between pt-1">
                  <label className="flex items-center gap-2 cursor-pointer select-none text-xs text-muted-foreground hover:text-foreground transition-colors">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="accent-gold rounded w-3.5 h-3.5"
                    />
                    Se souvenir de moi
                  </label>
                  <button
                    type="button"
                    onClick={() => switchMode("forgot")}
                    className="text-xs text-gold hover:underline font-medium transition-colors"
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

            {/* Submit Button */}
            <div className="space-y-2 pt-2">
              <button
                type="submit"
                disabled={loading || (mode === "forgot" && resetCooldown > 0)}
                className="w-full h-12 flex items-center justify-center gap-2 rounded-xl
                  bg-gold hover:bg-gold/90 active:scale-[0.99]
                  text-slate-950 font-display font-bold text-sm tracking-wide
                  transition-all duration-200 shadow-gold hover:shadow-lg
                  disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin text-slate-950" />
                ) : (
                  <>
                    <span>
                      {mode === "login" && "Se connecter"}
                      {mode === "signup" && (signupStep === 1 ? "Étape suivante" : "Créer mon compte")}
                      {mode === "forgot" && (resetCooldown > 0 ? `Patientez ${resetCooldown}s` : "Envoyer le lien")}
                    </span>
                    <ChevronRight className="w-4 h-4" />
                  </>
                )}
              </button>

              {/* Back to Step 1 for signup */}
              {mode === "signup" && signupStep === 2 && (
                <button
                  type="button"
                  onClick={() => setSignupStep(1)}
                  className="w-full h-11 flex items-center justify-center gap-2 rounded-xl border border-border/80 hover:bg-secondary/40 text-xs font-semibold text-muted-foreground transition-colors"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                  <span>Modifier les informations personnelles</span>
                </button>
              )}
            </div>
          </form>

          {/* Footer links */}
          <div className="text-center space-y-3 pt-2">
            {mode === "forgot" && (
              <button
                type="button"
                onClick={() => switchMode("login")}
                className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-gold font-medium transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                Retour à la connexion
              </button>
            )}

            {mode !== "forgot" && (
              <p className="text-xs text-muted-foreground">
                {mode === "login" ? "Pas encore membre ? " : "Vous avez déjà un compte ? "}
                <button
                  type="button"
                  onClick={() => switchMode(mode === "login" ? "signup" : "login")}
                  className="text-gold hover:underline font-bold transition-colors"
                >
                  {mode === "login" ? "Inscrivez-vous" : "Se connecter"}
                </button>
              </p>
            )}

            <p className="text-[11px] text-muted-foreground/60 leading-relaxed max-w-xs mx-auto">
              En continuant, vous acceptez les règles de la communauté et la politique de confidentialité de MILLENIUM.
            </p>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Auth;
