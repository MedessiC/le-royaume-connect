# Cache Busting & Automatic Version Updates

Ce système détecte automatiquement les nouvelles versions du site et informe l'utilisateur de recharger la page.

## How It Works

### 1. **Version File (`/public/version.txt`)**
- Contient le numéro de version actuel
- Mise à jour à chaque déploiement
- Servi avec `Cache-Control: max-age=0` (pas de cache)

### 2. **Cache Busting avec Hashes**
- Vite génère des hashes pour tous les assets
- Les fichiers `.js` et `.css` sont cachés pendant 1 an (immutable)
- Le HTML principal n'est pas mis en cache
- La version.txt n'est pas mise en cache

### 3. **Détection Automatique** (`src/lib/versionCheck.ts`)
- Vérifie la version toutes les 5 minutes
- Compare avec la version en cache
- Affiche une notification si une nouvelle version est disponible
- Propose de recharger la page

### 4. **Notification Utilisateur**
- Bannière jaune en haut de la page
- Bouton "Recharger" pour mettre à jour immédiatement
- Bouton "✕" pour fermer la bannière
- Notification système (optionnelle)

## Configuration

### Netlify Headers
Les headers HTTP sont configurés dans `netlify.toml`:

```toml
# HTML - Jamais mis en cache
/index.html → Cache-Control: max-age=0, must-revalidate

# Version - Jamais mise en cache
/version.txt → Cache-Control: max-age=0, must-revalidate

# Assets avec hash - Mis en cache 1 an
/*.js → Cache-Control: max-age=31536000, immutable
/*.css → Cache-Control: max-age=31536000, immutable
```

### Vite Configuration
La configuration Vite dans `vite.config.ts` ajoute des hashes aux noms de fichiers:

```typescript
build: {
  rollupOptions: {
    output: {
      entryFileNames: '[name].[hash].js',
      chunkFileNames: '[name].[hash].js',
      assetFileNames: '[name].[hash][extname]'
    }
  }
}
```

## Deployment Process

### 1. **Local Development**
```bash
npm run dev
# Les changements sont automatiquement rechargés
```

### 2. **Build & Deploy**
```bash
npm run build
# Vite génère des fichiers avec hashes
# Vérifiez que version.txt existe dans public/
```

### 3. **Update Version Number** (Manual for now)
Avant de déployer:
```bash
# Mettez à jour la version dans public/version.txt
echo "1.0.1" > public/version.txt
```

### 4. **Deploy to Netlify**
```bash
npm run build
netlify deploy --prod
```

Les utilisateurs verront une notification de mise à jour!

## Semantic Versioning

Format: `MAJOR.MINOR.PATCH`

- **MAJOR**: Changements incompatibles
- **MINOR**: Nouvelles fonctionnalités compatibles
- **PATCH**: Corrections de bugs

Exemples:
- `1.0.0` - Version initiale
- `1.1.0` - Nouvelle page (Donate page)
- `1.0.1` - Correction de bug

## What Gets Cached

| Type | Cache Duration | Reason |
|------|-----------------|--------|
| HTML | 0s (no cache) | Toujours chercher la version la plus récente |
| version.txt | 0s (no cache) | Détection de mise à jour |
| JS files | 1 an | Hash unique par version |
| CSS files | 1 an | Hash unique par version |
| Images | 1 heure | Peut changer |
| Fonts | 1 an | Rarement changé |

## User Experience

### Scenario 1: User on Old Version, New Deploy
1. ✅ Utilisateur navigue sur le site (ancienne version)
2. ✅ Check-up de version toutes les 5 minutes
3. ✅ Détecte nouvelle version
4. ✅ Affiche bannière jaune "Mise à jour disponible"
5. ✅ Utilisateur clique "Recharger"
6. ✅ Nouvelle version chargée

### Scenario 2: Page Refresh After Deploy
1. ✅ Utilisateur actualise la page
2. ✅ Nouveaux assets chargés (hash différent)
3. ✅ Anciens assets en cache ne sont pas utilisés
4. ✅ Dernière version affichée

## Troubleshooting

### Version not updating?
- Vérifiez que `public/version.txt` existe
- Vérifiez les headers HTTP dans Netlify
- Ouvrez DevTools → Network → version.txt
- Doit montrer `Cache-Control: max-age=0`

### Old version still showing?
- Hard refresh: `Cmd+Shift+R` (Mac) ou `Ctrl+Shift+R` (Windows)
- Clearez le cache: DevTools → Application → Clear storage
- Vérifiez que Vite a généré les hashes: `npm run build`

### Banner not showing?
- Vérifiez la console pour les erreurs
- Assurez-vous que `initVersionCheck()` est appelé dans App.tsx
- Vérifiez que le CSS n'est pas masqué

## Future Improvements

- [ ] Faire un script npm pour mettre à jour automatiquement la version
- [ ] Utiliser git tags pour gérer les versions
- [ ] Ajouter une page de changelog
- [ ] Stocker l'historique des versions
- [ ] Analytics sur les mises à jour
- [ ] Migrations de données si nécessaire
