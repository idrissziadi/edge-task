#!/bin/bash

# Script pour configurer la base de données Supabase

echo "🚀 Configuration de la base de données Supabase..."

# Vérifier si supabase CLI est installé
if ! command -v supabase &> /dev/null; then
    echo "❌ Supabase CLI n'est pas installé. Veuillez l'installer d'abord."
    echo "📖 Instructions: https://supabase.com/docs/guides/cli"
    exit 1
fi

# Vérifier si le projet est initialisé
if [ ! -f "supabase/config.toml" ]; then
    echo "❌ Projet Supabase non initialisé. Initialisation..."
    supabase init
fi

# Lier le projet (si pas déjà fait)
echo "🔗 Liaison du projet Supabase..."
supabase link --project-ref ccpkpjuiqhlqxgfszjnb

# Appliquer les migrations
echo "📊 Application des migrations..."
supabase db push

# Exécuter la migration de correction des clés étrangères
echo "🔧 Correction des contraintes de clé étrangère..."
supabase db reset --linked

echo "✅ Configuration terminée!"
echo "🎉 Votre base de données est maintenant prête avec les tables:"
echo "   - tasks"
echo "   - goals" 
echo "   - user_profiles"
echo ""
echo "🔐 Les politiques RLS sont configurées pour la sécurité"
echo "👤 Les nouveaux utilisateurs auront automatiquement un profil créé" 