# Exemples d'Utilisation - Google OAuth

Ce document montre comment utiliser l'authentification Google dans votre application.

## 1. Connexion avec Google (Déjà Implémenté)

### Dans `src/pages/Auth.tsx`

```tsx
import { signInWithGoogle } from "@/integrations/google";

const handleGoogle = async () => {
  setLoading(true);
  const result = await signInWithGoogle();
  if (!result.success) {
    toast({
      title: "Erreur Google",
      description: result.error || "Une erreur est survenue",
      variant: "destructive",
    });
    setLoading(false);
  }
};
```

## 2. Déconnexion

### Exemple dans une Barre de Navigation

```tsx
import { signOutFromGoogle } from "@/integrations/google";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

const Navbar = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogout = async () => {
    const result = await signOutFromGoogle();
    if (result.success) {
      toast({
        title: "Déconnecté",
        description: "Vous avez été déconnecté avec succès",
      });
      navigate("/", { replace: true });
    } else {
      toast({
        title: "Erreur",
        description: result.error || "Erreur lors de la déconnexion",
        variant: "destructive",
      });
    }
  };

  return (
    <button onClick={handleLogout}>
      Déconnexion
    </button>
  );
};
```

## 3. Créer un Bouton Réutilisable

### `src/components/GoogleSignInButton.tsx`

```tsx
import { Button, ButtonProps } from "@/components/ui/button";
import { signInWithGoogle } from "@/integrations/google";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

interface GoogleSignInButtonProps extends ButtonProps {
  onSuccess?: (user: any) => void;
  onError?: (error: string) => void;
}

export const GoogleSignInButton = ({
  onSuccess,
  onError,
  ...props
}: GoogleSignInButtonProps) => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleClick = async () => {
    setLoading(true);
    try {
      const result = await signInWithGoogle();
      
      if (result.success) {
        onSuccess?.(result.user);
        toast({
          title: "Succès",
          description: "Vous êtes connecté avec Google",
        });
      } else {
        onError?.(result.error || "");
        toast({
          title: "Erreur",
          description: result.error || "Une erreur est survenue",
          variant: "destructive",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      type="button"
      variant="outline"
      onClick={handleClick}
      disabled={loading}
      {...props}
    >
      {loading ? "Connexion en cours..." : "Continuer avec Google"}
    </Button>
  );
};
```

## 4. Hook Personnalisé pour l'Authentification

### `src/hooks/useGoogleAuth.ts`

```typescript
import { useState } from "react";
import { 
  signInWithGoogle, 
  signOutFromGoogle, 
  GoogleAuthResult 
} from "@/integrations/google";

export const useGoogleAuth = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const login = async (): Promise<GoogleAuthResult> => {
    setLoading(true);
    setError(null);
    try {
      const result = await signInWithGoogle();
      if (!result.success) {
        setError(result.error || "Login failed");
      }
      return result;
    } catch (err: any) {
      const errorMsg = err.message || "An error occurred";
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  };

  const logout = async (): Promise<GoogleAuthResult> => {
    setLoading(true);
    setError(null);
    try {
      const result = await signOutFromGoogle();
      if (!result.success) {
        setError(result.error || "Logout failed");
      }
      return result;
    } catch (err: any) {
      const errorMsg = err.message || "An error occurred";
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  };

  const clearError = () => setError(null);

  return {
    login,
    logout,
    loading,
    error,
    clearError,
  };
};
```

**Utilisation:**

```tsx
import { useGoogleAuth } from "@/hooks/useGoogleAuth";

const MyComponent = () => {
  const { login, logout, loading, error } = useGoogleAuth();

  return (
    <div>
      {error && <p className="text-red-500">{error}</p>}
      <button onClick={login} disabled={loading}>
        {loading ? "Loading..." : "Login with Google"}
      </button>
      <button onClick={logout} disabled={loading}>
        Logout
      </button>
    </div>
  );
};
```

## 5. Protection de Routes

### `src/components/ProtectedRoute.tsx`

```tsx
import { Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div>Chargement...</div>;
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  return children;
};
```

**Utilisation dans App.tsx:**

```tsx
import { ProtectedRoute } from "@/components/ProtectedRoute";

<Routes>
  <Route path="/auth" element={<Auth />} />
  <Route 
    path="/feed" 
    element={
      <ProtectedRoute>
        <Feed />
      </ProtectedRoute>
    } 
  />
</Routes>
```

## 6. Afficher les Informations de l'Utilisateur

```tsx
import { useAuth } from "@/hooks/useAuth";

const UserProfile = () => {
  const { user } = useAuth();

  if (!user) {
    return <p>Veuillez vous connecter</p>;
  }

  return (
    <div>
      <h1>Bienvenue {user.user_metadata?.full_name || user.email}</h1>
      <img src={user.user_metadata?.avatar_url} alt="Avatar" />
      <p>Email: {user.email}</p>
    </div>
  );
};
```

## 7. Gestion des Erreurs Avancée

```tsx
import { useGoogleAuth } from "@/hooks/useGoogleAuth";
import { useEffect } from "react";

const LoginPage = () => {
  const { login, error, clearError } = useGoogleAuth();

  useEffect(() => {
    if (error) {
      // Log l'erreur pour le debugging
      console.error("Google OAuth error:", error);
      
      // Afficher un message d'erreur spécifique
      const errorMessages: Record<string, string> = {
        "Redirect URI mismatch": "Veuillez configurer les URLs de redirection dans Google Cloud",
        "Invalid Client": "Client ID invalide dans Supabase",
        "Access denied": "Vous avez refusé l'accès à Google",
      };

      const message = Object.entries(errorMessages).find(([key]) => 
        error.includes(key)
      )?.[1] || error;

      console.error("Displayed error:", message);
    }
  }, [error]);

  return (
    <div>
      {error && (
        <div className="bg-red-50 p-4 rounded">
          <p className="text-red-800">{error}</p>
          <button onClick={clearError} className="text-sm text-red-600 mt-2">
            Fermer
          </button>
        </div>
      )}
      <button onClick={login}>
        Continuer avec Google
      </button>
    </div>
  );
};
```

## 8. Configuration Personnalisée

Pour modifier l'URL de redirection après authentification:

### Dans `src/integrations/google/config.ts`

```typescript
// Modifier cette ligne pour changer la destination
export const googleOAuthConfig = {
  redirectTo: `${window.location.origin}/custom-page`, // Au lieu de /feed
  scopes: ['profile', 'email']
};
```

## 9. Test avec différents domaines

### Développement
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your-key
# URL: http://localhost:8080
```

### Production
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your-key
# URL: https://yourdomain.com
```

## 10. Déboguer les Problèmes OAuth

Ajoutez ce code dans la console:

```typescript
// Vérifier la session Supabase
const { data } = await supabase.auth.getSession();
console.log("Session:", data);

// Vérifier l'utilisateur actuel
const { data: { user } } = await supabase.auth.getUser();
console.log("User:", user);

// Écouter les changements d'authentification
const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
  console.log("Auth event:", event, "Session:", session);
});
```

---

## Ressources

- [Supabase OAuth Documentation](https://supabase.com/docs/guides/auth/social-login/auth-google)
- [Google Cloud Console](https://console.cloud.google.com)
- [GOOGLE_OAUTH_SETUP.md](GOOGLE_OAUTH_SETUP.md) - Configuration complète
