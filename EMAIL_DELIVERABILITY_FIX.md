# ✅ Fix: Lien de Reset Password Marqué comme Spam par Gmail

## 🔍 Pourquoi c'est considéré comme spam?

Quand vous utilisez Supabase **sans configuration personnalisée**, les emails viennent de domaines Supabase (`*.supabase.co`) sans authentification propre. Gmail marque ces emails comme suspects car:

1. **SPF/DKIM/DMARC manquants** - Pas d'authentification du domaine
2. **Domaine partagé** - Beaucoup d'applications utilisent le même domaine
3. **Réputation du domaine** - Si d'autres utilisent ce domaine pour du spam, Gmail remet en question tous les emails

---

## 🛠️ Solutions (par ordre de priorité)

### ✅ Solution 1: Configurer un Domaine Email Personnalisé (RECOMMANDÉ)

C'est la solution la plus efficace. Supabase permet d'utiliser votre propre domaine pour les emails.

#### Prérequis:
- Un domaine que vous contrôlez (ex: `royaume-connect.com`)
- Accès aux enregistrements DNS du domaine

#### Étapes dans Supabase:

1. **Allez à:** Authentication → Email Templates → Custom SMTP ou Email Domain
2. **Sélectionnez:** "Custom email domain"
3. **Entrez votre domaine:** ex `noreply@royaume-connect.com` ou `auth@royaume-connect.com`
4. **Supabase génère les enregistrements DNS** à ajouter:
   - Enregistrement **MX**
   - Enregistrement **SPF**
   - Enregistrement **DKIM**
   - Enregistrement **DMARC** (optionnel mais recommandé)

#### Ajouter les enregistrements DNS:

1. Allez chez votre registrar DNS (OVH, Cloudflare, Namecheap, etc.)
2. Ajoutez les enregistrements fournis par Supabase
3. **Attendez 24-48h** pour la propagation DNS
4. Vérifiez dans Supabase que les enregistrements sont détectés ✓

---

### ✅ Solution 2: Utiliser Sendgrid/Resend (Alternative)

Si le domaine personnalisé ne fonctionne pas, utilisez un service email tiers mieux réputé:

#### Option A: **Sendgrid** (recommandé)

1. Créez un compte [SendGrid](https://sendgrid.com)
2. Vérifiez votre domaine pour SPF/DKIM
3. Configurez Supabase pour utiliser SMTP SendGrid:
   - **Host:** `smtp.sendgrid.net`
   - **Port:** `587` ou `465`
   - **Username:** `apikey`
   - **Password:** Votre clé API SendGrid

Dans Supabase → Authentication → Email:
```
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASS=your-sendgrid-api-key
SMTP_FROM_EMAIL=noreply@royaume-connect.com
SMTP_FROM_NAME=Le Royaume Connect
```

#### Option B: **Resend** (plus simple)

Resend est spécialisé dans les emails transactionnels:

1. Créez un compte [Resend](https://resend.com)
2. Vérifiez votre domaine
3. Utilisez SMTP Resend dans Supabase

---

### ✅ Solution 3: Vérifier les Templates d'Email

Allez dans Supabase → Authentication → Email Templates

Vérifiez que le template de réinitialisation:
- ✅ Utilise du **HTML propre** (pas de styles louches)
- ✅ Contient un **lien HTTPS** (pas HTTP)
- ✅ N'a pas **trop de liens** ou d'images externes
- ✅ N'utilise pas **trop de couleurs flashy ou mots de spam**

---

### ✅ Solution 4: Configurer SPF/DKIM/DMARC Manuellement

Si vous avez votre domaine, ajoutez ces enregistrements DNS:

#### SPF (empêche le spoofing):
```dns
v=spf1 include:sendgrid.net ~all
```
ou si vous utilisez Supabase native:
```dns
v=spf1 include:mail.supabase.co ~all
```

#### DKIM (signe les emails):
Supabase/SendGrid fournit les clés DKIM → ajoutez-les dans DNS

#### DMARC (protection supplémentaire):
```dns
v=DMARC1; p=none; rua=mailto:admin@royaume-connect.com
```

---

## 🔧 Implémentation Recommandée pour Votre Projet

Pour **Le Royaume Connect**, voici ce que je recommande:

### Étape 1: ✅ Activer Domaine Personnalisé dans Supabase (5 min)

```toml
# supabase/config.toml
[auth.email]
enable_signup = true
double_confirm_changes = false
enable_confirmations = true
max_frequency = "3600s"

# Ajouter domaine personnalisé
enable_custom_domain = true
custom_domain = "auth.royaume-connect.com"  # ou "noreply@..."
```

### Étape 2: ✅ Ajouter les Enregistrements DNS (du côté registrar)

Chez votre registrar DNS, ajouter:
- **MX** record pointant vers Supabase
- **SPF** record
- **DKIM** record (clé fournie par Supabase)

### Étape 3: ✅ Tester

1. Demandez une réinitialisation de password
2. Vérifiez que l'email **n'est PAS en spam**
3. Cliquez sur le lien → devrait fonctionner ✓

---

## 📋 Checklist de Délivrabilité Email

- [ ] Domaine personnalisé configuré dans Supabase
- [ ] Enregistrements SPF/DKIM/DMARC ajoutés à DNS
- [ ] SPF/DKIM vérifié comme ✓ dans Supabase
- [ ] URL de redirection en HTTPS dans Supabase
- [ ] Email template n'a pas de contenu suspect
- [ ] Tester avec Gmail/Outlook → Ne doit **PAS** aller en spam
- [ ] Vérifier le score SPF/DKIM avec [MXToolbox](https://mxtoolbox.com)

---

## 🔍 Vérifier votre Configuration Actuelle

Allez vérifier:

1. **Supabase Dashboard** → Authentication → Email
   - Quel domaine d'envoi est configuré?
   - Est-ce `*.supabase.co` (par défaut) ou un domaine personnalisé?

2. **Gmail** → Paramètres → Afficher les détails de l'email reçu
   - Vérifié par SPF? ✓
   - Vérifié par DKIM? ✓
   - Reçu de quel domaine?

3. **MXToolbox.com** → SPF Check + DKIM Check
   - Entrez votre domaine pour voir la configuration actuelle

---

## 🚨 Problèmes Courants

| Problème | Solution |
|----------|----------|
| Email toujours en spam après DNS | SPF/DKIM propagation prend 24-48h |
| Lien de reset cassé | Vérifier URL de redirection dans Supabase |
| Email ne reçu pas du tout | Vérifier enregistrement MX dans DNS |
| "Domaine Supabase par défaut" | Activer domaine personnalisé |

---

## 📚 Ressources

- 📖 [Supabase Email Auth Docs](https://supabase.com/docs/guides/auth/auth-email)
- 🔧 [Supabase Custom Email Domain](https://supabase.com/docs/guides/auth/custom-email-templates)
- 📨 [SendGrid SMTP Setup](https://sendgrid.com/docs/for-developers/sending-email/integrate-with-the-smtp-api/)
- ✅ [MXToolbox - Verify SPF/DKIM](https://mxtoolbox.com)
