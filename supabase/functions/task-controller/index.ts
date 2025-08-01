import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface Database {
  public: {
    Tables: {
      tasks: {
        Row: {
          id: string;
          title: string;
          description: string | null;
          user_id: string;
          is_completed: boolean;
          priority: 'low' | 'medium' | 'high' | null;
          deadline: string | null;
          is_recurring: boolean;
          recurrence_rule: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          title: string;
          description?: string;
          user_id: string;
          is_completed?: boolean;
          priority?: 'low' | 'medium' | 'high';
          deadline?: string;
          is_recurring?: boolean;
          recurrence_rule?: string;
        };
        Update: {
          title?: string;
          description?: string;
          is_completed?: boolean;
          priority?: 'low' | 'medium' | 'high';
          deadline?: string;
          is_recurring?: boolean;
          recurrence_rule?: string;
        };
      };
    };
  };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient<Database>(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    );

    const { data: { user } } = await supabaseClient.auth.getUser();
    if (!user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const url = new URL(req.url);
    const method = req.method;
    const action = url.searchParams.get('action');

    console.log(`TaskController: ${method} ${action}`);

    switch (method) {
      case 'GET':
        return await handleGet(supabaseClient, user.id, url.searchParams);
      case 'POST':
        return await handlePost(supabaseClient, user.id, req, action);
      case 'PUT':
        return await handlePut(supabaseClient, user.id, req, url.searchParams);
      case 'DELETE':
        return await handleDelete(supabaseClient, user.id, url.searchParams);
      default:
        return new Response(
          JSON.stringify({ error: 'Method not allowed' }),
          { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    }
  } catch (error) {
    console.error('TaskController Error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

// GET - Récupérer les tâches
async function handleGet(supabaseClient: any, userId: string, searchParams: URLSearchParams) {
  const action = searchParams.get('action');
  
  if (action === 'filter') {
    const status = searchParams.get('status');
    const priority = searchParams.get('priority');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    
    let query = supabaseClient
      .from('tasks')
      .select('*')
      .eq('user_id', userId);
    
    if (status === 'completed') {
      query = query.eq('is_completed', true);
    } else if (status === 'pending') {
      query = query.eq('is_completed', false);
    }
    
    if (priority) {
      query = query.eq('priority', priority);
    }
    
    if (startDate) {
      query = query.gte('created_at', startDate);
    }
    
    if (endDate) {
      query = query.lte('created_at', endDate);
    }
    
    const { data, error } = await query.order('created_at', { ascending: false });
    
    if (error) throw error;
    
    return new Response(
      JSON.stringify({ tasks: data }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
  
  if (action === 'sort') {
    const criteria = searchParams.get('criteria') || 'created_at';
    const order = searchParams.get('order') || 'desc';
    
    const { data, error } = await supabaseClient
      .from('tasks')
      .select('*')
      .eq('user_id', userId)
      .order(criteria, { ascending: order === 'asc' });
    
    if (error) throw error;
    
    return new Response(
      JSON.stringify({ tasks: data }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
  
  // Récupérer toutes les tâches
  const { data, error } = await supabaseClient
    .from('tasks')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  
  if (error) throw error;
  
  return new Response(
    JSON.stringify({ tasks: data }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

// POST - Créer une tâche
async function handlePost(supabaseClient: any, userId: string, req: Request, action: string | null) {
  const body = await req.json();
  
  if (action === 'toggle') {
    const { taskId } = body;
    
    // Récupérer la tâche actuelle
    const { data: currentTask, error: fetchError } = await supabaseClient
      .from('tasks')
      .select('is_completed')
      .eq('id', taskId)
      .eq('user_id', userId)
      .single();
    
    if (fetchError) throw fetchError;
    
    // Inverser le statut
    const { data, error } = await supabaseClient
      .from('tasks')
      .update({ is_completed: !currentTask.is_completed })
      .eq('id', taskId)
      .eq('user_id', userId)
      .select()
      .single();
    
    if (error) throw error;
    
    return new Response(
      JSON.stringify({ task: data }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
  
  // Créer une nouvelle tâche
  const { title, description, priority, deadline, is_recurring, recurrence_rule } = body;
  
  const taskData = {
    title,
    description,
    user_id: userId,
    priority,
    deadline,
    is_recurring: is_recurring || false,
    recurrence_rule,
  };
  
  const { data, error } = await supabaseClient
    .from('tasks')
    .insert(taskData)
    .select()
    .single();
  
  if (error) throw error;
  
  return new Response(
    JSON.stringify({ task: data }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

// PUT - Modifier une tâche
async function handlePut(supabaseClient: any, userId: string, req: Request, searchParams: URLSearchParams) {
  const taskId = searchParams.get('id');
  if (!taskId) {
    return new Response(
      JSON.stringify({ error: 'Task ID required' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
  
  const updates = await req.json();
  
  const { data, error } = await supabaseClient
    .from('tasks')
    .update(updates)
    .eq('id', taskId)
    .eq('user_id', userId)
    .select()
    .single();
  
  if (error) throw error;
  
  return new Response(
    JSON.stringify({ task: data }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

// DELETE - Supprimer une tâche
async function handleDelete(supabaseClient: any, userId: string, searchParams: URLSearchParams) {
  const taskId = searchParams.get('id');
  if (!taskId) {
    return new Response(
      JSON.stringify({ error: 'Task ID required' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
  
  const { error } = await supabaseClient
    .from('tasks')
    .delete()
    .eq('id', taskId)
    .eq('user_id', userId);
  
  if (error) throw error;
  
  return new Response(
    JSON.stringify({ success: true }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}