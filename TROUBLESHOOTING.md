# Guide de Dépannage - Edge Task

## 🔧 Problème : Erreur 409 - Contrainte de clé étrangère

### Symptômes
- Erreur 409 lors de la création de tâches
- Message : "Key (user_id) is not present in table 'users'"
- Les tâches ne peuvent pas être créées

### Cause
La table `tasks` fait référence à une table `users` qui n'existe pas. Supabase utilise `auth.users` pour l'authentification.

### Solution

#### Option 1 : Réparation rapide (Recommandée)
```bash
# Exécuter le script de réparation
./fix-database.sh
```

#### Option 2 : Configuration complète
```bash
# Exécuter le script de configuration complet
./setup-database.sh
```

#### Option 3 : Réparation manuelle
```bash
# Se connecter à Supabase CLI
supabase login

# Lier le projet
supabase link --project-ref ccpkpjuiqhlqxgfszjnb

# Réinitialiser la base de données
supabase db reset --linked
```

### Vérification

1. **Tester la connexion** :
   - Aller sur `http://localhost:8080/db-test`
   - Cliquer sur "Run Database Test"
   - Vérifier que tous les tests passent

2. **Tester la création de tâches** :
   - Aller sur `http://localhost:8080/tasks`
   - Essayer de créer une nouvelle tâche
   - Vérifier qu'elle s'affiche correctement

## 🐛 Autres Problèmes Courants

### Problème : Pages blanches après connexion
**Solution** : Vérifier que l'utilisateur est bien connecté
- Aller sur `http://localhost:8080/debug`
- Vérifier le statut d'authentification

### Problème : Erreurs de composants UI
**Solution** : Vérifier les imports et les props
- Vérifier la console du navigateur (F12)
- S'assurer que tous les composants sont correctement importés

### Problème : Données ne se chargent pas
**Solution** : Vérifier les services et la base de données
- Tester la connexion avec `/db-test`
- Vérifier les logs dans la console
- S'assurer que les tables existent

## 📋 Checklist de Vérification

- [ ] Supabase CLI installé
- [ ] Projet Supabase lié
- [ ] Tables créées correctement
- [ ] Politiques RLS configurées
- [ ] Utilisateur authentifié
- [ ] Services fonctionnels
- [ ] Interface utilisateur responsive

## 🔍 Outils de Diagnostic

### Pages de Test
- `/debug` - Test d'authentification
- `/db-test` - Test de base de données
- `/test` - Test du ProtectedRoute

### Commandes Utiles
```bash
# Vérifier l'état de Supabase
supabase status

# Voir les logs
supabase logs

# Réinitialiser la base de données
supabase db reset --linked

# Appliquer les migrations
supabase db push
```

## 📞 Support

Si les problèmes persistent :
1. Vérifier les logs dans la console du navigateur
2. Tester avec les pages de diagnostic
3. Vérifier la configuration Supabase
4. Consulter la documentation Supabase

---

**Note** : Après avoir exécuté `fix-database.sh`, redémarrez le serveur de développement :
```bash
npm run dev
``` 