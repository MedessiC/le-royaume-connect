# FeePay Integration Setup Guide

This guide covers the integration of FeePay payment system for mobile money donations in Benin through MTN, Moov, and Celtiis networks.

## Overview

FeePay Integration enables supporters to donate directly via their mobile money operators:
- **MTN Mobile Money Benin**
- **Moov Mobile Money Benin**  
- **Celtiis Benin**

## Prerequisites

1. FeePay account with API access
2. Netlify deployment environment
3. Environment variables properly configured

## Environment Variables

Create a `.env.local` file in the project root with the following FeePay configuration:

```bash
# FeePay Configuration
VITE_FEEPAY_SHOP_ID=your_shop_id_here
FEEPAY_API_KEY=your_api_key_here
```

### Environment Variable Descriptions

| Variable | Type | Required | Description | Example |
|----------|------|----------|-------------|---------|
| `VITE_FEEPAY_SHOP_ID` | String | Yes | Your FeePay shop identifier | `63e581fe4c35f54de9749c` |
| `FEEPAY_API_KEY` | String | Yes | FeePay API Bearer token (secret - don't expose) | `fp_M6tuzYgsYl39d6kJvdaLmYGQcEAWvLRivVhbeK4UCwbDiyMlj9UPMO` |

## Netlify Configuration

### Deploy Environment Variables

1. Go to **Netlify Dashboard** → Your Site → **Site Settings** → **Build & deploy**
2. Under **Environment**, click **Edit variables**
3. Add the following secrets:
   - Key: `FEEPAY_API_KEY` | Value: `your_api_key`
   - Key: `FEEPAY_SHOP_ID` | Value: `your_shop_id`

⚠️ **SECURITY**: Never commit `.env.local` or API keys to version control. Add to `.gitignore`:

```
.env.local
.env.*.local
```

## Implementation Files

### Created/Modified Files

1. **`src/lib/feepay.ts`** - FeePay integration utilities
   - Phone number formatting and validation
   - Payment initiation
   - Status checking
   - Network information helpers

2. **`src/components/FeepayDialog.tsx`** - FeePay payment dialog UI
   - Network selection (MTN, Moov, Celtiis)
   - Phone number input with validation
   - Optional name fields
   - Error handling
   - Loading states

3. **`netlify/functions/feepay-request.js`** - Backend payment initiation
   - Receives payment requests from frontend
   - Validates phone numbers
   - Communicates with FeePay API
   - Returns transaction reference or errors

4. **`netlify/functions/feepay-status.js`** - Transaction status checking
   - Queries transaction status by reference
   - Polls for payment confirmation

5. **`src/pages/Donate.tsx`** - Updated donation page
   - Integrated FeePay payment provider
   - FeePay dialog management
   - Provider selection flow

## API Integration Details

### Supported Networks & Phone Format

All networks use the Benin international prefix:

| Network | Prefix | Example | Full Number |
|---------|--------|---------|-------------|
| MTN | 229 | 01 23 45 67 89 | 2290123456789 |
| Moov | 229 | 01 63 00 00 00 | 2290163000000 |
| Celtiis | 229 | 01 40 00 00 00 | 2290140000000 |

### Request Flow

```
User
  ↓
  └─→ Donation Page
       ↓
       └─→ Selects Amount
            ↓
            └─→ Opens FeePay Dialog
                 ↓
                 └─→ Selects Network + Phone
                      ↓
                      └─→ Frontend FeepayDialog Component
                           ↓
                           └─→ POST to /.netlify/functions/feepay-request
                                ↓
                                └─→ Backend Validation
                                     ↓
                                     └─→ FeePay API Call
                                          ↓
                                          └─→ Mobile Money Notification
                                               ↓
                                               └─→ User Confirms on Phone
```

### FeePay API Endpoints

#### 1. MTN Mobile Money Request
```
POST https://api-v2.feexpay.me/api/transactions/public/requesttopay/mtn

Headers:
  Authorization: Bearer <API_KEY>
  Content-Type: application/json

Body:
{
  "shop": "63e581fe4c35f54de9749c",
  "amount": 100,
  "phoneNumber": 2290166000000,
  "first_name": "John",
  "last_name": "Doe",
  "description": "Donation MILLENIUM",
  "callback_info": "order_12345"
}

Response:
{
  "reference": "6a00a986-fcb9-4491-93d5-28693034ef95",
  "message": "Accepted",
  "status": "PENDING",
  "amount": 100,
  "description": "Donation MILLENIUM",
  "phoneNumber": "2290166000000"
}
```

#### 2. Moov Mobile Money Request
```
POST https://api-v2.feexpay.me/api/transactions/public/requesttopay/moov

// Same structure as MTN
// Note: Response may contain final status (e.g., FAILED if insufficient balance)
```

#### 3. Celtiis Request
```
POST https://api-v2.feexpay.me/api/transactions/public/requesttopay/celtiis_bj

// Same structure as MTN
// Note: Response may include SOAP payload from operator
```

#### 4. Check Transaction Status
```
GET https://api-v2.feexpay.me/api/transactions/public/get/<reference>

Headers:
  Authorization: Bearer <API_KEY>

Response:
{
  "reference": "6a00a986-fcb9-4491-93d5-28693034ef95",
  "status": "SUCCESSFUL",
  "amount": 100,
  "phoneNumber": "2290166000000"
}
```

## Response Statuses

| Status | Meaning | Action |
|--------|---------|--------|
| `PENDING` | Payment awaiting user confirmation on phone | Wait for user action |
| `SUCCESSFUL` | Payment completed | Confirm receipt, thank user |
| `FAILED` | Payment failed | Show error to user |

## Error Handling

The implementation includes error handling for:

- **Invalid phone numbers** - Validates Benin format (229 + 9 digits)
- **Missing amounts** - Requires amount selection before payment
- **API failures** - Graceful degradation with user messaging
- **Network errors** - Retry capability with error messages
- **Timeout** - Transaction reference provided for manual checking

## Testing

### Development Environment

Test with FeePay sandbox/test credentials:

1. Create test account on FeePay
2. Get sandbox API key from FeePay dashboard
3. Set environment variables with sandbox credentials
4. Use test phone numbers provided by FeePay

### Test Phone Numbers

FeePay typically provides test numbers for each network. Contact FeePay support for:
- MTN test numbers
- Moov test numbers  
- Celtiis test numbers

### Local Testing

```bash
# 1. Set test environment variables
export VITE_FEEPAY_SHOP_ID="test_shop_id"
export FEEPAY_API_KEY="test_api_key"

# 2. Run development server
npm run dev

# 3. Navigate to /donate page
# 4. Select an amount and click "FeePay Mobile Money"
# 5. Test each network with provided test numbers
```

## UI Components

### FeepayDialog Component

Located in `src/components/FeepayDialog.tsx`

Features:
- Network selection via tabs (MTN/Moov/Celtiis)
- Phone number input with validation
- Optional name fields (firstName, lastName)
- Amount display
- Error messaging
- Loading states
- Responsive design

Usage in Donate.tsx:
```tsx
<FeepayDialog
  open={feepayDialogOpen}
  onOpenChange={setFeepayDialogOpen}
  amount={amountValue}
  onPaymentSuccess={(reference) => {
    // Handle successful payment initiation
  }}
  onPaymentError={(error) => {
    // Handle payment errors
  }}
/>
```

## Security Best Practices

1. **Never expose API keys** in frontend code
2. **Use Netlify functions** for backend API calls
3. **Validate all inputs** on backend
4. **Sanitize phone numbers** before API requests
5. **Use HTTPS** for all communications
6. **Store references** securely for webhook callbacks
7. **Implement rate limiting** on payment endpoints

## Webhook Integration (Optional)

For production, implement webhooks to receive payment confirmation:

```javascript
// Example Netlify function for FeePay webhooks
exports.handler = async (event) => {
  const { reference, status, amount, phoneNumber } = JSON.parse(event.body);
  
  // Verify webhook signature if needed
  // Update database with transaction status
  // Send confirmation email to user
  
  return { statusCode: 200, body: JSON.stringify({ success: true }) };
};
```

## Troubleshooting

### Common Issues

**Issue**: "FeePay configuration missing" error
- **Solution**: Verify `FEEPAY_API_KEY` and `FEEPAY_SHOP_ID` are set in Netlify environment variables

**Issue**: "Invalid phone number" error  
- **Solution**: Ensure phone number is 10 digits for Benin (e.g., 0123456789 or 2290123456789)

**Issue**: Payment fails silently
- **Solution**: Check browser console for errors, verify API key is valid, check Netlify function logs

**Issue**: Transaction never completes
- **Solution**: User may not have received SMS prompt. Verify phone number is correct and operator balance is sufficient.

## Monitoring & Analytics

Track FeePay transactions:

1. Check Netlify function logs for payment attempts
2. Monitor FeePay dashboard for transaction status
3. Store transaction references for reconciliation
4. Log payment errors for debugging

## Support

For FeePay-specific issues:
- **Documentation**: https://docs.feexpay.me
- **Support Email**: support@feexpay.me
- **API Reference**: https://api-v2.feexpay.me/docs

## Next Steps

1. Obtain FeePay credentials (API key and Shop ID)
2. Configure environment variables in `.env.local` and Netlify
3. Deploy to Netlify: `npm run build && netlify deploy --prod`
4. Test payment flow with test credentials
5. Monitor transactions in production
6. Implement webhook endpoints for payment confirmations

## Future Enhancements

- [ ] Add webhook support for automatic payment confirmation
- [ ] Implement transaction history page
- [ ] Add SMS delivery tracking
- [ ] Implement retry logic for failed payments
- [ ] Add multi-currency support
- [ ] Integrate with donation receipts
- [ ] Add analytics for payment success rates
