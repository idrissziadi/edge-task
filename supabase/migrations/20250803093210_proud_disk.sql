/*
  # Correction des politiques RLS pour toutes les tables

  1. Problème identifié
    - Les politiques RLS utilisent auth.uid() mais les tables référencent user_id
    - Erreur 403 lors des opérations CRUD sur goals, tasks, calendar_events, etc.

  2. Solution
    - Supprimer toutes les anciennes politiques
    - Recréer des politiques RLS correctes pour chaque table
    - S'assurer que user_id correspond à auth.uid()

  3. Tables concernées
    - tasks, goals, calendar_events, categories, notifications, user_settings
    - user_profiles (utilise auth_user_id au lieu de user_id)
*/

-- Supprimer toutes les anciennes politiques RLS
DROP POLICY IF EXISTS "Users can view their own tasks" ON tasks;
DROP POLICY IF EXISTS "Users can insert their own tasks" ON tasks;
DROP POLICY IF EXISTS "Users can update their own tasks" ON tasks;
DROP POLICY IF EXISTS "Users can delete their own tasks" ON tasks;

DROP POLICY IF EXISTS "Users can view their own goals" ON goals;
DROP POLICY IF EXISTS "Users can insert their own goals" ON goals;
DROP POLICY IF EXISTS "Users can update their own goals" ON goals;
DROP POLICY IF EXISTS "Users can delete their own goals" ON goals;

DROP POLICY IF EXISTS "Users can view their own events" ON calendar_events;
DROP POLICY IF EXISTS "Users can insert their own events" ON calendar_events;
DROP POLICY IF EXISTS "Users can update their own events" ON calendar_events;
DROP POLICY IF EXISTS "Users can delete their own events" ON calendar_events;

DROP POLICY IF EXISTS "Users can view their own categories" ON categories;
DROP POLICY IF EXISTS "Users can insert their own categories" ON categories;
DROP POLICY IF EXISTS "Users can update their own categories" ON categories;
DROP POLICY IF EXISTS "Users can delete their own categories" ON categories;

DROP POLICY IF EXISTS "Users can view their own notifications" ON notifications;
DROP POLICY IF EXISTS "Users can insert their own notifications" ON notifications;
DROP POLICY IF EXISTS "Users can update their own notifications" ON notifications;
DROP POLICY IF EXISTS "Users can delete their own notifications" ON notifications;

DROP POLICY IF EXISTS "Users can view their own settings" ON user_settings;
DROP POLICY IF EXISTS "Users can insert their own settings" ON user_settings;
DROP POLICY IF EXISTS "Users can update their own settings" ON user_settings;

DROP POLICY IF EXISTS "Users can view their own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON user_profiles;

-- Créer les nouvelles politiques RLS pour la table TASKS
CREATE POLICY "Enable read access for users on their own tasks" ON tasks
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Enable insert access for users on their own tasks" ON tasks
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Enable update access for users on their own tasks" ON tasks
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Enable delete access for users on their own tasks" ON tasks
  FOR DELETE USING (auth.uid() = user_id);

-- Créer les nouvelles politiques RLS pour la table GOALS
CREATE POLICY "Enable read access for users on their own goals" ON goals
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Enable insert access for users on their own goals" ON goals
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Enable update access for users on their own goals" ON goals
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Enable delete access for users on their own goals" ON goals
  FOR DELETE USING (auth.uid() = user_id);

-- Créer les nouvelles politiques RLS pour la table CALENDAR_EVENTS
CREATE POLICY "Enable read access for users on their own events" ON calendar_events
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Enable insert access for users on their own events" ON calendar_events
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Enable update access for users on their own events" ON calendar_events
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Enable delete access for users on their own events" ON calendar_events
  FOR DELETE USING (auth.uid() = user_id);

-- Créer les nouvelles politiques RLS pour la table CATEGORIES
CREATE POLICY "Enable read access for users on their own categories" ON categories
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Enable insert access for users on their own categories" ON categories
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Enable update access for users on their own categories" ON categories
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Enable delete access for users on their own categories" ON categories
  FOR DELETE USING (auth.uid() = user_id);

