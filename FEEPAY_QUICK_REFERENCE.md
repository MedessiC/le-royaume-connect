# FeePay Integration - Quick Reference

## What's Been Implemented

### 1. Core FeePay Service (`src/lib/feepay.ts`)
Utility functions for FeePay integration:
- `initiateFeepayPayment()` - Send payment request to operator
- `checkFeepayStatus()` - Check transaction status by reference
- `formatPhoneNumber()` - Format and normalize phone numbers
- `validatePhoneNumber()` - Validate Benin phone format
- `getNetworkInfo()` - Get network display information

### 2. FeePay Dialog Component (`src/components/FeepayDialog.tsx`)
Interactive UI component with:
- Network selection tabs (MTN / Moov / Celtiis)
- Phone number input with validation
- Optional name fields
- Amount display
- Error handling and messaging
- Loading states
- Responsive design

### 3. Netlify Functions
#### `netlify/functions/feepay-request.js`
- Handles payment initialization requests
- Validates phone numbers and amounts
- Communicates with FeePay API
- Returns transaction reference or error

#### `netlify/functions/feepay-status.js`
- Queries transaction status by reference
- Supports payment confirmation checks

### 4. Updated Donation Page (`src/pages/Donate.tsx`)
- Added FeePay payment provider option
- Integrated FeepayDialog component
- Payment flow management
- Success/error handling

## Environment Setup

### Local Development

Create `.env.local`:
```bash
VITE_FEEPAY_SHOP_ID=your_shop_id
FEEPAY_API_KEY=your_api_key
```

### Netlify Deployment

Set environment variables in Netlify Dashboard:
1. Site Settings → Build & deploy → Environment
2. Add secrets:
   - `FEEPAY_API_KEY`
   - `FEEPAY_SHOP_ID` (optional - can also use VITE_ version)

## Usage Flow

```
User visits /donate
    ↓
Selects amount (5000, 10000, etc.)
    ↓
Clicks "Ouvrir le paiement en ligne"
    ↓
Selects "FeePay Mobile Money" provider
    ↓
FeepayDialog opens
    ↓
Selects network (MTN/Moov/Celtiis)
    ↓
Enters phone number (validates format)
    ↓
Optionally adds name
    ↓
Clicks "Confirmer le paiement"
    ↓
Backend calls FeePay API
    ↓
User receives SMS prompt
    ↓
User confirms on phone
    ↓
Transaction completes
```

## Payment Networks

### MTN Mobile Money Benin
- **Prefix**: 229
- **Format**: 10 digits (e.g., 0123456789 or 2290123456789)
- **API**: `/api/transactions/public/requesttopay/mtn`

### Moov Mobile Money Benin
- **Prefix**: 229
- **Format**: 10 digits
- **API**: `/api/transactions/public/requesttopay/moov`
- **Note**: May return final status immediately if balance insufficient

### Celtiis Benin
- **Prefix**: 229
- **Format**: 10 digits
- **API**: `/api/transactions/public/requesttopay/celtiis_bj`
- **Note**: May include SOAP response from operator

## API Request Format

```bash
POST https://api-v2.feexpay.me/api/transactions/public/requesttopay/mtn

Headers:
  Authorization: Bearer YOUR_API_KEY
  Content-Type: application/json

Body:
{
  "shop": "your_shop_id",
  "amount": 5000,
  "phoneNumber": 2290123456789,
  "first_name": "John",
  "last_name": "Doe",
  "description": "Donation MILLENIUM",
  "callback_info": "order_123"
}
```

## Response Statuses

| Status | Meaning |
|--------|---------|
| `PENDING` | Awaiting user confirmation on phone |
| `SUCCESSFUL` | Payment completed successfully |
| `FAILED` | Payment failed (insufficient balance, etc.) |

## Error Handling Examples

### Invalid Phone Number
```
Error: "Numéro de téléphone invalide. Doit être un numéro 10 chiffres avec préfixe 229"
```

### Missing Amount
```
Error: "Sélectionnez ou saisissez un montant avant de payer avec FeePay."
```

### API Configuration Missing
```
Error: "FeePay configuration missing. Set FEEPAY_API_KEY and FEEPAY_SHOP_ID environment variables."
```

## Phone Number Examples

| Format | Valid | Reason |
|--------|-------|--------|
| `0123456789` | ✓ | Benin local format |
| `2290123456789` | ✓ | International format |
| `01 23 45 67 89` | ✓ | With spaces (auto-cleaned) |
| `+229 01 23 45 67 89` | ✓ | With country code (auto-cleaned) |
| `123456789` | ✗ | Too short |
| `012345678901` | ✗ | Too long |
| `abcdefghij` | ✗ | Non-numeric |

## Testing Locally

### 1. Set Test Credentials
```bash
# .env.local
VITE_FEEPAY_SHOP_ID=test_shop_123
FEEPAY_API_KEY=test_key_xyz
```

### 2. Run Development Server
```bash
npm run dev
```

### 3. Navigate to Donation Page
Open http://localhost:5173/donate

### 4. Test Payment Flow
- Select amount
- Choose FeePay
- Try each network
- Use test phone numbers (from FeePay documentation)

### 5. Check Netlify Function Logs
```bash
netlify logs
```

## File Structure

```
le-royaume-connect-main/
├── src/
│   ├── lib/
│   │   └── feepay.ts                    # FeePay utilities
│   ├── components/
│   │   └── FeepayDialog.tsx             # Payment dialog UI
│   └── pages/
│       └── Donate.tsx                   # Updated donation page
├── netlify/
│   └── functions/
│       ├── feepay-request.js            # Payment initiation
│       └── feepay-status.js             # Status checking
├── .env.example                         # Updated with FeePay config
├── FEEPAY_INTEGRATION.md               # Detailed integration guide
└── FEEPAY_QUICK_REFERENCE.md          # This file
```

## Deployment Checklist

- [ ] Obtain FeePay API credentials
- [ ] Set environment variables in Netlify
- [ ] Test payment flow in staging
- [ ] Verify phone number validation
- [ ] Monitor transaction logs
- [ ] Set up webhook handlers (optional)
- [ ] Deploy to production
- [ ] Test with real phone numbers
- [ ] Monitor error rates

## Common Issues & Solutions

**Q: "FeePay configuration missing" error**
A: Check that FEEPAY_API_KEY and FEEPAY_SHOP_ID are set in Netlify environment variables

**Q: Phone number validation failing**
A: Ensure phone is formatted as 10 digits (e.g., 0166000000) or 12 digits with prefix (2290166000000)

**Q: Payment requests timing out**
A: Check Netlify function logs, verify network connectivity, check FeePay API status

**Q: Users not receiving SMS**
A: Verify phone number is correct, check operator balance, confirm SMS delivery with FeePay support

**Q: Transaction reference provided but no payment received**
A: User may not have confirmed SMS prompt, check status via `feepay-status` function

## Security Notes

- API keys should NEVER be exposed in frontend code
- All validation happens on backend via Netlify functions
- Phone numbers are sanitized before API requests
- Use HTTPS for all communications
- Implement rate limiting for payment endpoints
- Store transaction references for audit trails

## Support Resources

- **FeePay Documentation**: https://docs.feexpay.me
- **FeePay API Reference**: https://api-v2.feexpay.me/docs
- **Netlify Functions Docs**: https://docs.netlify.com/functions/overview
- **Project Docs**: See FEEPAY_INTEGRATION.md for detailed information

## Next Steps

1. Get FeePay API credentials
2. Test in staging environment
3. Configure Netlify environment variables
4. Deploy and monitor in production
5. Gather user feedback on payment flow
