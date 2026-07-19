# Backend Express - Documentation Complète

## 🚀 Quick Start

```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your configuration
npm run dev
```

## 📋 Structure du Projet

```
backend/
├── src/
│   ├── index.ts                 # Entry point Express
│   ├── controllers/             # Business logic
│   │   ├── auth.ts             # Authentication
│   │   ├── payments.ts         # Payment handling
│   │   ├── users.ts            # User management
│   │   └── teachings.ts        # Teaching management
│   ├── routes/                  # API endpoints
│   │   ├── auth.ts
│   │   ├── payments.ts
│   │   ├── users.ts
│   │   └── teachings.ts
│   ├── middleware/              # Express middleware
│   │   ├── auth.ts             # JWT authentication
│   │   ├── errorHandler.ts     # Error handling & validation
│   │   └── rateLimiter.ts      # Rate limiting
│   ├── utils/
│   │   ├── logger.ts           # Winston logger
│   │   ├── validation.ts       # Zod schemas
│   │   └── connection.ts       # Database pool
│   └── db/
│       └── migrate.ts          # Migration runner
├── migrations/                  # SQL migrations
└── package.json
```

## 🔧 Configuration

### Fichier `.env`

```env
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/le_royaume_dev

# Server
PORT=5000
NODE_ENV=development
API_URL=http://localhost:5000
FRONTEND_URL=http://localhost:5173

# JWT
JWT_SECRET=your-super-secret-key
JWT_EXPIRE=7d

# Google OAuth
GOOGLE_CLIENT_ID=xxx.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=xxx
GOOGLE_CALLBACK_URL=http://localhost:5000/api/auth/google/callback

# FeePay
FEEPAY_API_KEY=xxx
FEEPAY_SHOP_ID=xxx
```

## 📡 API Endpoints

### Authentication

#### Register
```bash
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePass123",
  "fullName": "John Doe",
  "country": "Benin"
}

Response:
{
  "user": { "id": "uuid", "email": "...", "full_name": "..." },
  "token": "eyJhbGc..."
}
```

#### Login
```bash
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePass123"
}

Response:
{
  "user": { "id": "uuid", "email": "...", "fullName": "..." },
  "token": "eyJhbGc...",
  "role": "member"
}
```

#### Google OAuth
```bash
# Client redirects to:
GET /api/auth/google

# After Google authorization, redirects to:
GET /api/auth/google/callback?code=...
# Then redirects to: http://localhost:5173/auth/callback?token=...&userId=...
```

#### Get Profile
```bash
GET /api/auth/profile
Authorization: Bearer <token>

Response:
{
  "id": "uuid",
  "email": "user@example.com",
  "full_name": "John Doe",
  "country": "Benin",
  "avatar_url": "https://...",
  "created_at": "2026-07-18T...",
  "role": "member"
}
```

#### Update Profile
```bash
PUT /api/auth/profile
Authorization: Bearer <token>
Content-Type: application/json

{
  "fullName": "Jane Doe",
  "country": "Togo",
  "avatarUrl": "https://..."
}
```

### Payments

#### Create Payment
```bash
POST /api/payments
Authorization: Bearer <token>
Content-Type: application/json

{
  "phoneNumber": "+22962123456",
  "amount": 5000,
  "network": "mtn",
  "description": "Donation",
  "firstName": "John",
  "lastName": "Doe"
}

Response:
{
  "paymentId": "uuid",
  "feepayTransactionId": "tx_123456",
  "status": "pending"
}
```

#### Get Payment Status
```bash
GET /api/payments/<paymentId>
Authorization: Bearer <token>

Response:
{
  "id": "uuid",
  "user_id": "uuid",
  "phone_number": "+22962123456",
  "amount": 5000,
  "network": "mtn",
  "status": "completed",
  "feepay_transaction_id": "tx_123456",
  "created_at": "2026-07-18T...",
  "updated_at": "2026-07-18T..."
}
```

#### Get Payment History
```bash
GET /api/payments?limit=10&offset=0
Authorization: Bearer <token>

Response:
{
  "payments": [...],
  "total": 42,
  "limit": 10,
  "offset": 0
}
```

### Teachings

#### Create Teaching
```bash
POST /api/teachings
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Meditation Guide",
  "excerpt": "Learn to meditate",
  "content": "Full content...",
  "category_id": "uuid",
  "country": "Benin"
}

Response:
{
  "id": "uuid",
  "title": "Meditation Guide",
  "content": "...",
  "author_id": "uuid",
  "published": false,
  "created_at": "2026-07-18T..."
}
```

#### Get Teachings
```bash
GET /api/teachings?limit=10&offset=0&category=uuid&search=meditation&published=true

Response:
{
  "teachings": [...],
  "total": 5,
  "limit": 10,
  "offset": 0
}
```