-- Créer les nouvelles politiques RLS pour la table NOTIFICATIONS
CREATE POLICY "Enable read access for users on their own notifications" ON notifications
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Enable insert access for users on their own notifications" ON notifications
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Enable update access for users on their own notifications" ON notifications
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Enable delete access for users on their own notifications" ON notifications
  FOR DELETE USING (auth.uid() = user_id);

-- Créer les nouvelles politiques RLS pour la table USER_SETTINGS
CREATE POLICY "Enable read access for users on their own settings" ON user_settings
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Enable insert access for users on their own settings" ON user_settings
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Enable update access for users on their own settings" ON user_settings
  FOR UPDATE USING (auth.uid() = user_id);

-- Créer les nouvelles politiques RLS pour la table USER_PROFILES (utilise auth_user_id)
CREATE POLICY "Enable read access for users on their own profile" ON user_profiles
  FOR SELECT USING (auth.uid() = auth_user_id);

CREATE POLICY "Enable insert access for users on their own profile" ON user_profiles
  FOR INSERT WITH CHECK (auth.uid() = auth_user_id);

CREATE POLICY "Enable update access for users on their own profile" ON user_profiles
  FOR UPDATE USING (auth.uid() = auth_user_id);

-- Créer les nouvelles politiques RLS pour la table TASK_CATEGORIES
CREATE POLICY "Enable read access for users on their own task categories" ON task_categories
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM tasks 
      WHERE tasks.id = task_categories.task_id 
      AND tasks.user_id = auth.uid()
    )
  );

CREATE POLICY "Enable insert access for users on their own task categories" ON task_categories
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM tasks 
      WHERE tasks.id = task_categories.task_id 
      AND tasks.user_id = auth.uid()
    )
  );

CREATE POLICY "Enable delete access for users on their own task categories" ON task_categories
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM tasks 
      WHERE tasks.id = task_categories.task_id 
      AND tasks.user_id = auth.uid()
    )
  );

-- Vérifier que RLS est activé sur toutes les tables
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE calendar_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_categories ENABLE ROW LEVEL SECURITY;

-- Créer des catégories par défaut pour les utilisateurs existants
INSERT INTO categories (name, color, icon, user_id)
SELECT 
  'Work' as name,
  '#EF4444' as color,
  'briefcase' as icon,
  id as user_id
FROM auth.users
WHERE NOT EXISTS (
  SELECT 1 FROM categories 
  WHERE categories.user_id = auth.users.id 
  AND categories.name = 'Work'
);

INSERT INTO categories (name, color, icon, user_id)
SELECT 
  'Personal' as name,
  '#10B981' as color,
  'user' as icon,
  id as user_id
FROM auth.users
WHERE NOT EXISTS (
  SELECT 1 FROM categories 
  WHERE categories.user_id = auth.users.id 
  AND categories.name = 'Personal'
);

INSERT INTO categories (name, color, icon, user_id)
SELECT 
  'Health' as name,
  '#F59E0B' as color,
  'heart' as icon,
  id as user_id
FROM auth.users
WHERE NOT EXISTS (
  SELECT 1 FROM categories 
  WHERE categories.user_id = auth.users.id 
  AND categories.name = 'Health'
);

INSERT INTO categories (name, color, icon, user_id)
SELECT 
  'Learning' as name,
  '#8B5CF6' as color,
  'book' as icon,
  id as user_id
FROM auth.users
WHERE NOT EXISTS (
  SELECT 1 FROM categories 
  WHERE categories.user_id = auth.users.id 
  AND categories.name = 'Learning'
);

-- Créer des paramètres par défaut pour les utilisateurs existants
INSERT INTO user_settings (user_id, theme, language, email_notifications, push_notifications)
SELECT 
  id as user_id,
  'light' as theme,
  'en' as language,
  true as email_notifications,
  true as push_notifications
FROM auth.users
WHERE NOT EXISTS (
  SELECT 1 FROM user_settings 
  WHERE user_settings.user_id = auth.users.id
);