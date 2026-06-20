import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Eye, EyeOff } from "lucide-react";
import { useTranslation } from "@/i18n";

const AuthReset = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [strength, setStrength] = useState(0);
  const [readyToReset, setReadyToReset] = useState<boolean>(!!user);
  const { t } = useTranslation();

  useEffect(() => {
    document.title = "Réinitialiser le mot de passe – MILLENIUM";
  }, []);

  // Try to obtain session from URL tokens on mount (so the form can show)
  useEffect(() => {
    const tryRestoreSession = async () => {
      if (user) {
        setReadyToReset(true);
        return;
      }

      try {
        const qs = new URLSearchParams(window.location.search);
        const hash = new URLSearchParams(window.location.hash.replace(/^#/, "?"));
        const access_token = qs.get("access_token") || hash.get("access_token");
        const refresh_token = qs.get("refresh_token") || hash.get("refresh_token");
        if (access_token) {
          await supabase.auth.setSession({ access_token, refresh_token: refresh_token ?? undefined });
          const { data } = await supabase.auth.getUser();
          if (data.user) setReadyToReset(true);
        }
      } catch (err) {
        // ignore — user will see help text
        console.debug("No session tokens found in URL or failed to set session", err);
      }
    };

    tryRestoreSession();
  }, [user]);

  useEffect(() => {
    // simple password strength scoring
    const score = [password.length >= 8, /[A-Z]/.test(password), /[0-9]/.test(password), /[^A-Za-z0-9]/.test(password)].filter(Boolean).length;
    setStrength(score);
  }, [password]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!readyToReset) {
      setError(t("auth.invalidCredentialsDescription") || "Lien invalide ou expiré.");
      return;
    }
    if (password.length < 6) {
      setError(t("auth.invalidPasswordDescription") || "Le mot de passe doit contenir au moins 6 caractères.");
      return;
    }
    if (password !== confirmPassword) {
      setError(t("auth.passwordMismatchDescription") || "Les mots de passe ne correspondent pas.");
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password });
      setLoading(false);
      if (error) {
        setError(error.message || "Impossible de mettre à jour le mot de passe.");
        return;
      }
      setSuccess(t("auth.resetSuccess") || "Mot de passe mis à jour avec succès.");
      // show toast as well
      toast({ title: t("auth.resetSuccess") || "Mot de passe mis à jour", description: "Vous pouvez maintenant vous connecter." });
      setTimeout(() => navigate("/auth"), 1800);
    } catch (err: any) {
      setLoading(false);
      setError(err?.message || String(err) || "Erreur inattendue");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-background">
      <div className="w-full max-w-md bg-card rounded-lg p-8 border border-border">
        <h1 className="text-2xl font-display font-bold mb-4">{t("auth.resetTitle") || "Réinitialiser le mot de passe"}</h1>

        {!readyToReset ? (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">{t("auth.checkEmail") || "Ouvrez le lien de réinitialisation depuis le même navigateur où vous avez demandé la réinitialisation."}</p>
            <div className="flex justify-end">
              <Link to="/auth"><Button>{t("common.close") || "Retour"}</Button></Link>
            </div>
          </div>
        ) : (
          <form onSubmit={submit} className="space-y-4">
            {error && <div className="text-sm text-destructive rounded-md bg-destructive/10 p-2">{error}</div>}
            {success && <div className="text-sm text-foreground rounded-md bg-gold/10 p-2">{success}</div>}

            <div>
              <label className="block text-sm text-muted-foreground mb-2">{t("auth.passwordLabel") || "Nouveau mot de passe"}</label>
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  aria-label="Nouveau mot de passe"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground"
                  aria-label={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              <div className="mt-2 text-xs text-muted-foreground">Force: {["faible","moyen","bon","fort"][Math.max(0, Math.min(3, strength))]}</div>
            </div>

            <div>
              <label className="block text-sm text-muted-foreground mb-2">{t("auth.confirmPasswordLabel") || "Confirmer le mot de passe"}</label>
              <Input type={showPassword ? "text" : "password"} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required aria-label="Confirmer le mot de passe" />
            </div>

            <div className="flex justify-between items-center">
              <Link to="/auth" className="text-sm text-muted-foreground">{t("common.cancel") || "Annuler"}</Link>
              <Button type="submit" disabled={loading || password.length === 0 || confirmPassword.length === 0}>{loading ? "..." : (t("auth.resetButton") || "Enregistrer")}</Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default AuthReset;
