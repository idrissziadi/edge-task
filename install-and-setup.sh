#!/bin/bash

echo "🚀 Installation et configuration d'Edge Task..."

# Vérifier si Node.js est installé
if ! command -v node &> /dev/null; then
    echo "❌ Node.js n'est pas installé. Veuillez installer Node.js d'abord."
    exit 1
fi

echo "✅ Node.js est installé"

# Vérifier si npm est installé
if ! command -v npm &> /dev/null; then
    echo "❌ npm n'est pas installé."
    exit 1
fi

echo "✅ npm est installé"

# Installer les dépendances
echo "📦 Installation des dépendances..."
npm install

# Vérifier si Supabase CLI est installé
if ! command -v supabase &> /dev/null; then
    echo "📥 Installation de Supabase CLI..."
    
    # Essayer d'installer avec npm
    if npm install -g supabase; then
        echo "✅ Supabase CLI installé avec npm"
    else
        echo "⚠️ Échec de l'installation avec npm, essai avec curl..."
        
        # Installation avec curl (Linux/macOS)
        if curl -fsSL https://supabase.com/install.sh | sh; then
            echo "✅ Supabase CLI installé avec curl"
        else
            echo "❌ Impossible d'installer Supabase CLI automatiquement."
            echo "📋 Veuillez l'installer manuellement :"
            echo "   https://supabase.com/docs/guides/cli/getting-started"
            exit 1
        fi
    fi
else
    echo "✅ Supabase CLI est déjà installé"
fi

# Se connecter à Supabase
echo "🔐 Connexion à Supabase..."
if ! supabase login; then
    echo "❌ Échec de la connexion à Supabase"
    echo "📋 Veuillez vous connecter manuellement :"
    echo "   supabase login"
    exit 1
fi

# Lier le projet
echo "🔗 Liaison du projet Supabase..."
if ! supabase link --project-ref ccpkpjuiqhlqxgfszjnb; then
    echo "❌ Échec de la liaison du projet"
    echo "📋 Veuillez lier manuellement :"
    echo "   supabase link --project-ref ccpkpjuiqhlqxgfszjnb"
    exit 1
fi

# Réinitialiser la base de données
echo "🔄 Réinitialisation de la base de données..."
if ! supabase db reset --linked; then
    echo "❌ Échec de la réinitialisation de la base de données"
    exit 1
fi

# Appliquer les migrations
echo "📊 Application des migrations..."
if ! supabase db push; then
    echo "❌ Échec de l'application des migrations"
    exit 1
fi

echo "✅ Installation et configuration terminées!"
echo "🎉 Vous pouvez maintenant démarrer l'application :"
echo "   npm run dev" 