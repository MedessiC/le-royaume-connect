# Welcome to your Lovable project

TODO: Document your project here
 
## Configuration des paiements

Dans `.env` ou dans votre plateforme d’hébergement, configurez les variables suivantes :

- `VITE_STRIPE_PAYMENT_LINK` : lien de paiement Stripe (Payment Link). Exemple : `https://buy.stripe.com/test_123456?amount={{amount}}&currency={{currency}}`
- `VITE_PAYPAL_BUSINESS_ID` : identifiant business PayPal (adresse e-mail ou Merchant ID). Le système construit l’URL PayPal automatiquement.
- `VITE_FEDAPAY_PAYMENT_LINK` : lien de paiement Fedapay. Exemple : `https://checkout.fedapay.com/abcde?amount={{amount}}&currency={{currency}}`
- `VITE_DONATION_PAYMENT_LINK` : lien vers tout autre agrégateur ou prestataire de paiement.
- `VITE_DONATION_CURRENCY` : devise utilisée pour la page de dons (par défaut `EUR`).

La page de dons ouvrira le lien configuré dans un nouvel onglet et enverra le montant sélectionné ou saisi.
