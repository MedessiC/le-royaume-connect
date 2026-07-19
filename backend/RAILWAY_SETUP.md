# Backend Setup pour Railway

## 📋 Prérequis

- Node.js 18+
- PostgreSQL 14+
- Compte Railway

## 🚀 Instructions de Déploiement

### Étape 1: Préparer le Backend Localement

```bash
cd backend
npm install
npm run build
```

### Étape 2: Créer un Projet Railway

1. Allez sur https://railway.app
2. Cliquez "Create New Project"
3. Sélectionnez "Deploy from GitHub" (recommandé)
4. Connectez votre repo GitHub
5. Sélectionnez le branch et confirmez

### Étape 3: Ajouter PostgreSQL

1. Dans le dashboard Railway, cliquez "Add Service"
2. Sélectionnez "PostgreSQL"
3. Railway créera automatiquement les identifiants

### Étape 4: Configurer les Variables d'Environnement

Dans Railway Dashboard → Variables:

```env
DATABASE_URL=postgresql://postgres:password@hostname:5432/railway
NODE_ENV=production
PORT=5000
JWT_SECRET=generate-a-long-random-string-here
JWT_EXPIRE=7d

FRONTEND_URL=https://your-frontend.netlify.app
API_URL=https://your-backend.railway.app

GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_CALLBACK_URL=https://your-backend.railway.app/api/auth/google/callback

FEEPAY_API_KEY=your-feepay-api-key
FEEPAY_SHOP_ID=your-feepay-shop-id

LOG_LEVEL=info
REDIS_URL=redis://localhost:6379  # Optional
```

### Étape 5: Configurer le Build & Start

Railway détecte automatiquement:
- Build: `npm run build`
- Start: `npm start`

Si pas auto-détecté, définissez dans Railway:
- Build Command: `npm install && npm run build`
- Start Command: `npm start`

### Étape 6: Vérifier le Déploiement

```bash
# Test health check
curl https://your-backend.railway.app/health

# Vous devriez voir:
# {"status":"healthy","timestamp":"2026-07-18T..."}
```

## 🔄 Migrations Database

Les migrations s'exécutent automatiquement au démarrage via `src/index.ts`:

```typescript
const start = async () => {
  await runMigrations();  // ← Automatique
  app.listen(PORT, ...);
};
```

### Vérifier les Migrations Manuellement

```bash
# Depuis votre machine locale
psql $RAILWAY_DATABASE_URL -c "SELECT * FROM migrations;"
```

## 🔗 Intégration Frontend

### Mettre à Jour le Frontend

Ajouter dans votre `.env.local`:

```env
VITE_API_URL=https://your-backend.railway.app
```

### Créer un Service API

```typescript
// src/lib/api.ts
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export async function apiCall(
  endpoint: string,
  options?: RequestInit,
  token?: string
) {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options?.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    throw new Error(`API error: ${response.statusText}`);
  }

  return response.json();
}

// Usage:
export async function loginUser(email: string, password: string) {
  return apiCall('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
}
```

## 🔐 Google OAuth Setup

### Obtenir Google Credentials

1. Allez sur https://console.cloud.google.com
2. Créez un nouveau projet
3. Activez Google+ API
4. Créez OAuth 2.0 credentials (Web application)
5. Authorized redirect URIs:
   - `https://your-backend.railway.app/api/auth/google/callback`
   - `http://localhost:5000/api/auth/google/callback` (dev)

### Ajouter dans Railway

```env
GOOGLE_CLIENT_ID=xxx.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=xxx
GOOGLE_CALLBACK_URL=https://your-backend.railway.app/api/auth/google/callback
```

## 📊 Monitoring & Logs

### Logs Railway

Dans le dashboard Railway:
- Cliquez sur le service
- Onglet "Logs"
- Filtrez par niveau

### Logs Locaux

```bash
# Afficher les logs
tail -f error.log
tail -f combined.log
```

## 🆘 Troubleshooting

### Erreur: `Module not found`

```bash
# Rebuild et redéploiement
npm run build
railway deploy --force
```

### Erreur: `Connection timeout`

```bash
# Vérifiez DATABASE_URL
railway variables | grep DATABASE_URL
```

### Erreur: `Google OAuth redirect mismatch`

- Vérifiez `GOOGLE_CALLBACK_URL`
- Doit matcher exactement dans Google Console

### Erreur: `Port already in use`

Railway attribue un port aléatoire dans `PORT` env var. Utilisez:

```typescript
const PORT = process.env.PORT || 5000;
app.listen(PORT, ...);
```

## 📈 Scaling

Si vous dépassez 100 requêtes/seconde:

1. **Ajouter PostgreSQL replica** (Rail Premium)
2. **Ajouter Redis cache** (Railway Redis add-on)
3. **Ajouter plusieurs instances** (Railway auto-scaling)

## 🔄 Redéployer

```bash
# Depuis votre repo local
git push origin main  # Railway redéploie automatiquement

# Ou forcer redéploiement
railway deploy --force
```

## ✅ Checklist Pré-Production

- [ ] Variables d'environnement définies
- [ ] SSL/HTTPS activé (Railway par défaut)
- [ ] Migrations exécutées
- [ ] Google OAuth configuré
- [ ] FeePay intégré et testé
- [ ] Logs actifs et monitorés
- [ ] Rate limiting actif
- [ ] CORS configuré
- [ ] Test du health check
- [ ] Test du login/register
- [ ] Test des paiements (avec montant de test)

## 📞 Support Railway

- Docs: https://docs.railway.app
- Discord: https://discord.gg/railway
