import { AuthTest } from '@/components/AuthTest';
import { Header } from '@/components/layout/Header';

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header showNavigation={false} />
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4">TaskMaster - Test d'Authentification</h1>
          <p className="text-xl text-muted-foreground mb-8">Testez l'inscription pour vérifier que l'erreur est corrigée</p>
        </div>
        <AuthTest />
      </div>
    </div>
  );
};

export default Index;
