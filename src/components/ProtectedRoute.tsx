import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

interface ProtectedRouteProps {
  children: React.ReactNode;
  redirectTo?: string;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  redirectTo = "/auth" 
}) => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkUser = async () => {
      try {
        const { data: { user }, error } = await supabase.auth.getUser();
        console.log('ProtectedRoute - User check:', user?.email, error);
        setUser(user);
      } catch (error) {
        console.error('ProtectedRoute - Error checking user:', error);
      } finally {
        setLoading(false);
      }
    };

    checkUser();
    
    // Écouter les changements d'authentification
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log('ProtectedRoute - Auth state change:', event, session?.user?.email);
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  // Afficher un loader simple pendant la vérification
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // Pour le débogage, permettre l'accès même sans utilisateur
  const isDebugMode = window.location.pathname.includes('/debug') || window.location.pathname.includes('/test');
  
  // Rediriger si pas d'utilisateur (sauf en mode debug)
  if (!user && !isDebugMode) {
    console.log('ProtectedRoute - No user found, redirecting to:', redirectTo);
    return <Navigate to={redirectTo} replace />;
  }

  // Afficher le contenu si l'utilisateur est connecté ou en mode debug
  console.log('ProtectedRoute - User authenticated or debug mode, rendering children');
  return <>{children}</>;
}; 