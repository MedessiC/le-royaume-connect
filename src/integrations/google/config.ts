/**
 * Google OAuth Configuration
 * 
 * To configure Google OAuth:
 * 1. Go to Google Cloud Console: https://console.cloud.google.com
 * 2. Create a new project or select an existing one
 * 3. Enable the Google+ API
 * 4. Create OAuth 2.0 credentials (Web application)
 * 5. Add authorized JavaScript origins:
 *    - http://localhost:8080 (development)
 *    - https://yourdomain.com (production)
 * 6. Add authorized redirect URIs:
 *    - http://localhost:8080/oauth/consent (development)
 *    - https://yourdomain.com/oauth/consent (production)
 * 7. Copy your Client ID and Secret
 * 8. Go to Supabase project settings > Authentication > Providers
 * 9. Enable Google and paste your Client ID and Secret
 * 10. Set the redirect URL to your domain
 */

// Google OAuth configuration
export const googleOAuthConfig = {
  // These are configured in Supabase, not here
  // Just define the redirect behavior
  redirectTo: `${window.location.origin}/oauth/consent`,
  scopes: ['profile', 'email'] // Requested scopes
};

export const googleAuthCallbackUrl = `${window.location.origin}/oauth/consent`;
