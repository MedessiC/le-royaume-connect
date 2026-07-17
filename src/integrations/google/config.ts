/**
 * Google OAuth Configuration
 * 
 * To configure Google OAuth:
 * 1. Go to Google Cloud Console: https://console.cloud.google.com
 * 2. Create a new project or select an existing one
 * 3. Enable the Google+ API
 * 4. Create OAuth 2.0 credentials (Web application)
 * 5. Add authorized JavaScript origins:
 *    - http://localhost:5173 (development - Vite default)
 *    - https://yourdomain.com (production)
 * 6. Add authorized redirect URIs to Google AND Supabase:
 *    - http://localhost:5173/auth/callback (development)
 *    - https://votre-projet.supabase.co/auth/v1/callback (Supabase endpoint)
 *    - https://yourdomain.com/auth/callback (production)
 * 7. Copy your Client ID and Secret
 * 8. Go to Supabase project settings > Authentication > Providers
 * 9. Enable Google and paste your Client ID and Secret
 * 10. Set the redirect URL to your domain in Supabase URL Configuration
 */

// Google OAuth configuration
export const googleOAuthConfig = {
  // Supabase handles the OAuth flow and redirects to this URL
  redirectTo: `${window.location.origin}/auth/callback`,
  scopes: ['profile', 'email'] // Requested scopes
};

export const googleAuthCallbackUrl = `${window.location.origin}/auth/callback`;
