-- Vérifier et corriger la fonction handle_new_user
DROP FUNCTION IF EXISTS public.handle_new_user();

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
BEGIN
    -- Insérer dans la table users avec les bonnes colonnes
    INSERT INTO public.users (auth_user_id, email, full_name, avatar_url)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name'),
        NEW.raw_user_meta_data->>'avatar_url'
    );
    
    -- Appeler la fonction pour créer les paramètres utilisateur par défaut
    PERFORM create_default_user_settings(NEW.id);
    
    -- Appeler la fonction pour créer les catégories par défaut  
    PERFORM create_default_categories_for_user(NEW.id);
    
    RETURN NEW;
END;
$function$;

-- Créer le trigger s'il n'existe pas
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();