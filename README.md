# Edge Task - Application de Gestion de Tâches

Une application moderne de gestion de tâches et d'objectifs construite avec React, TypeScript, Tailwind CSS et Supabase.

## 🚀 Fonctionnalités

### ✅ Authentification
- Connexion/Inscription avec Supabase Auth
- Protection des routes avec `ProtectedRoute`
- Gestion des sessions utilisateur
- Redirection automatique vers le dashboard après connexion

### 📊 Dashboard Dynamique
- Statistiques en temps réel des tâches et objectifs
- Affichage des tâches récentes
- Navigation rapide vers toutes les sections
- Interface responsive et moderne

### 📝 Gestion des Tâches
- Création, modification et suppression de tâches
- Priorités (Faible, Moyenne, Haute)
- Dates d'échéance
- Tâches récurrentes
- Filtrage et tri avancés
- Actions en lot (compléter/supprimer plusieurs tâches)

### 🎯 Gestion des Objectifs
- Création d'objectifs avec progression
- Catégorisation des objectifs
- Suivi de la progression
- Dates d'échéance
- Statistiques de performance

### 📅 Calendrier
- Vue calendrier des tâches et événements
- Création d'événements
- Rappels et notifications
- Intégration avec les tâches

### 📈 Analytics
- Graphiques de performance
- Statistiques détaillées
- Tendances de productivité
- Rapports personnalisés

### 👤 Profil Utilisateur
- Gestion du profil utilisateur
- Préférences personnalisées
- Statistiques personnelles
- Historique des activités

### 🔧 Administration
- Gestion des utilisateurs (admin)
- Statistiques système
- Monitoring des performances
- Gestion des rôles

## 🛠️ Technologies Utilisées

- **Frontend**: React 18, TypeScript, Vite
- **UI**: Tailwind CSS, shadcn/ui, Lucide React
- **Backend**: Supabase (Auth, Database, Functions)
- **Routing**: React Router DOM
- **State Management**: React Query (TanStack Query)
- **Notifications**: React Hot Toast, Sonner

## 📦 Installation

### Option 1 : Installation Automatique (Recommandée)
```bash
# Exécuter le script d'installation complet
./install-and-setup.sh
```

### Option 2 : Installation Manuelle
1. **Cloner le projet**
```bash
git clone <repository-url>
cd edge-task
```

2. **Installer les dépendances**
```bash
npm install
```

3. **Configurer Supabase**
```bash
# Installer Supabase CLI
npm install -g supabase

# Se connecter à Supabase
supabase login

# Lier le projet
supabase link --project-ref ccpkpjuiqhlqxgfszjnb

# Configurer la base de données
./fix-database.sh
```

4. **Démarrer le serveur de développement**
```bash
npm run dev
```

## 🗄️ Structure de la Base de Données

### Tables Principales

#### `tasks`
- `id` (UUID, Primary Key)
- `title` (TEXT, NOT NULL)
- `description` (TEXT)
- `priority` (TEXT: 'low', 'medium', 'high')
- `deadline` (TIMESTAMP)
- `is_completed` (BOOLEAN)
- `is_recurring` (BOOLEAN)
- `recurrence_rule` (TEXT)
- `user_id` (UUID, Foreign Key)

#### `goals`
- `id` (UUID, Primary Key)
- `title` (TEXT, NOT NULL)
- `description` (TEXT)
- `category` (TEXT, NOT NULL)
- `target_value` (NUMERIC, NOT NULL)
- `current_value` (NUMERIC)
- `unit` (TEXT, NOT NULL)
- `deadline` (TIMESTAMP)
- `is_completed` (BOOLEAN)
- `priority` (TEXT: 'low', 'medium', 'high')
- `user_id` (UUID, Foreign Key)

#### `calendar_events`
- `id` (UUID, Primary Key)
- `title` (TEXT, NOT NULL)
- `description` (TEXT)
- `start_time` (TIMESTAMP, NOT NULL)
- `end_time` (TIMESTAMP, NOT NULL)
- `all_day` (BOOLEAN)
- `location` (TEXT)
- `color` (TEXT)
- `category_id` (UUID, Foreign Key)
- `user_id` (UUID, Foreign Key)

#### `categories`
- `id` (UUID, Primary Key)
- `name` (TEXT, NOT NULL)
- `color` (TEXT)
- `icon` (TEXT)
- `user_id` (UUID, Foreign Key)

#### `notifications`
- `id` (UUID, Primary Key)
- `user_id` (UUID, Foreign Key)
- `title` (TEXT, NOT NULL)
- `message` (TEXT)
- `type` (TEXT: 'info', 'success', 'warning', 'error')
- `is_read` (BOOLEAN)
- `related_type` (TEXT)
- `related_id` (UUID)

#### `user_profiles`
- `id` (UUID, Primary Key)
- `auth_user_id` (UUID, Foreign Key)
- `name` (TEXT)
- `avatar_url` (TEXT)
- `role` (TEXT, DEFAULT 'user')

#### `user_settings`
- `id` (UUID, Primary Key)
- `user_id` (UUID, Foreign Key)
- `theme` (TEXT, DEFAULT 'light')
- `language` (TEXT, DEFAULT 'en')
- `email_notifications` (BOOLEAN, DEFAULT TRUE)
- `push_notifications` (BOOLEAN, DEFAULT TRUE)

## 🔐 Sécurité

- **Row Level Security (RLS)** activé sur toutes les tables
- **Politiques de sécurité** pour isoler les données par utilisateur
- **Authentification** gérée par Supabase Auth
- **Protection des routes** avec composant `ProtectedRoute`

## 🎨 Interface Utilisateur

### Navigation
- **Header responsive** avec menu de navigation
- **Navigation par icônes** pour un accès rapide
- **Indicateurs visuels** pour les pages actives
- **Menu mobile** pour les petits écrans

### Composants UI
- **Design system** cohérent avec shadcn/ui
- **Thème sombre/clair** supporté
- **Animations fluides** et transitions
- **Accessibilité** optimisée

## 📱 Fonctionnalités Avancées

### Services Dynamiques
- **taskService**: Gestion complète des tâches
- **goalService**: Gestion des objectifs
- **categoryService**: Gestion des catégories
- **calendarService**: Gestion des événements du calendrier
- **notificationService**: Système de notifications
- **Données en temps réel** avec Supabase
- **Gestion d'erreurs** robuste

### Fonctionnalités Interactives
- **Drag & Drop** pour réorganiser les tâches
- **Recherche en temps réel**
- **Filtres avancés** par statut, priorité, date
- **Actions en lot** pour gérer plusieurs éléments

## 🚀 Déploiement

### Prérequis
- Compte Supabase
- Variables d'environnement configurées
- Base de données migrée

### Étapes
1. Configurer les variables d'environnement
2. Exécuter les migrations de base de données
3. Déployer les fonctions Supabase
4. Build et déployer l'application

## 🤝 Contribution

1. Fork le projet
2. Créer une branche feature (`git checkout -b feature/AmazingFeature`)
3. Commit les changements (`git commit -m 'Add some AmazingFeature'`)
4. Push vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrir une Pull Request

## 📄 Licence

Ce projet est sous licence MIT. Voir le fichier `LICENSE` pour plus de détails.

## 🆘 Support

Pour toute question ou problème :
- Ouvrir une issue sur GitHub
- Consulter la documentation Supabase
- Vérifier les logs de développement

---

**Développé avec ❤️ en utilisant React, TypeScript et Supabase**
