#!/bin/bash

echo "🔧 Réparation de la base de données..."

# Vérifier si supabase CLI est installé
if ! command -v supabase &> /dev/null; then
    echo "❌ Supabase CLI n'est pas installé."
    exit 1
fi

echo "🔄 Réinitialisation de la base de données..."
supabase db reset --linked

echo "📊 Application des nouvelles migrations..."
supabase db push

echo "✅ Base de données réparée!"
echo "🎉 Vous pouvez maintenant créer des tâches et des objectifs." 