import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Vérifier l'authentification et le rôle admin
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(token);
    
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Invalid token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Vérifier le rôle admin
    const { data: userProfile } = await supabaseClient
      .from('users')
      .select('role')
      .eq('auth_user_id', user.id)
      .single();

    if (userProfile?.role !== 'admin') {
      return new Response(
        JSON.stringify({ error: 'Access denied. Admin role required.' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const url = new URL(req.url);
    const action = url.searchParams.get('action');

    console.log(`AdminController: ${req.method} ${action}`);

    switch (action) {
      case 'get-all-users':
        return await handleGetAllUsers(supabaseClient);
      case 'get-user-by-id':
        return await handleGetUserById(supabaseClient, url.searchParams);
      case 'delete-user':
        return await handleDeleteUser(supabaseClient, url.searchParams);
      case 'disable-user':
        return await handleDisableUser(supabaseClient, url.searchParams);
      case 'get-all-tasks':
        return await handleGetAllTasks(supabaseClient);
      case 'delete-task':
        return await handleDeleteTask(supabaseClient, url.searchParams);
      case 'force-complete-task':
        return await handleForceCompleteTask(supabaseClient, url.searchParams);
      case 'get-system-stats':
        return await handleGetSystemStats(supabaseClient);
      case 'get-all-tags':
        return await handleGetAllTags(supabaseClient);
      case 'create-tag':
        return await handleCreateTag(supabaseClient, req);
      case 'delete-tag':
        return await handleDeleteTag(supabaseClient, url.searchParams);
      default:
        return new Response(
          JSON.stringify({ error: 'Invalid action' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    }
  } catch (error) {
    console.error('AdminController Error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

// Obtenir tous les utilisateurs
async function handleGetAllUsers(supabaseClient: any) {
  const { data: users, error } = await supabaseClient
    .from('users')
    .select(`
      *,
      productivity_stats(*),
      tasks(count)
    `)
    .order('created_at', { ascending: false });

  if (error) throw error;

  // Enrichir avec les données d'authentification
  const enrichedUsers = await Promise.all(
    users.map(async (user: any) => {
      const { data: authUser } = await supabaseClient.auth.admin.getUserById(user.auth_user_id);
      return {
        ...user,
        email: authUser?.user?.email,
        email_confirmed_at: authUser?.user?.email_confirmed_at,
        last_sign_in_at: authUser?.user?.last_sign_in_at,
        is_disabled: authUser?.user?.banned_until !== null,
      };
    })
  );

  return new Response(
    JSON.stringify({ users: enrichedUsers }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

// Obtenir un utilisateur par ID
async function handleGetUserById(supabaseClient: any, searchParams: URLSearchParams) {
  const userId = searchParams.get('userId');
  if (!userId) {
    return new Response(
      JSON.stringify({ error: 'User ID required' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  const { data: user, error } = await supabaseClient
    .from('users')
    .select(`
      *,
      productivity_stats(*),
      tasks(*)
    `)
    .eq('auth_user_id', userId)
    .single();

  if (error) throw error;

  // Récupérer les données d'auth
  const { data: authUser } = await supabaseClient.auth.admin.getUserById(userId);

  const enrichedUser = {
    ...user,
    email: authUser?.user?.email,
    email_confirmed_at: authUser?.user?.email_confirmed_at,
    last_sign_in_at: authUser?.user?.last_sign_in_at,
    is_disabled: authUser?.user?.banned_until !== null,
  };

  return new Response(
    JSON.stringify({ user: enrichedUser }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

// Supprimer un utilisateur
async function handleDeleteUser(supabaseClient: any, searchParams: URLSearchParams) {
  const userId = searchParams.get('userId');
  if (!userId) {
    return new Response(
      JSON.stringify({ error: 'User ID required' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  // Supprimer d'abord les données liées
  await supabaseClient.from('tasks').delete().eq('user_id', userId);
  await supabaseClient.from('productivity_stats').delete().eq('user_id', userId);
  await supabaseClient.from('users').delete().eq('auth_user_id', userId);

  // Supprimer l'utilisateur de l'auth
  const { error } = await supabaseClient.auth.admin.deleteUser(userId);
  if (error) throw error;

  return new Response(
    JSON.stringify({ success: true }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

// Désactiver un utilisateur
async function handleDisableUser(supabaseClient: any, searchParams: URLSearchParams) {
  const userId = searchParams.get('userId');
  const disable = searchParams.get('disable') !== 'false';

  if (!userId) {
    return new Response(
      JSON.stringify({ error: 'User ID required' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  const banUntil = disable ? new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString() : null;

  const { error } = await supabaseClient.auth.admin.updateUserById(userId, {
    ban_duration: disable ? '8760h' : 'none', // 1 year or none
  });

  if (error) throw error;

  return new Response(
    JSON.stringify({ success: true, disabled: disable }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

// Obtenir toutes les tâches du système
async function handleGetAllTasks(supabaseClient: any) {
  const { data: tasks, error } = await supabaseClient
    .from('tasks')
    .select(`
      *,
      users!tasks_user_id_fkey(name, email)
    `)
    .order('created_at', { ascending: false })
    .limit(1000);

  if (error) throw error;

  return new Response(
    JSON.stringify({ tasks }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

// Supprimer une tâche
async function handleDeleteTask(supabaseClient: any, searchParams: URLSearchParams) {
  const taskId = searchParams.get('taskId');
  if (!taskId) {
    return new Response(
      JSON.stringify({ error: 'Task ID required' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  const { error } = await supabaseClient
    .from('tasks')
    .delete()
    .eq('id', taskId);

  if (error) throw error;

  return new Response(
    JSON.stringify({ success: true }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

// Forcer la completion d'une tâche
async function handleForceCompleteTask(supabaseClient: any, searchParams: URLSearchParams) {
  const taskId = searchParams.get('taskId');
  if (!taskId) {
    return new Response(
      JSON.stringify({ error: 'Task ID required' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  const { data, error } = await supabaseClient
    .from('tasks')
    .update({ 
      is_completed: true,
      updated_at: new Date().toISOString()
    })
    .eq('id', taskId)
    .select()
    .single();

  if (error) throw error;

  return new Response(
    JSON.stringify({ task: data }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

// Obtenir les statistiques système
async function handleGetSystemStats(supabaseClient: any) {
  // Nombre total d'utilisateurs
  const { count: totalUsers } = await supabaseClient
    .from('users')
    .select('*', { count: 'exact', head: true });

  // Nombre total de tâches
  const { count: totalTasks } = await supabaseClient
    .from('tasks')
    .select('*', { count: 'exact', head: true });

  // Tâches complétées
  const { count: completedTasks } = await supabaseClient
    .from('tasks')
    .select('*', { count: 'exact', head: true })
    .eq('is_completed', true);

  // Utilisateurs actifs (connexion dans les 30 derniers jours)
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const { data: authUsers } = await supabaseClient.auth.admin.listUsers();
  const activeUsers = authUsers?.users?.filter(user => 
    user.last_sign_in_at && new Date(user.last_sign_in_at) > thirtyDaysAgo
  ).length || 0;

  // Tâches créées cette semaine
  const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const { count: tasksThisWeek } = await supabaseClient
    .from('tasks')
    .select('*', { count: 'exact', head: true })
    .gte('created_at', oneWeekAgo.toISOString());

  // Tags populaires
  const { data: tags } = await supabaseClient
    .from('tags')
    .select(`
      *,
      task_tags(count)
    `)
    .order('name');

  const stats = {
    totalUsers: totalUsers || 0,
    totalTasks: totalTasks || 0,
    completedTasks: completedTasks || 0,
    activeUsers,
    tasksThisWeek: tasksThisWeek || 0,
    completionRate: totalTasks > 0 ? ((completedTasks || 0) / totalTasks) * 100 : 0,
    popularTags: tags?.slice(0, 10) || []
  };

  return new Response(
    JSON.stringify({ stats }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

// Obtenir tous les tags
async function handleGetAllTags(supabaseClient: any) {
  const { data: tags, error } = await supabaseClient
    .from('tags')
    .select(`
      *,
      task_tags(count)
    `)
    .order('name');

  if (error) throw error;

  return new Response(
    JSON.stringify({ tags }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

// Créer un tag
async function handleCreateTag(supabaseClient: any, req: Request) {
  const { name, color } = await req.json();

  if (!name || !color) {
    return new Response(
      JSON.stringify({ error: 'Name and color are required' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  const { data, error } = await supabaseClient
    .from('tags')
    .insert({ name, color })
    .select()
    .single();

  if (error) throw error;

  return new Response(
    JSON.stringify({ tag: data }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

// Supprimer un tag
async function handleDeleteTag(supabaseClient: any, searchParams: URLSearchParams) {
  const tagId = searchParams.get('tagId');
  if (!tagId) {
    return new Response(
      JSON.stringify({ error: 'Tag ID required' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  // Supprimer d'abord les relations
  await supabaseClient.from('task_tags').delete().eq('tag_id', tagId);

  // Puis supprimer le tag
  const { error } = await supabaseClient
    .from('tags')
    .delete()
    .eq('id', tagId);

  if (error) throw error;

  return new Response(
    JSON.stringify({ success: true }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}