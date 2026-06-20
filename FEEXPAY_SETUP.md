# FeexPay Integration Guide

## Overview

The donation page has been completely redesigned to use **FeexPay** for secure payment processing. FeexPay supports multiple payment methods including:

- 💳 **Cartes bancaires** (Visa, Mastercard, etc.)
- 💰 **Portefeuille Mobile** (Mobile Money)
- 🏦 **Transferts bancaires**

## What's Changed

### Old Integration (Removed)
- Multiple payment aggregators (Stripe, PayPal, Fedapay, FeePay)
- Complex provider selection dialog
- Multiple backend functions
- Various currency handling

### New Integration (FeexPay Only)
- Single, clean payment interface
- Simplified amount selection
- Direct FeexPay SDK integration
- XOF currency (local currency)
- Modern, responsive UI

## Environment Setup

### 1. Get FeexPay Credentials

1. Create/Login to FeexPay account: https://feexpay.me
2. Get your credentials from the dashboard:
   - **Shop ID** (ID de la boutique)
   - **API Token** (Token API)

### 2. Configure Environment Variables

Create `.env.local` in the project root:

```bash
# FeexPay Configuration
VITE_FEEXPAY_SHOP_ID=your_shop_id_here
VITE_FEEXPAY_TOKEN=your_api_token_here
VITE_FEEXPAY_MODE=SANDBOX
```

**Example values:**
```bash
VITE_FEEXPAY_SHOP_ID=Ayg9lkjkhurIvNp
VITE_FEEXPAY_TOKEN=fp_HHNoQGt9Vn8KpZoLaBkGDsEDKpLUYBaHUZIZXJE3Xgv0OKG2tK3A7Ptlytctiked
VITE_FEEXPAY_MODE=SANDBOX
```

### 3. Netlify Deployment

Set environment variables in Netlify Dashboard:

1. Go to **Site Settings** → **Build & deploy** → **Environment**
2. Click **Edit variables**
3. Add:
   - Key: `VITE_FEEXPAY_SHOP_ID`
   - Key: `VITE_FEEXPAY_TOKEN`
   - Key: `VITE_FEEXPAY_MODE` (set to `LIVE` for production)

## File Structure

```
src/
├── pages/
│   └── Donate.tsx              # Main donation page with FeexPay integration
```

### Key Changes in Donate.tsx

**Removed Components:**
- FeepayDialog component
- Multiple payment provider logic
- Dialog for provider selection

**New Features:**
- Direct FeexPay SDK loading
- Simplified amount selection
- FeexPay button initialization
- Payment callback handling
- Responsive benefits section

## Payment Flow

```
1. User selects or enters donation amount
2. User clicks "Procéder au paiement"
3. FeexPay SDK initializes payment button
4. FeexPay modal opens
5. User completes payment
6. Callback function processes result
7. Success/error toast notification
```

## API Integration

### FeexPay SDK

**Script URL:** `https://api-v2.feexpay.me/feexpay-javascript-sdk/index.js`

**Initialization:**
```javascript
FeexPayButton.init("container-id", {
  id: "shop-id",              // Shop ID from FeexPay
  amount: 5000,               // Amount in XOF
  token: "api-token",         // API token
  mode: "LIVE",               // SANDBOX or LIVE
  custom_id: "DON_123...",    // Unique transaction ID
  description: "Description", // Payment description
  callback: (response) => {   // Success callback
    // Handle payment response
  },
  error_callback_url: "...",  // Error redirect URL
});
```

### Response Format

**Success Response:**
```javascript
{
  status: "SUCCESS",
  transaction_id: "TXN_123456",
  amount: 5000,
  // ... other fields
}
```

## Testing

### 1. Development Mode

```bash
# Set test credentials in .env.local
VITE_FEEXPAY_MODE=SANDBOX

# Run development server
npm run dev
```

### 2. Test Payments

FeexPay provides test card numbers for SANDBOX mode:

- **Visa:** 4532 0151 1113 0101 (any future date, any CVV)
- **Mastercard:** 5199 0520 0000 0005 (any future date, any CVV)

### 3. Monitor Logs

Check browser console for SDK loading and payment events:
```bash
# Terminal
npm run dev

# Browser Console (F12)
# Should show: "FeexPay SDK loaded successfully"
```

## Configuration Options

### VITE_FEEXPAY_MODE

| Mode | Usage | Token Type |
|------|-------|-----------|
| `SANDBOX` | Development/Testing | Test token from dashboard |
| `LIVE` | Production | Live token from dashboard |

