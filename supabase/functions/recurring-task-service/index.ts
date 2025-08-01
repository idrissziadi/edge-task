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

    const url = new URL(req.url);
    const action = url.searchParams.get('action');

    console.log(`RecurringTaskService: ${action}`);

    switch (action) {
      case 'generate-recurring-tasks':
        return await handleGenerateRecurringTasks(supabaseClient);
      case 'process-user-recurring':
        return await handleProcessUserRecurring(supabaseClient, req);
      case 'update-recurrence-rule':
        return await handleUpdateRecurrenceRule(supabaseClient, req);
      case 'pause-recurring-task':
        return await handlePauseRecurringTask(supabaseClient, req);
      case 'get-recurring-tasks':
        return await handleGetRecurringTasks(supabaseClient, req);
      default:
        return new Response(
          JSON.stringify({ error: 'Invalid action' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    }
  } catch (error) {
    console.error('RecurringTaskService Error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

// Générer toutes les tâches récurrentes
async function handleGenerateRecurringTasks(supabaseClient: any) {
  const { data: recurringTasks, error } = await supabaseClient
    .from('tasks')
    .select('*')
    .eq('is_recurring', true)
    .eq('is_completed', false);

  if (error) throw error;

  const generatedTasks = [];
  const today = new Date();

  for (const task of recurringTasks) {
    const newTasks = await generateTaskInstances(task, today);
    
    for (const newTask of newTasks) {
      const { data: insertedTask, error: insertError } = await supabaseClient
        .from('tasks')
        .insert({
          ...newTask,
          id: undefined, // Let Supabase generate new ID
        })
        .select()
        .single();

      if (insertError) {
        console.error('Error inserting recurring task:', insertError);
        continue;
      }

      generatedTasks.push(insertedTask);
    }
  }

  return new Response(
    JSON.stringify({ 
      success: true, 
      generated_count: generatedTasks.length,
      tasks: generatedTasks
    }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

// Traiter les tâches récurrentes d'un utilisateur spécifique
async function handleProcessUserRecurring(supabaseClient: any, req: Request) {
  const { userId } = await req.json();

  if (!userId) {
    return new Response(
      JSON.stringify({ error: 'User ID required' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  const { data: recurringTasks, error } = await supabaseClient
    .from('tasks')
    .select('*')
    .eq('user_id', userId)
    .eq('is_recurring', true);

  if (error) throw error;

  const generatedTasks = [];
  const today = new Date();

  for (const task of recurringTasks) {
    const newTasks = await generateTaskInstances(task, today);
    
    for (const newTask of newTasks) {
      // Vérifier qu'une instance similaire n'existe pas déjà
      const { data: existingTask } = await supabaseClient
        .from('tasks')
        .select('id')
        .eq('user_id', userId)
        .eq('title', newTask.title)
        .gte('created_at', new Date(today.getTime() - 24 * 60 * 60 * 1000).toISOString())
        .single();

      if (existingTask) {
        continue; // Skip if task already exists for today
      }

      const { data: insertedTask, error: insertError } = await supabaseClient
        .from('tasks')
        .insert(newTask)
        .select()
        .single();

      if (!insertError) {
        generatedTasks.push(insertedTask);
      }
    }
  }

  return new Response(
    JSON.stringify({ 
      success: true, 
      generated_count: generatedTasks.length,
      tasks: generatedTasks
    }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

// Mettre à jour la règle de récurrence
async function handleUpdateRecurrenceRule(supabaseClient: any, req: Request) {
  const { taskId, recurrenceRule } = await req.json();

  if (!taskId || !recurrenceRule) {
    return new Response(
      JSON.stringify({ error: 'Task ID and recurrence rule required' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  const { data, error } = await supabaseClient
    .from('tasks')
    .update({ 
      recurrence_rule: recurrenceRule,
      is_recurring: true 
    })
    .eq('id', taskId)
    .select()
    .single();

  if (error) throw error;

  return new Response(
    JSON.stringify({ success: true, task: data }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

// Mettre en pause une tâche récurrente
async function handlePauseRecurringTask(supabaseClient: any, req: Request) {
  const { taskId, paused = true } = await req.json();

  if (!taskId) {
    return new Response(
      JSON.stringify({ error: 'Task ID required' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  // Pour mettre en pause, on peut ajouter un suffixe à la règle
  const { data: task } = await supabaseClient
    .from('tasks')
    .select('recurrence_rule')
    .eq('id', taskId)
    .single();

  let newRule = task?.recurrence_rule || '';
  
  if (paused) {
    newRule = newRule.includes('PAUSED') ? newRule : `${newRule};PAUSED=true`;
  } else {
    newRule = newRule.replace(/;PAUSED=true/g, '');
  }

  const { data, error } = await supabaseClient
    .from('tasks')
    .update({ recurrence_rule: newRule })
    .eq('id', taskId)
    .select()
    .single();

  if (error) throw error;

  return new Response(
    JSON.stringify({ success: true, task: data, paused }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

// Récupérer les tâches récurrentes
async function handleGetRecurringTasks(supabaseClient: any, req: Request) {
  const authHeader = req.headers.get('Authorization');
  
  let query = supabaseClient
    .from('tasks')
    .select('*')
    .eq('is_recurring', true);

  // Si un token est fourni, filtrer par utilisateur
  if (authHeader) {
    const token = authHeader.replace('Bearer ', '');
    const { data: { user } } = await supabaseClient.auth.getUser(token);
    if (user) {
      query = query.eq('user_id', user.id);
    }
  }

  const { data: tasks, error } = await query.order('created_at', { ascending: false });

  if (error) throw error;

  return new Response(
    JSON.stringify({ recurring_tasks: tasks }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

// Fonction utilitaire pour générer les instances de tâches
async function generateTaskInstances(originalTask: any, referenceDate: Date) {
  const recurrenceRule = originalTask.recurrence_rule;
  
  if (!recurrenceRule || recurrenceRule.includes('PAUSED=true')) {
    return [];
  }

  const newTasks = [];
  
  // Parser simple des règles de récurrence
  // Format attendu: "DAILY", "WEEKLY", "MONTHLY", "YEARLY"
  // ou format plus complexe: "FREQ=DAILY;INTERVAL=2"
  
  const rules = parseRecurrenceRule(recurrenceRule);
  
  if (!rules.freq) return [];

  const nextDueDate = calculateNextDueDate(originalTask, referenceDate, rules);
  
  if (nextDueDate && shouldGenerateTask(originalTask, nextDueDate, referenceDate)) {
    const newTask = {
      ...originalTask,
      id: undefined,
      title: `${originalTask.title}`,
      deadline: nextDueDate.toISOString(),
      is_completed: false,
      created_at: referenceDate.toISOString(),
      updated_at: referenceDate.toISOString(),
      is_recurring: false, // Les instances générées ne sont pas récurrentes
    };

    newTasks.push(newTask);
  }

  return newTasks;
}

// Parser les règles de récurrence
function parseRecurrenceRule(rule: string) {
  const rules: any = {};
  
  // Format simple
  const simpleRules = ['DAILY', 'WEEKLY', 'MONTHLY', 'YEARLY'];
  if (simpleRules.includes(rule.toUpperCase())) {
    rules.freq = rule.toUpperCase();
    rules.interval = 1;
    return rules;
  }

  // Format complexe
  const parts = rule.split(';');
  for (const part of parts) {
    const [key, value] = part.split('=');
    if (key && value) {
      rules[key.toLowerCase()] = value;
    }
  }

  rules.interval = parseInt(rules.interval) || 1;
  
  return rules;
}

// Calculer la prochaine date d'échéance
function calculateNextDueDate(originalTask: any, referenceDate: Date, rules: any): Date | null {
  const lastDeadline = originalTask.deadline ? new Date(originalTask.deadline) : new Date(originalTask.created_at);
  const freq = rules.freq?.toLowerCase();
  const interval = rules.interval || 1;

  let nextDate = new Date(lastDeadline);

  switch (freq) {
    case 'daily':
      nextDate.setDate(nextDate.getDate() + interval);
      break;
    case 'weekly':
      nextDate.setDate(nextDate.getDate() + (7 * interval));
      break;
    case 'monthly':
      nextDate.setMonth(nextDate.getMonth() + interval);
      break;
    case 'yearly':
      nextDate.setFullYear(nextDate.getFullYear() + interval);
      break;
    default:
      return null;
  }

  return nextDate;
}

// Vérifier si on doit générer la tâche
function shouldGenerateTask(originalTask: any, nextDueDate: Date, referenceDate: Date): boolean {
  // Générer seulement si la prochaine date est aujourd'hui ou dans le passé
  // et qu'elle n'est pas trop ancienne (max 7 jours)
  const diffTime = nextDueDate.getTime() - referenceDate.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  return diffDays <= 0 && diffDays >= -7;
}