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
    const action = url.searchParams.get('action');

    console.log(`ProductivityService: ${action}`);

    switch (action) {
      case 'daily-stats':
        return await handleDailyStats(supabaseClient, user.id);
      case 'weekly-stats':
        return await handleWeeklyStats(supabaseClient, user.id);
      case 'monthly-stats':
        return await handleMonthlyStats(supabaseClient, user.id);
      case 'productivity-trends':
        return await handleProductivityTrends(supabaseClient, user.id);
      case 'focus-mode':
        return await handleFocusMode(supabaseClient, user.id, req);
      default:
        return new Response(
          JSON.stringify({ error: 'Invalid action' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    }
  } catch (error) {
    console.error('ProductivityService Error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

// Statistiques quotidiennes
async function handleDailyStats(supabaseClient: any, userId: string) {
  const today = new Date();
  const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const endOfDay = new Date(startOfDay.getTime() + 24 * 60 * 60 * 1000);

  // Tâches complétées aujourd'hui
  const { data: completedToday, error: completedError } = await supabaseClient
    .from('tasks')
    .select('*')
    .eq('user_id', userId)
    .eq('is_completed', true)
    .gte('updated_at', startOfDay.toISOString())
    .lt('updated_at', endOfDay.toISOString());

  if (completedError) throw completedError;

  // Tâches créées aujourd'hui
  const { data: createdToday, error: createdError } = await supabaseClient
    .from('tasks')
    .select('*')
    .eq('user_id', userId)
    .gte('created_at', startOfDay.toISOString())
    .lt('created_at', endOfDay.toISOString());

  if (createdError) throw createdError;

  // Tâches en attente
  const { data: pendingTasks, error: pendingError } = await supabaseClient
    .from('tasks')
    .select('*')
    .eq('user_id', userId)
    .eq('is_completed', false);

  if (pendingError) throw pendingError;

  // Tâches en retard
  const { data: overdueTasks, error: overdueError } = await supabaseClient
    .from('tasks')
    .select('*')
    .eq('user_id', userId)
    .eq('is_completed', false)
    .lt('deadline', today.toISOString());

  if (overdueError) throw overdueError;

  // Répartition par priorité
  const priorityDistribution = {
    high: pendingTasks.filter(task => task.priority === 'high').length,
    medium: pendingTasks.filter(task => task.priority === 'medium').length,
    low: pendingTasks.filter(task => task.priority === 'low').length,
    none: pendingTasks.filter(task => !task.priority).length,
  };

  const stats = {
    completedToday: completedToday.length,
    createdToday: createdToday.length,
    pendingTasks: pendingTasks.length,
    overdueTasks: overdueTasks.length,
    completionRate: createdToday.length > 0 ? (completedToday.length / createdToday.length) * 100 : 0,
    priorityDistribution,
    date: today.toISOString().split('T')[0]
  };

  // Mettre à jour les stats dans la table productivity_stats
  await supabaseClient
    .from('productivity_stats')
    .upsert({
      user_id: userId,
      completed_today: completedToday.length,
    });

  return new Response(
    JSON.stringify({ stats }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

// Statistiques hebdomadaires
async function handleWeeklyStats(supabaseClient: any, userId: string) {
  const today = new Date();
  const startOfWeek = new Date(today.getTime() - (today.getDay() * 24 * 60 * 60 * 1000));
  startOfWeek.setHours(0, 0, 0, 0);

  const dailyStats = [];
  
  for (let i = 0; i < 7; i++) {
    const day = new Date(startOfWeek.getTime() + (i * 24 * 60 * 60 * 1000));
    const nextDay = new Date(day.getTime() + 24 * 60 * 60 * 1000);

    const { data: completed } = await supabaseClient
      .from('tasks')
      .select('*')
      .eq('user_id', userId)
      .eq('is_completed', true)
      .gte('updated_at', day.toISOString())
      .lt('updated_at', nextDay.toISOString());

    const { data: created } = await supabaseClient
      .from('tasks')
      .select('*')
      .eq('user_id', userId)
      .gte('created_at', day.toISOString())
      .lt('created_at', nextDay.toISOString());

    dailyStats.push({
      date: day.toISOString().split('T')[0],
      dayName: day.toLocaleDateString('en-US', { weekday: 'short' }),
      completed: completed?.length || 0,
      created: created?.length || 0,
    });
  }

  const totalCompleted = dailyStats.reduce((sum, day) => sum + day.completed, 0);
  const totalCreated = dailyStats.reduce((sum, day) => sum + day.created, 0);
  const weeklyCompletionRate = totalCreated > 0 ? (totalCompleted / totalCreated) * 100 : 0;

  // Mettre à jour les stats hebdomadaires
  await supabaseClient
    .from('productivity_stats')
    .upsert({
      user_id: userId,
      weekly_completed: totalCompleted,
    });

  return new Response(
    JSON.stringify({ 
      weeklyStats: {
        dailyStats,
        totalCompleted,
        totalCreated,
        completionRate: weeklyCompletionRate,
        weekStart: startOfWeek.toISOString().split('T')[0]
      }
    }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

// Statistiques mensuelles
async function handleMonthlyStats(supabaseClient: any, userId: string) {
  const today = new Date();
  const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);

  // Stats par semaine du mois
  const weeklyStats = [];
  let currentWeekStart = new Date(startOfMonth);

  while (currentWeekStart <= endOfMonth) {
    const weekEnd = new Date(Math.min(
      currentWeekStart.getTime() + (6 * 24 * 60 * 60 * 1000),
      endOfMonth.getTime()
    ));

    const { data: completed } = await supabaseClient
      .from('tasks')
      .select('*')
      .eq('user_id', userId)
      .eq('is_completed', true)
      .gte('updated_at', currentWeekStart.toISOString())
      .lte('updated_at', weekEnd.toISOString());

    weeklyStats.push({
      weekStart: currentWeekStart.toISOString().split('T')[0],
      weekEnd: weekEnd.toISOString().split('T')[0],
      completed: completed?.length || 0,
    });

    currentWeekStart = new Date(currentWeekStart.getTime() + (7 * 24 * 60 * 60 * 1000));
  }

  // Total du mois
  const { data: monthlyCompleted } = await supabaseClient
    .from('tasks')
    .select('*')
    .eq('user_id', userId)
    .eq('is_completed', true)
    .gte('updated_at', startOfMonth.toISOString())
    .lte('updated_at', endOfMonth.toISOString());

  const { data: monthlyCreated } = await supabaseClient
    .from('tasks')
    .select('*')
    .eq('user_id', userId)
    .gte('created_at', startOfMonth.toISOString())
    .lte('created_at', endOfMonth.toISOString());

  return new Response(
    JSON.stringify({ 
      monthlyStats: {
        weeklyBreakdown: weeklyStats,
        totalCompleted: monthlyCompleted?.length || 0,
        totalCreated: monthlyCreated?.length || 0,
        completionRate: (monthlyCreated?.length || 0) > 0 ? 
          ((monthlyCompleted?.length || 0) / (monthlyCreated?.length || 0)) * 100 : 0,
        month: today.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
      }
    }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

// Tendances de productivité
async function handleProductivityTrends(supabaseClient: any, userId: string) {
  const thirtyDaysAgo = new Date(Date.now() - (30 * 24 * 60 * 60 * 1000));
  
  const trends = [];
  
  for (let i = 0; i < 30; i++) {
    const day = new Date(thirtyDaysAgo.getTime() + (i * 24 * 60 * 60 * 1000));
    const nextDay = new Date(day.getTime() + 24 * 60 * 60 * 1000);

    const { data: completed } = await supabaseClient
      .from('tasks')
      .select('*')
      .eq('user_id', userId)
      .eq('is_completed', true)
      .gte('updated_at', day.toISOString())
      .lt('updated_at', nextDay.toISOString());

    trends.push({
      date: day.toISOString().split('T')[0],
      completed: completed?.length || 0,
    });
  }

  // Calculer la tendance (moyenne mobile sur 7 jours)
  const movingAverage = trends.map((day, index) => {
    const start = Math.max(0, index - 3);
    const end = Math.min(trends.length, index + 4);
    const slice = trends.slice(start, end);
    const average = slice.reduce((sum, d) => sum + d.completed, 0) / slice.length;
    
    return {
      ...day,
      movingAverage: Math.round(average * 10) / 10
    };
  });

  return new Response(
    JSON.stringify({ trends: movingAverage }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

// Mode focus
async function handleFocusMode(supabaseClient: any, userId: string, req: Request) {
  if (req.method === 'POST') {
    const { enabled } = await req.json();
    
    const { error } = await supabaseClient
      .from('productivity_stats')
      .upsert({
        user_id: userId,
        focus_mode_enabled: enabled,
      });

    if (error) throw error;

    return new Response(
      JSON.stringify({ success: true, focusModeEnabled: enabled }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } else {
    // GET - récupérer l'état du mode focus
    const { data, error } = await supabaseClient
      .from('productivity_stats')
      .select('focus_mode_enabled')
      .eq('user_id', userId)
      .single();

    if (error) throw error;

    return new Response(
      JSON.stringify({ focusModeEnabled: data?.focus_mode_enabled || false }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
}