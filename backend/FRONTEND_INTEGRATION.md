# Frontend → Backend Integration

## 🔗 Configuration

### 1. Ajouter l'API URL au Frontend

Dans `src/main.tsx` ou un fichier de config:

```typescript
// src/config/api.ts
export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
```

Dans `vite.config.ts`:

```typescript
export default defineConfig({
  define: {
    __API_URL__: JSON.stringify(process.env.VITE_API_URL || 'http://localhost:5000'),
  },
});
```

### 2. Créer un Service API

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
    if (response.status === 401) {
      // Clear token and redirect to login
      localStorage.removeItem('token');
      window.location.href = '/auth';
    }
    const error = await response.json();
    throw new Error(error.error || response.statusText);
  }

  return response.json();
}

// Auth API
export const authAPI = {
  register: (data: any) =>
    apiCall('/api/auth/register', { method: 'POST', body: JSON.stringify(data) }),
  login: (data: any) =>
    apiCall('/api/auth/login', { method: 'POST', body: JSON.stringify(data) }),
  getProfile: (token: string) =>
    apiCall('/api/auth/profile', {}, token),
  updateProfile: (data: any, token: string) =>
    apiCall('/api/auth/profile', { method: 'PUT', body: JSON.stringify(data) }, token),
};

// Payments API
export const paymentsAPI = {
  create: (data: any, token: string) =>
    apiCall('/api/payments', { method: 'POST', body: JSON.stringify(data) }, token),
  getStatus: (paymentId: string, token: string) =>
    apiCall(`/api/payments/${paymentId}`, {}, token),
  getHistory: (token: string, limit = 10, offset = 0) =>
    apiCall(`/api/payments?limit=${limit}&offset=${offset}`, {}, token),
};

// Teachings API
export const teachingsAPI = {
  list: (limit = 10, offset = 0, category?: string, search?: string) =>
    apiCall(`/api/teachings?limit=${limit}&offset=${offset}${category ? `&category=${category}` : ''}${search ? `&search=${search}` : '}`, {}),
  get: (id: string) =>
    apiCall(`/api/teachings/${id}`, {}),
  create: (data: any, token: string) =>
    apiCall('/api/teachings', { method: 'POST', body: JSON.stringify(data) }, token),
  update: (id: string, data: any, token: string) =>
    apiCall(`/api/teachings/${id}`, { method: 'PUT', body: JSON.stringify(data) }, token),
  delete: (id: string, token: string) =>
    apiCall(`/api/teachings/${id}`, { method: 'DELETE' }, token),
};

// Users API (Admin)
export const usersAPI = {
  list: (limit = 10, offset = 0, search?: string, token?: string) =>
    apiCall(`/api/users?limit=${limit}&offset=${offset}${search ? `&search=${search}` : ''}`, {}, token),
  assignRole: (userId: string, role: string, token: string) =>
    apiCall(`/api/users/${userId}/role`, { method: 'POST', body: JSON.stringify({ role }) }, token),
  delete: (userId: string, token: string) =>
    apiCall(`/api/users/${userId}`, { method: 'DELETE' }, token),
};
```

## 🔐 Gestion de l'Authentification

### Remplacer Supabase Auth par le Backend

```typescript
// src/hooks/useAuth.tsx
import { useContext, useEffect, useState } from 'react';
import { authAPI } from '../lib/api';

export function useAuth() {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Charger depuis localStorage
    const savedToken = localStorage.getItem('token');
    if (savedToken) {
      setToken(savedToken);
      fetchProfile(savedToken);
    }
    setLoading(false);
  }, []);

  async function fetchProfile(token: string) {
    try {
      const profile = await authAPI.getProfile(token);
      setUser(profile);
    } catch (error) {
      localStorage.removeItem('token');
      setToken(null);
    }
  }

  async function login(email: string, password: string) {
    const { token, user } = await authAPI.login({ email, password });
    localStorage.setItem('token', token);
    setToken(token);
    setUser(user);
    return { token, user };
  }

  async function register(email: string, password: string, fullName: string) {
    const { token, user } = await authAPI.register({ email, password, fullName });
    localStorage.setItem('token', token);
    setToken(token);
    setUser(user);
    return { token, user };
  }

  function logout() {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  }

  return {
    user,
    token,
    loading,
    login,
    register,
    logout,
    isAuthenticated: !!token,
  };
}
```

### Mettre à Jour Auth.tsx

```typescript
// src/pages/Auth.tsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export default function Auth() {
  const { login, register } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  async function handleGoogleLogin() {
    window.location.href = `${import.meta.env.VITE_API_URL}/api/auth/google`;
  }

  async function handleSubmit(e: any) {
    e.preventDefault();
    setIsLoading(true);

    const formData = new FormData(e.target);
    const email = formData.get('email');
    const password = formData.get('password');
    const fullName = formData.get('fullName');

    try {
      if (isLogin) {
        await login(email, password);
      } else {
        await register(email, password, fullName);
      }
      navigate('/feed');
    } catch (error: any) {
      alert(error.message);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      {/* Your form fields */}
      <button type="submit" disabled={isLoading}>
        {isLoading ? 'Loading...' : 'Login'}
      </button>
      <button type="button" onClick={handleGoogleLogin}>
        Continuer avec Google
      </button>
    </form>
  );
}
```

## 💳 Intégration Paiements

### Mettre à Jour FeepayDialog.tsx

```typescript
// src/components/FeepayDialog.tsx
import { paymentsAPI } from '../lib/api';
import { useAuth } from '../hooks/useAuth';

