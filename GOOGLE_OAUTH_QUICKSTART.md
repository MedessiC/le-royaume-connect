# 🚀 Démarrage Rapide - Google OAuth

## 5 Minutes pour Configurer Google OAuth

### Étape 1: Créer les Credentials Google (2 min)

1. Accédez à [Google Cloud Console](https://console.cloud.google.com)
2. Créez un nouveau projet
3. Allez à **APIs & Services** > **Library**
4. Recherchez et activez **Google+ API**
5. Allez à **Credentials** et créez un ID client OAuth pour **Web Application**
6. Sous **Authorized JavaScript origins**, ajoutez:
   - `http://localhost:8080`
7. Sous **Authorized redirect URIs**, ajoutez:
   - `http://localhost:8080/auth/callback`
8. ✅ Copiez votre **Client ID** et **Client Secret**

### Étape 2: Configurer Supabase (2 min)

1. Allez sur [app.supabase.com](https://app.supabase.com)
2. Ouvrez votre projet
3. Allez à **Authentication** > **Providers**
4. Activez **Google**
5. Collez votre **Client ID** et **Client Secret** de Google
6. Dans **Redirect URL**, mettez: `http://localhost:8080/auth/callback`
7. Cliquez **Save**

### Étape 3: Configurer les Variables (1 min)

Créez `.env.local` à la racine:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your-publishable-key
```

Trouvez ces valeurs dans Supabase: **Settings** > **API**

### ✅ C'est Fini!

Lancez le développement:

```bash
bun run dev
```

Testez sur `http://localhost:8080/auth` - Le bouton Google doit fonctionner! 🎉

---

## Fichiers Importants

| Fichier | Rôle |
|---------|------|
| `src/integrations/google/auth.ts` | Logique d'authentification |
| `src/integrations/google/config.ts` | Configuration |
| `src/pages/Auth.tsx` | Page de connexion |
| `src/pages/AuthCallback.tsx` | Gestion du callback |
| `GOOGLE_OAUTH_SETUP.md` | Configuration détaillée |
| `GOOGLE_OAUTH_EXAMPLES.md` | Exemples d'usage |

---

## Dépannage Rapide

| Problème | Solution |
|----------|----------|
| "Invalid Client ID" | Vérifiez que vous avez copié le bon Client ID de Google Cloud |
| "Redirect URI mismatch" | Assurez-vous que l'URI dans Google Cloud = Supabase |
| Page blanche après clic | Vérifiez que Google+ API est activée |
| Erreur CORS | Ajoutez `http://localhost:8080` à "Authorized JavaScript origins" |

---

## Utilisation dans le Projet

```tsx
import { signInWithGoogle } from "@/integrations/google";

// Dans un composant
const handleLogin = async () => {
  const result = await signInWithGoogle();
  if (result.success) {
    // Utilisateur connecté!
    console.log(result.user);
  }
};
```

---

## Pour la Production

1. Créez une nouvelle credential Google pour votre domaine
2. Remplacez les origines/URIs par:
   - Origins: `https://yourdomain.com`
   - Redirect: `https://yourdomain.com/auth/callback`
3. Mettez à jour Supabase avec les nouvelles URLs
4. Mise à jour `.env`:
   ```env
   VITE_SUPABASE_URL=https://prod-project.supabase.co
   VITE_SUPABASE_PUBLISHABLE_KEY=prod-key
   ```

---

## Documentation Complète

Pour plus de détails:
- 📖 [GOOGLE_OAUTH_SETUP.md](GOOGLE_OAUTH_SETUP.md) - Configuration complète
- 📝 [GOOGLE_OAUTH_EXAMPLES.md](GOOGLE_OAUTH_EXAMPLES.md) - Exemples d'usage
- 🔍 [GOOGLE_OAUTH_INTEGRATION.md](GOOGLE_OAUTH_INTEGRATION.md) - Vue d'ensemble

---

**Besoin d'aide?** Consultez la documentation détaillée ou les exemples ci-dessus! 💪
