import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const AuthReset = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    document.title = "Réinitialiser le mot de passe – MILLENIUM";
  }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Ensure session is available; if not, try to recover tokens from URL (access_token from Supabase recovery link)
    let currentUser = user;
    if (!currentUser) {
      try {
        // Try query string first
        const qs = new URLSearchParams(window.location.search);
        // Also try hash fragment (some providers put tokens in the fragment)
        const hash = new URLSearchParams(window.location.hash.replace(/^#/, "?"));
        const access_token = qs.get("access_token") || hash.get("access_token");
        const refresh_token = qs.get("refresh_token") || hash.get("refresh_token");

        if (access_token) {
          // Set session directly with tokens provided in URL
          await supabase.auth.setSession({ access_token, refresh_token: refresh_token ?? undefined });
          const { data } = await supabase.auth.getUser();
          currentUser = data.user ?? null;
        }
      } catch (err) {
        console.error("Failed to set session from URL tokens", err);
      }
    }

    if (!currentUser) {
      toast({ title: "Lien invalide", description: "Ouvrez le lien de réinitialisation dans le même navigateur où vous avez demandé le reset, ou utilisez le lien envoyé par email.", variant: "destructive" });
      return;
    }
    if (password.length < 6) {
      toast({ title: "Mot de passe trop court", description: "Le mot de passe doit contenir au moins 6 caractères.", variant: "destructive" });
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    setLoading(false);
    if (error) {
      toast({ title: "Erreur", description: error.message || "Impossible de mettre à jour le mot de passe.", variant: "destructive" });
      return;
    }
    toast({ title: "Mot de passe mis à jour", description: "Vous pouvez maintenant vous connecter.", });
    navigate("/auth");
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md bg-card rounded-lg p-8 border border-border">
        <h1 className="text-xl font-semibold mb-4">Réinitialiser le mot de passe</h1>
        {user ? (
          <form onSubmit={submit} className="space-y-4">
            <div>
              <label className="block text-sm text-muted-foreground mb-2">Nouveau mot de passe</label>
              <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
            </div>
            <div className="flex justify-between items-center">
              <Link to="/auth" className="text-sm text-muted-foreground">Annuler</Link>
              <Button type="submit" disabled={loading}>{loading ? "..." : "Enregistrer"}</Button>
            </div>
          </form>
        ) : (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">Pour des raisons de sécurité, vous devez ouvrir le lien de réinitialisation dans le même navigateur où vous avez demandé la réinitialisation. Si vous avez déjà ouvert le lien, reconnectez-vous et réessayez.</p>
            <div className="flex justify-end">
              <Link to="/auth"><Button>Retour</Button></Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AuthReset;