export default function FeepayDialog() {
  const { token } = useAuth();
  const [loading, setLoading] = useState(false);

  async function handlePayment(e: any) {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.target);
    const paymentData = {
      phoneNumber: formData.get('phoneNumber'),
      amount: parseInt(formData.get('amount')),
      network: formData.get('network'),
      firstName: formData.get('firstName'),
      lastName: formData.get('lastName'),
    };

    try {
      const result = await paymentsAPI.create(paymentData, token);
      
      // Vérifier le statut
      setInterval(async () => {
        const status = await paymentsAPI.getStatus(result.paymentId, token);
        if (status.status !== 'pending') {
          alert(`Payment ${status.status}!`);
          // Update UI
        }
      }, 5000);
    } catch (error: any) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handlePayment}>
      {/* Form fields */}
      <button type="submit" disabled={loading}>
        Pay
      </button>
    </form>
  );
}
```

## 📚 Intégration Teachings

### Mettre à Jour TeachingCard.tsx

```typescript
// src/components/TeachingCard.tsx
import { teachingsAPI } from '../lib/api';

export default function TeachingCard({ teaching }) {
  const [data, setData] = useState(null);

  useEffect(() => {
    teachingsAPI.get(teaching.id).then(setData);
  }, [teaching.id]);

  return (
    <div>
      <h3>{data?.title}</h3>
      <p>{data?.excerpt}</p>
      <a href={`/teaching/${data?.id}`}>Lire la suite</a>
    </div>
  );
}
```

## 👥 Admin Dashboard

### Mettre à Jour Admin.tsx

```typescript
// src/pages/Admin.tsx
import { usersAPI } from '../lib/api';
import { useAuth } from '../hooks/useAuth';

export default function Admin() {
  const { token } = useAuth();
  const [users, setUsers] = useState([]);
  const [displayedCount, setDisplayedCount] = useState(10);

  useEffect(() => {
    loadUsers();
  }, []);

  async function loadUsers() {
    try {
      const result = await usersAPI.list(displayedCount, 0, '', token);
      setUsers(result.users);
    } catch (error) {
      console.error(error);
    }
  }

  async function assignRole(userId: string, role: string) {
    try {
      await usersAPI.assignRole(userId, role, token);
      loadUsers();
    } catch (error) {
      alert(error.message);
    }
  }

  return (
    <div>
      {users.map(user => (
        <div key={user.id}>
          <p>{user.email}</p>
          <select
            onChange={(e) => assignRole(user.id, e.target.value)}
            defaultValue={user.roles[0] || 'member'}
          >
            <option value="member">Member</option>
            <option value="admin">Admin</option>
          </select>
        </div>
      ))}
    </div>
  );
}
```

## 🧪 Variables d'Environnement

### .env.local (Development)

```env
VITE_SUPABASE_URL=https://... # Garder pour compatibilité
VITE_SUPABASE_ANON_KEY=...   # Garder pour compatibilité
VITE_API_URL=http://localhost:5000
```

### Netlify (Production)

Dans Build & Deploy → Environment:

```env
VITE_API_URL=https://your-backend.railway.app
```

## 🔒 Migration de Supabase vers Backend

Il est possible de garder les deux systèmes en parallèle:

```typescript
// Utiliser Supabase pour auth si vous voulez
// Utiliser votre backend pour les autres APIs

// Ou migrer complètement:
// 1. Exporter les données depuis Supabase
// 2. Importer dans PostgreSQL Backend
// 3. Mettre à jour les appels API
```

## 📞 Troubleshooting

### CORS Error
```
Access-Control-Allow-Origin header is missing
```

Vérifiez `FRONTEND_URL` dans le backend `.env`

### Token Expired
```typescript
// Automatiquement redirige vers /auth dans apiCall()
```

### API 404
Vérifiez que `VITE_API_URL` est correct et que le backend tourne.

## ✅ Checklist d'Intégration

- [ ] API service créé (`src/lib/api.ts`)
- [ ] useAuth hook mis à jour
- [ ] Auth.tsx intégré
- [ ] FeepayDialog intégré
- [ ] Teachings API intégré
- [ ] Admin dashboard intégré
- [ ] Variables d'environnement configurées
- [ ] Tests manuels passés
- [ ] CORS vérifié
