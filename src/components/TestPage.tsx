import React from 'react';

export const TestPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Test Page</h1>
        <div className="bg-card p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Protected Route Test</h2>
          <p className="text-muted-foreground mb-4">
            Si vous voyez cette page, cela signifie que :
          </p>
          <ul className="list-disc list-inside space-y-2 text-muted-foreground">
            <li>Vous êtes authentifié</li>
            <li>Le composant ProtectedRoute fonctionne</li>
            <li>Le problème vient des pages individuelles</li>
          </ul>
          <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded">
            <p className="text-green-800 font-medium">✅ Test réussi !</p>
          </div>
        </div>
      </div>
    </div>
  );
}; 