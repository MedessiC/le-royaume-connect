# Configuration Google OAuth avec Supabase

## Guide Complet de Configuration

### 1. Préparation du Projet Google Cloud

#### Étape 1: Créer un projet Google Cloud
1. Accédez à [Google Cloud Console](https://console.cloud.google.com)
2. Cliquez sur le sélecteur de projet en haut
3. Cliquez sur "NOUVEAU PROJET"
4. Entrez un nom (ex: "Le Règne Millénaire")
5. Cliquez sur "CRÉER"

#### Étape 2: Activer l'API Google+
1. Dans Google Cloud Console, allez à "APIs et services" > "Bibliothèque"
2. Recherchez "Google+ API"
3. Cliquez sur le résultat
4. Cliquez sur "ACTIVER"

#### Étape 3: Créer les Identifiants OAuth
1. Allez à "APIs et services" > "Identifiants"
2. Cliquez sur "Créer des identifiants" > "ID client OAuth"
3. Sélectionnez "Application Web" comme type d'application
4. Entrez un nom (ex: "Le Règne Millénaire Web App")

#### Étape 4: Configurer les URI Autorisées

**Pour le développement local:**
- **Origines JavaScript autorisées:**
  - `http://localhost:8080`
  - `http://localhost:5173` (si vous utilisez un port différent)

- **URI de redirection autorisées:**
  - `http://localhost:8080/auth/callback`
  - `http://localhost:5173/auth/callback`

**Pour la production:**
- **Origines JavaScript autorisées:**
  - `https://yourdomain.com`
  - `https://www.yourdomain.com`

- **URI de redirection autorisées:**
  - `https://yourdomain.com/auth/callback`
  - `https://yourdomain.com/auth/callback`

5. Cliquez sur "CRÉER"
6. Copiez votre **Client ID** et **Client Secret**

---

### 2. Configuration dans Supabase

#### Étape 1: Accéder aux Paramètres d'Authentification
1. Ouvrez votre projet Supabase: [https://app.supabase.com](https://app.supabase.com)
2. Allez à **Authentication** > **Providers** dans le menu latéral

#### Étape 2: Activer Google OAuth
1. Cherchez "Google" dans la liste des fournisseurs
2. Cliquez sur "Google" pour l'activer
3. Collez votre **Client ID** de Google
4. Collez votre **Client Secret** de Google
5. Dans le champ "Redirect URL", entrez:
   - Pour le développement: `http://localhost:8080/auth/callback`
   - Pour la production: `https://yourdomain.com/auth/callback`
6. Cliquez sur "Enregistrer"

#### Étape 3: Configurer les URL de Redirection Supabase
1. Allez à **Authentication** > **URL Configuration**
2. Sous "Site URL", entrez:
   - Pour le développement: `http://localhost:8080`
   - Pour la production: `https://yourdomain.com`
3. Sous "Redirect URLs", ajoutez:
   - `http://localhost:8080/auth/callback`
   - `http://localhost:8080/feed`
   - Pour la production: `https://yourdomain.com/*`
4. Cliquez sur "Enregistrer"

---

### 3. Configuration du Projet Local

#### Étape 1: Variables d'Environnement
Créez un fichier `.env.local` à la racine du projet:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your-publishable-key-here
```

Vous trouverez ces valeurs dans Supabase:
- **Authentication** > **API Keys**

#### Étape 2: Créer la Page de Callback (optionnel)

Si vous ne l'avez pas déjà, créez `src/pages/AuthCallback.tsx`:

```tsx
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { handleOAuthCallback } from '@/integrations/google';

const AuthCallback = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const handleCallback = async () => {
      const result = await handleOAuthCallback();
      if (result.success) {
        navigate('/feed', { replace: true });
      } else {
        navigate('/auth', { replace: true });
      }
    };

    handleCallback();
  }, [navigate]);

  return <div>Authentification en cours...</div>;
};

export default AuthCallback;
```

Puis ajoutez la route dans votre `App.tsx`:

```tsx
import AuthCallback from '@/pages/AuthCallback';

// Dans votre configuration de routes:
<Route path="/auth/callback" element={<AuthCallback />} />
```

---

### 4. Utilisation dans le Projet

Le bouton Google est déjà configuré dans [Auth.tsx](../src/pages/Auth.tsx).

#### Importer et Utiliser
```typescript
import { signInWithGoogle, signOutFromGoogle } from '@/integrations/google';

// Pour se connecter avec Google
const handleGoogleLogin = async () => {
  const result = await signInWithGoogle();
  if (result.success) {
    // L'utilisateur est authentifié
    console.log('User:', result.user);
  } else {
    console.error('Error:', result.error);
  }
};

// Pour se déconnecter
const handleLogout = async () => {
  const result = await signOutFromGoogle();
  if (result.success) {
    console.log('Logged out successfully');
  }
};
```

---

### 5. Test en Développement

1. Lancez le serveur de développement:
   ```bash
   bun run dev
   ```

2. Accédez à `http://localhost:8080/auth`

3. Cliquez sur le bouton "Continuer avec Google"

4. Autorisez l'accès si nécessaire

5. Vous devriez être redirigé vers `/feed`

---

### 6. Dépannage

#### Erreur: "Invalid Client ID"
- Vérifiez que vous avez copié correctement le Client ID de Google Cloud
- Assurez-vous que le Client ID provient de credentials de type "Web application"

#### Erreur: "Redirect URI mismatch"
- Vérifiez que l'URL dans la configuration Google Cloud correspond à celle de Supabase
- N'oubliez pas `/auth/callback` à la fin

#### Erreur: "CORS error"
- Assurez-vous que `http://localhost:8080` est dans les "Origines JavaScript autorisées" de Google Cloud

#### La page de connexion Google ne s'affiche pas
- Vérifiez que le Client ID de Google est dans Supabase
- Vérifiez que Google OAuth est activé dans **Authentication** > **Providers**

---

### 7. Fichiers de Configuration

- **Configuration Google**: [src/integrations/google/config.ts](../src/integrations/google/config.ts)
- **Authentification Google**: [src/integrations/google/auth.ts](../src/integrations/google/auth.ts)
- **Utilisation dans Auth**: [src/pages/Auth.tsx](../src/pages/Auth.tsx#L71)

---

### 8. Ressources Utiles

- [Supabase OAuth avec Google](https://supabase.com/docs/guides/auth/social-login/auth-google)
- [Google Cloud Console](https://console.cloud.google.com)
- [Documentation Supabase Auth](https://supabase.com/docs/guides/auth)

---

### Questions Fréquentes

**Q: Dois-je installer des dépendances supplémentaires?**
A: Non, tout fonctionne avec Supabase et les dépendances existantes.

**Q: Comment changer l'URL de redirection après l'authentification?**
A: Modifiez `googleOAuthConfig.redirectTo` dans [src/integrations/google/config.ts](../src/integrations/google/config.ts)

**Q: Puis-je utiliser Google OAuth sans créer une page callback?**
A: Oui, Supabase gère automatiquement le callback si vous n'en avez pas besoin de personnalisé.

**Q: Comment gérer plusieurs domaines?**
A: Configurez les deux domaines dans Google Cloud Console et dans Supabase URL Configuration.