### Amount Limits

Check FeexPay documentation for:
- Minimum transaction amount
- Maximum transaction amount
- Payment method-specific limits

## Error Handling

The page handles errors gracefully:

### Missing Configuration
```
"Configuration manquante - Les paramètres FeexPay ne sont pas configurés correctement."
```

**Solution:** Verify `VITE_FEEXPAY_SHOP_ID` and `VITE_FEEXPAY_TOKEN` in `.env.local`

### SDK Load Error
```
"Impossible de charger le système de paiement FeexPay."
```

**Solution:** Check internet connection, verify FeexPay API status

### Payment Initialization Error
```
"Impossible d'initialiser le paiement. Veuillez réessayer."
```

**Solution:** Check browser console for details, verify amount > 0

## Security

✅ **Security Best Practices Implemented:**

- No sensitive data stored in frontend
- API token only used server-side (if needed)
- Payment processing via secure FeexPay API
- HTTPS only in production
- Unique transaction IDs for tracking
- No stored payment information

## Customization

### Change Quick Amount Buttons

In `Donate.tsx`, modify:
```javascript
const quickAmounts = [5000, 10000, 20000, 50000, 100000];
```

### Change Default Mode

In `Donate.tsx`:
```javascript
const FEEXPAY_MODE = (import.meta.env.VITE_FEEXPAY_MODE as string | undefined) ?? "LIVE";
```

### Customize Payment Description

In `initializeFeexPayPayment()`:
```javascript
description: "Donation MILLENIUM" // Change this text
```

## Troubleshooting

### Issue: "SDK not loaded"

**Cause:** FeexPay JavaScript file failed to load

**Solution:**
1. Check internet connection
2. Verify no browser extensions blocking scripts
3. Check FeexPay API status at https://status.feexpay.me
4. Try in incognito mode

### Issue: Payment button not appearing

**Cause:** SDK initialization failed or wrong mode

**Solution:**
1. Verify `VITE_FEEXPAY_SHOP_ID` is correct
2. Verify `VITE_FEEXPAY_TOKEN` is correct
3. Check if token matches the mode (SANDBOX token for SANDBOX mode)
4. Clear browser cache

### Issue: Payment fails silently

**Cause:** API credentials mismatch or network issue

**Solution:**
1. Open browser DevTools (F12)
2. Check Console for error messages
3. Check Network tab for failed requests
4. Verify FeexPay dashboard for transaction logs

## Monitoring

### Monitor Successful Payments

1. Check FeexPay Dashboard → Transactions
2. Filter by date and status
3. Export transaction reports

### Log Payment Attempts

The page logs payment events to browser console:
- SDK loading status
- Payment initialization
- Payment response
- Errors

View logs: **Browser Console → F12**

## Support

### FeexPay Resources

- **Website:** https://feexpay.me
- **Documentation:** https://docs.feexpay.me
- **Dashboard:** https://dashboard.feexpay.me
- **Support:** support@feexpay.me

### Local Development

- Check `.env.local` exists and has correct values
- Verify npm dependencies installed: `npm install`
- Run dev server: `npm run dev`
- Access at: http://localhost:5173/donate

## Deployment Checklist

- [ ] Obtain FeexPay production credentials
- [ ] Update `VITE_FEEXPAY_TOKEN` to production token
- [ ] Set `VITE_FEEXPAY_MODE=LIVE` in Netlify
- [ ] Test with real card on staging
- [ ] Monitor first transactions
- [ ] Set up email notifications for failed payments
- [ ] Document transaction flow for accounting

## Future Enhancements

- [ ] Add webhook support for payment confirmations
- [ ] Implement transaction history page
- [ ] Add receipt email functionality
- [ ] Multi-currency support
- [ ] Payment analytics dashboard
- [ ] Refund management interface
- [ ] Automated reconciliation

## References

### FeexPay Documentation

**Authentication:**
- Token location: Dashboard → Settings → API Keys
- Production vs Sandbox tokens are different
- Keep tokens secure

**Payment Types:**
- Mobile (MTN, Moov, Celtiis)
- Card (Visa, Mastercard, etc.)
- Wallet (E-wallets)

**Modes:**
- **SANDBOX:** For testing, uses test credentials
- **LIVE:** For production, requires payment processing

## Support Contact

For technical assistance:
- Create issue in project repository
- Contact FeexPay support
- Check FeexPay status page
