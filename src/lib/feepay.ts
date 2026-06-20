/**
 * FeePay Integration Service
 * Handles payment requests for MTN, Moov, and Celtiis Mobile Money in Benin
 */

export type FeepayNetwork = 'mtn' | 'moov' | 'celtiis';

export interface FeepayRequestPayload {
  phoneNumber: string;
  amount: number;
  shop: string;
  firstName?: string;
  lastName?: string;
  description?: string;
  callbackInfo?: string;
}

export interface FeepayResponse {
  reference: string;
  message: string;
  status: 'PENDING' | 'FAILED' | 'SUCCESSFUL';
  amount: number;
  description?: string;
  callbackInfo?: string | null;
  phoneNumber: string;
  response_operator?: Record<string, any>;
  statusCode?: string;
}

const FEEPAY_ENDPOINTS: Record<FeepayNetwork, string> = {
  mtn: 'https://api-v2.feexpay.me/api/transactions/public/requesttopay/mtn',
  moov: 'https://api-v2.feexpay.me/api/transactions/public/requesttopay/moov',
  celtiis: 'https://api-v2.feexpay.me/api/transactions/public/requesttopay/celtiis_bj',
};

const PHONE_PREFIXES: Record<FeepayNetwork, number> = {
  mtn: 229,
  moov: 229,
  celtiis: 229,
};

/**
 * Format phone number to ensure it has the correct prefix
 */
export const formatPhoneNumber = (phone: string, network: FeepayNetwork): string => {
  // Remove all non-digit characters
  const cleaned = phone.replace(/\D/g, '');
  const prefix = PHONE_PREFIXES[network];

  // If it already starts with prefix, keep it
  if (cleaned.startsWith(prefix.toString())) {
    return cleaned;
  }

  // If it starts with 0, replace with prefix
  if (cleaned.startsWith('0')) {
    return prefix + cleaned.substring(1);
  }

  // Otherwise prepend prefix
  return prefix + cleaned;
};

/**
 * Validate phone number format for Benin operators
 */
export const validatePhoneNumber = (phone: string, network: FeepayNetwork): boolean => {
  const formatted = formatPhoneNumber(phone, network);
  // Should be 12 digits (prefix 229 + 9 digits)
  return formatted.length === 12 && /^\d+$/.test(formatted);
};

/**
 * Initiate a FeePay payment request via Netlify function
 */
export const initiateFeepayPayment = async (
  network: FeepayNetwork,
  payload: FeepayRequestPayload
): Promise<FeepayResponse | null> => {
  try {
    // Format phone number
    const formattedPhone = formatPhoneNumber(payload.phoneNumber, network);

    // Validate phone number
    if (!validatePhoneNumber(formattedPhone, network)) {
      console.error('Invalid phone number format');
      return null;
    }

    const response = await fetch('/.netlify/functions/feepay-request', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        network,
        phoneNumber: formattedPhone,
        amount: payload.amount,
        shop: payload.shop,
        firstName: payload.firstName,
        lastName: payload.lastName,
        description: payload.description,
        callbackInfo: payload.callbackInfo,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('FeePay request failed:', data);
      return null;
    }

    return data as FeepayResponse;
  } catch (error) {
    console.error('FeePay payment initiation error:', error);
    return null;
  }
};

/**
 * Check payment status via reference
 */
export const checkFeepayStatus = async (reference: string): Promise<FeepayResponse | null> => {
  try {
    const response = await fetch('/.netlify/functions/feepay-status', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reference }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Status check failed:', data);
      return null;
    }

    return data as FeepayResponse;
  } catch (error) {
    console.error('Status check error:', error);
    return null;
  }
};

/**
 * Get network display information
 */
export const getNetworkInfo = (network: FeepayNetwork) => {
  const info: Record<FeepayNetwork, { label: string; description: string; prefix: string }> = {
    mtn: {
      label: 'MTN Mobile Money',
      description: 'MTN Mobile Money Bénin - Numéro 10 chiffres avec préfixe 229',
      prefix: '229',
    },
    moov: {
      label: 'Moov Mobile Money',
      description: 'Moov Mobile Money Bénin - Numéro 10 chiffres avec préfixe 229',
      prefix: '229',
    },
    celtiis: {
      label: 'Celtiis',
      description: 'Celtiis Bénin - Numéro 10 chiffres avec préfixe 229',
      prefix: '229',
    },
  };

  return info[network];
};
