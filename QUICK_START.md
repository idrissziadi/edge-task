# 🚀 Guide de Démarrage Rapide - Edge Task

## 📋 Prérequis

- Node.js (version 16 ou supérieure)
- npm ou yarn
- Compte Supabase

## ⚡ Installation Rapide

### Option 1 : Installation Automatique (Recommandée)

```bash
# Exécuter le script d'installation complet
./install-and-setup.sh
```

### Option 2 : Installation Manuelle

```bash
# 1. Installer les dépendances
npm install

# 2. Installer Supabase CLI
npm install -g supabase

# 3. Se connecter à Supabase
supabase login

# 4. Lier le projet
supabase link --project-ref ccpkpjuiqhlqxgfszjnb

# 5. Configurer la base de données
./fix-database.sh

# 6. Démarrer l'application
npm run dev
```

## 🎯 Vérification

1. **Ouvrir l'application** : `http://localhost:8080`
2. **Tester la base de données** : `http://localhost:8080/db-test`
3. **Tester l'authentification** : `http://localhost:8080/debug`

## 📊 Tables Créées

- ✅ **tasks** - Gestion des tâches
- ✅ **goals** - Gestion des objectifs
- ✅ **calendar_events** - Événements du calendrier
- ✅ **categories** - Catégories personnalisées
- ✅ **notifications** - Système de notifications
- ✅ **user_profiles** - Profils utilisateurs
- ✅ **user_settings** - Paramètres utilisateurs

## 🔧 Fonctionnalités Disponibles

### 📝 Gestion des Tâches
- Créer, modifier, supprimer des tâches
- Priorités (faible, moyenne, élevée)
- Dates d'échéance
- Tâches récurrentes
- Catégorisation

### 🎯 Gestion des Objectifs
- Définir des objectifs avec valeurs cibles
- Suivi du progrès
- Catégorisation par domaine
- Dates d'échéance

### 📅 Calendrier
- Événements avec dates de début/fin
- Événements sur toute la journée
- Couleurs personnalisées
- Localisation

### 🏷️ Catégories
- Catégories personnalisées
- Couleurs et icônes
- Organisation des contenus

### 🔔 Notifications
- Notifications en temps réel
- Types (info, succès, avertissement, erreur)
- Marquage comme lu/non lu

## 🐛 Dépannage

### Problème : Erreur 409 lors de la création de tâches
```bash
./fix-database.sh
```

### Problème : Tables manquantes
```bash
supabase db reset --linked
supabase db push
```

### Problème : Supabase CLI non installé
```bash
npm install -g supabase
# ou
curl -fsSL https://supabase.com/install.sh | sh
```

## 📱 Pages Disponibles

- `/` - Page d'accueil
- `/auth` - Authentification
- `/dashboard` - Tableau de bord
- `/tasks` - Gestion des tâches
- `/goals` - Gestion des objectifs
- `/calendar` - Calendrier
- `/analytics` - Analyses
- `/profile` - Profil utilisateur
- `/admin` - Administration
- `/debug` - Debug d'authentification
- `/db-test` - Test de base de données

## 🎨 Interface

- Design moderne avec shadcn/ui
- Thème sombre/clair
- Interface responsive
- Animations fluides
- Icônes Lucide React

## 🔒 Sécurité

- Authentification Supabase
- Row Level Security (RLS)
- Politiques de sécurité par utilisateur
- Protection des routes

---

**💡 Conseil** : Après l'installation, testez d'abord la page `/db-test` pour vérifier que toutes les tables fonctionnent correctement. 