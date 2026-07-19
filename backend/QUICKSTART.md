# Quick Start - Backend

## 🚀 5 Minutes Setup

### 1. Install & Configure

```bash
cd backend
chmod +x setup.sh
./setup.sh
```

### 2. Edit `.env`

```env
# Database - Votre PostgreSQL local ou railway
DATABASE_URL=postgresql://postgres:password@localhost:5432/le_royaume

# JWT Secret - Générez une clé aléatoire
JWT_SECRET=$(openssl rand -base64 32)

# Google OAuth - Depuis Google Cloud Console
GOOGLE_CLIENT_ID=xxx.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=xxx

# FeePay - De votre dashboard FeePay
FEEPAY_API_KEY=xxx
FEEPAY_SHOP_ID=xxx
```

### 3. Lancer le Backend

```bash
npm run dev
```

Backend tourne sur http://localhost:5000

## 🧪 Test Rapide

### Vérifier la santé du serveur

```bash
curl http://localhost:5000/health
# Response: {"status":"healthy","timestamp":"..."}
```

### Test Register

```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "SecurePass123",
    "fullName": "Test User"
  }'

# Response: {"user": {...}, "token": "eyJ..."}
```

### Test Login

```bash
TOKEN=$(curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "SecurePass123"
  }' | jq -r '.token')

echo $TOKEN
```

### Test Protected Route

```bash
curl http://localhost:5000/api/auth/profile \
  -H "Authorization: Bearer $TOKEN"

# Response: {"id": "...", "email": "...", ...}
```

## 📡 Structure API Rapide

```
POST   /api/auth/register          → Créer compte
POST   /api/auth/login             → Login
GET    /api/auth/profile           → Mon profil
PUT    /api/auth/profile           → Modifier profil

POST   /api/payments               → Créer paiement
GET    /api/payments/<id>          → Statut paiement
GET    /api/payments               → Historique

GET    /api/teachings              → Tous les teachings
POST   /api/teachings              → Créer teaching
PUT    /api/teachings/<id>         → Modifier
DELETE /api/teachings/<id>         → Supprimer

GET    /api/users                  → Liste (admin)
POST   /api/users/<id>/role        → Assigner rôle (admin)
DELETE /api/users/<id>             → Supprimer user (admin)
```

## 🐳 Avec Docker (Optionnel)

```dockerfile
# backend/Dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY dist ./dist
EXPOSE 5000
CMD ["npm", "start"]
```

```bash
# Build & run
docker build -t le-royaume-backend .
docker run -p 5000:5000 --env-file .env le-royaume-backend
```

## 🐘 PostgreSQL Local Setup

### Avec Homebrew (Mac)

```bash
brew install postgresql
brew services start postgresql
createdb le_royaume
```

### Avec Docker

```bash
docker run --name postgres -e POSTGRES_PASSWORD=password \
  -p 5432:5432 -d postgres:15

docker exec postgres createdb -U postgres le_royaume
```

## 🚀 Déployer sur Railway

```bash
npm install -g railway

railway init
railway add
railway variables # Ajouter vos secrets
railway deploy
```

## 🆘 Aide Rapide

| Problème | Solution |
|----------|----------|
| Port 5000 en usage | `lsof -i :5000` puis `kill -9 <PID>` |
| DB connection error | Vérifiez `DATABASE_URL` dans `.env` |
| CORS error | Vérifiez `FRONTEND_URL` dans `.env` |
| Migration failed | Vérifiez que PostgreSQL tourne |
| Google auth fail | Vérifiez `GOOGLE_CLIENT_ID/SECRET` |

## 📚 Docs Complètes

- **README.md** - Documentation détaillée
- **RAILWAY_SETUP.md** - Guide Railway
- **FRONTEND_INTEGRATION.md** - Intégration React

## 🎯 Prochaines Étapes

1. ✅ Backend lancé localement
2. → Configurer frontend pour appeler votre backend
3. → Tester paiements FeePay
4. → Déployer sur Railway
5. → Configurer domaine personnalisé

---

**Questions?** Consultez les fichiers markdown ci-dessus! 🚀
