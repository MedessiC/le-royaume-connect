# Serveur OpenGraph Render – Aperçus Réseaux Sociaux (WhatsApp, Facebook, Twitter)

Ce serveur Node.js / Express permet d'afficher **les vraies images de couverture et vidéos** des enseignements lors des partages sur les réseaux sociaux (WhatsApp, Facebook, Twitter/X, LinkedIn, Telegram), sous votre propre sous-domaine professionnel (ex: `share.leregnemillenaire.com`).

---

## 🎯 Comment ça fonctionne ?

1. Lorsqu'un utilisateur partage un lien `https://share.leregnemillenaire.com/teachings/nom-de-l-enseignement` :
2. **Si c'est un Robot (WhatsApp, Facebook, Twitterbot...)** :
   - Le serveur interroge Supabase en temps réel.
   - Il génère dynamiquement la page HTML avec les balises Meta de l'enseignement :
     - `og:image` : L'image de couverture réelle.
     - `og:title` : Le titre exact.
     - `og:description` : L'extrait de l'enseignement.
     - `og:video` : La vidéo liée si présente.
   - Le réseau social affiche ainsi la **carte complète avec l'image/vidéo** !
3. **Si c'est un Visiteur Humain** :
   - Le serveur le redirige instantanément (`302`) vers la page officielle du site principal (`https://leregnemillenaire.com/teachings/...`).

---

## 🌐 Configuration du Sous-Domaine Personnalisé (`share.votredomaine.com`)

### 1. Sur Render Dashboard
1. Allez sur votre service Web Render > **Settings** > **Custom Domains**.
2. Cliquez sur **Add Custom Domain** et saisissez votre sous-domaine :
   `share.leregnemillenaire.com` (remplacez par votre vrai nom de domaine).

### 2. Sur votre Gestionnaire DNS (Cloudflare, OVH, GoDaddy, Namecheap...)
Ajoutez un enregistrement **CNAME** :
- **Type** : `CNAME`
- **Nom / Hôte** : `share`
- **Cible / Valeur** : `millenium-og-proxy.onrender.com` (l'adresse fournie par Render)

Render générera automatiquement et gratuitement le certificat SSL HTTPS pour `share.leregnemillenaire.com`.

---

## ⚙️ Variables d'Environnement sur Render

Dans l'onglet **Environment Variables** sur Render :

| Clé | Exemple de Valeur | Description |
|-----|-------------------|-------------|
| `FRONTEND_URL` | `https://leregnemillenaire.com` | L'URL de votre site principal React |
| `VITE_SUPABASE_URL` | `https://eqichukewcuqrzqmjkpj.supabase.co` | URL de votre projet Supabase |
| `VITE_SUPABASE_ANON_KEY` | `eyJhbGci...` | Clé Anon Supabase |

---

## 🔗 Liaison avec le Frontend Vite

Dans le fichier `.env` de votre projet frontend React, ajoutez :
```env
VITE_OG_PROXY_URL=https://share.leregnemillenaire.com
```

Désormais, tout bouton *Partager* sur le site générera une URL du style :
`https://share.leregnemillenaire.com/teachings/le-regne-millenaire-qu-est-ce-que-c-est`
offrant un aperçu visuel parfait sur WhatsApp, Facebook et Twitter sans mentionner `onrender.com` !
