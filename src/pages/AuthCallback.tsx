import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

const AuthCallback = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const { data, error } = await supabase.auth.getSessionFromUrl({ storeSession: true });
        if (error) {
          console.error('Supabase OAuth callback error:', error);
          navigate('/auth', { replace: true });
          return;
        }

        if (!data?.session) {
          navigate('/auth', { replace: true });
          return;
        }

        navigate('/feed', { replace: true });
      } catch (err) {
        console.error('OAuth callback exception:', err);
        navigate('/auth', { replace: true });
      }
    };

    handleCallback();
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gradient-hero flex items-center justify-center">
      <div className="text-center">
        <div className="inline-flex items-center justify-center h-12 w-12 rounded-md bg-gold/20 mb-4">
          <div className="h-6 w-6 bg-gold rounded-full animate-pulse"></div>
        </div>
        <p className="text-foreground font-body">Authentification en cours...</p>
      </div>
    </div>
  );
};

export default AuthCallback;
