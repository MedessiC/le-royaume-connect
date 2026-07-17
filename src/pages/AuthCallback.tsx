import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

const AuthCallback = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Attendre que Supabase traite la session depuis l'URL
        // Supabase gère automatiquement le callback OAuth et crée une session
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Vérifier si une session a été créée
        const { data: { session }, error } = await supabase.auth.getSession();

        if (error) {
          console.error('Supabase OAuth session error:', error);
          navigate('/auth', { replace: true });
          return;
        }

        if (!session) {
          console.warn('No session found after OAuth callback');
          navigate('/auth', { replace: true });
          return;
        }

        console.log('OAuth authentication successful, redirecting to /feed');
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