#### Get Teaching by ID
```bash
GET /api/teachings/<teachingId>

Response:
{
  "id": "uuid",
  "title": "...",
  "content": "...",
  "author_id": "uuid",
  "published": true,
  "created_at": "2026-07-18T..."
}
```

#### Update Teaching
```bash
PUT /api/teachings/<teachingId>
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Updated Title",
  "published": true
}
```

#### Delete Teaching
```bash
DELETE /api/teachings/<teachingId>
Authorization: Bearer <token>
```

### Users (Admin Only)

#### Get Users
```bash
GET /api/users?limit=10&offset=0&search=john
Authorization: Bearer <token>

Response:
{
  "users": [...],
  "total": 42,
  "limit": 10,
  "offset": 0
}
```

#### Assign Role
```bash
POST /api/users/<userId>/role
Authorization: Bearer <token>
Content-Type: application/json

{
  "role": "admin"
}
```

#### Delete User
```bash
DELETE /api/users/<userId>
Authorization: Bearer <token>
```

## 🔐 Sécurité

### Rate Limiting
- **API Général**: 100 requêtes/15 minutes
- **Authentification**: 10 tentatives/15 minutes
- **Paiements**: 5 tentatives/heure (par numéro de téléphone)
- **Public**: 30 requêtes/minute

### Middleware d'Authentification
```typescript
import { authMiddleware, adminMiddleware } from './middleware/auth';

// Applique sur une route:
router.get('/protected', authMiddleware, controller);
router.post('/admin', authMiddleware, adminMiddleware, controller);
```

### Validation des Données
```typescript
import { validateRequest } from './middleware/errorHandler';
import { PaymentRequestSchema } from './utils/validation';

router.post(
  '/',
  validateRequest(PaymentRequestSchema),
  controller
);
```

## 🗄️ Base de Données

### Migrations
```bash
# Run migrations
npm run migrate

# Check migration status
psql $DATABASE_URL -c "SELECT * FROM migrations;"
```

### Tables Principales
- `users` - Profils utilisateur
- `user_roles` - Rôles (admin/member)
- `payments` - Transactions FeePay
- `teachings` - Enseignements
- `categories` - Catégories
- `comments` - Commentaires
- `likes` - Likes
- `follows` - Abonnements
- `notifications` - Notifications

## 🚀 Déploiement Railway

### 1. Créer un compte Railway
Allez sur https://railway.app

### 2. Créer un nouveau projet
```bash
# Depuis la racine du projet
railway init
```

### 3. Configurer le déploiement
```bash
railway add # Ajouter PostgreSQL
railway link # Lier au projet
```

### 4. Ajouter les variables d'environnement
Dans le dashboard Railway:
- `DATABASE_URL` (auto-généré par PostgreSQL)
- `JWT_SECRET`
- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
- `GOOGLE_CALLBACK_URL=https://your-app.railway.app/api/auth/google/callback`
- `FEEPAY_API_KEY`
- `FEEPAY_SHOP_ID`
- `NODE_ENV=production`
- `API_URL=https://your-app.railway.app`
- `FRONTEND_URL=https://your-frontend.netlify.app`

### 5. Déployer
```bash
railway deploy
```

## 🧪 Testing

### Postman Collection
Importez cette collection Postman pour tester les endpoints:

```json
{
  "info": {
    "name": "Le Règne Backend",
    "description": "API endpoints"
  },
  "item": [
    {
      "name": "Register",
      "request": {
        "method": "POST",
        "url": "{{BASE_URL}}/api/auth/register",
        "body": {
          "mode": "raw",
          "raw": "{\"email\":\"test@example.com\",\"password\":\"SecurePass123\",\"fullName\":\"Test User\"}"
        }
      }
    }
  ]
}
```

## 📊 Monitoring

Les logs sont stockés dans:
- `combined.log` - Tous les logs
- `error.log` - Erreurs uniquement

```bash
# Tail logs en temps réel
tail -f combined.log
```

## 🆘 Troubleshooting

### Erreur: `getaddrinfo ENOTFOUND postgres`
- Vérifiez que PostgreSQL est en cours d'exécution
- Vérifiez `DATABASE_URL` dans `.env`

### Erreur: `Password authentication failed`
- Vérifiez les identifiants PostgreSQL

### Erreur: `GOOGLE_CLIENT_SECRET not found`
- Vérifiez les variables d'environnement

## 📞 Support

Pour des questions, consultez:
- [Express.js Docs](https://expressjs.com/)
- [PostgreSQL Docs](https://www.postgresql.org/docs/)
- [Zod Validation](https://zod.dev/)
