import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const AuthTest: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const testSignUp = async () => {
    setLoading(true);
    try {
      console.log('Tentative d\'inscription avec:', { email, password });
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
        }
      });

      if (error) {
        console.error('Erreur d\'inscription:', error);
        toast({
          title: "Erreur d'inscription",
          description: error.message,
          variant: "destructive"
        });
      } else {
        console.log('Inscription réussie:', data);
        toast({
          title: "Inscription réussie",
          description: "Un email de confirmation vous a été envoyé",
          variant: "default"
        });
      }
    } catch (error) {
      console.error('Erreur inattendue:', error);
      toast({
        title: "Erreur inattendue",
        description: String(error),
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const testSignIn = async () => {
    setLoading(true);
    try {
      console.log('Tentative de connexion avec:', { email });
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error('Erreur de connexion:', error);
        toast({
          title: "Erreur de connexion",
          description: error.message,
          variant: "destructive"
        });
      } else {
        console.log('Connexion réussie:', data);
        toast({
          title: "Connexion réussie",
          description: "Vous êtes maintenant connecté",
          variant: "default"
        });
      }
    } catch (error) {
      console.error('Erreur inattendue:', error);
      toast({
        title: "Erreur inattendue",
        description: String(error),
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Test d'Authentification</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div>
          <Input
            type="password"
            placeholder="Mot de passe"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <Button 
            onClick={testSignUp} 
            disabled={loading || !email || !password}
            variant="outline"
          >
            {loading ? 'Inscription...' : 'S\'inscrire'}
          </Button>
          <Button 
            onClick={testSignIn} 
            disabled={loading || !email || !password}
          >
            {loading ? 'Connexion...' : 'Se connecter'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};