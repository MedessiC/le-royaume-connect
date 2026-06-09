import { supabase } from '@/integrations/supabase/client';
import { googleOAuthConfig } from './config';

export interface GoogleAuthResult {
  success: boolean;
  error?: string;
  user?: any;
}

/**
 * Sign in with Google using Supabase OAuth
 */
export const signInWithGoogle = async (): Promise<GoogleAuthResult> => {
  try {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: googleOAuthConfig.redirectTo,
        // Scopes are configured in Supabase provider settings
      },
    });

    if (error) {
      console.error('Google OAuth error:', error);
      return {
        success: false,
        error: error.message || 'Failed to sign in with Google',
      };
    }

    return {
      success: true,
      user: data.user,
    };
  } catch (err: any) {
    console.error('Google sign-in error:', err);
    return {
      success: false,
      error: err.message || 'An unexpected error occurred',
    };
  }
};

/**
 * Sign out from Google
 */
export const signOutFromGoogle = async (): Promise<GoogleAuthResult> => {
  try {
    const { error } = await supabase.auth.signOut();

    if (error) {
      return {
        success: false,
        error: error.message || 'Failed to sign out',
      };
    }

    return {
      success: true,
    };
  } catch (err: any) {
    console.error('Sign-out error:', err);
    return {
      success: false,
      error: err.message || 'An unexpected error occurred',
    };
  }
};

/**
 * Handle OAuth callback
 * This is typically called after returning from Google's authorization page
 */
export const handleOAuthCallback = async (): Promise<GoogleAuthResult> => {
  try {
    const { data, error } = await supabase.auth.getSession();

    if (error) {
      return {
        success: false,
        error: error.message || 'Failed to get session',
      };
    }

    if (!data.session) {
      return {
        success: false,
        error: 'No session found',
      };
    }

    return {
      success: true,
      user: data.session.user,
    };
  } catch (err: any) {
    console.error('OAuth callback error:', err);
    return {
      success: false,
      error: err.message || 'An unexpected error occurred',
    };
  }
};
