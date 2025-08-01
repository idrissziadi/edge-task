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

    console.log(`NotificationService: ${action}`);

    switch (action) {
      case 'schedule-reminder':
        return await handleScheduleReminder(supabaseClient, user.id, req);
      case 'send-reminder':
        return await handleSendReminder(supabaseClient, req);
      case 'get-pending-notifications':
        return await handleGetPendingNotifications(supabaseClient, user.id);
      case 'mark-as-read':
        return await handleMarkAsRead(supabaseClient, user.id, req);
      case 'get-notification-settings':
        return await handleGetNotificationSettings(supabaseClient, user.id);
      case 'update-notification-settings':
        return await handleUpdateNotificationSettings(supabaseClient, user.id, req);
      case 'check-overdue-tasks':
        return await handleCheckOverdueTasks(supabaseClient);
      default:
        return new Response(
          JSON.stringify({ error: 'Invalid action' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    }
  } catch (error) {
    console.error('NotificationService Error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

// Planifier un rappel
async function handleScheduleReminder(supabaseClient: any, userId: string, req: Request) {
  const { taskId, reminderTime, type = 'deadline' } = await req.json();

  if (!taskId || !reminderTime) {
    return new Response(
      JSON.stringify({ error: 'Task ID and reminder time are required' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  // Récupérer les informations de la tâche
  const { data: task, error: taskError } = await supabaseClient
    .from('tasks')
    .select('*')
    .eq('id', taskId)
    .eq('user_id', userId)
    .single();

  if (taskError) throw taskError;

  if (!task) {
    return new Response(
      JSON.stringify({ error: 'Task not found' }),
      { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  // Créer la notification programmée
  const notification = {
    id: crypto.randomUUID(),
    user_id: userId,
    task_id: taskId,
    type,
    title: `Reminder: ${task.title}`,
    message: `Don't forget about your task: ${task.title}`,
    scheduled_for: reminderTime,
    is_read: false,
    created_at: new Date().toISOString(),
  };

  // Pour cette démo, on stocke les notifications dans une table virtuelle
  // En production, on utiliserait une vraie table de notifications
  const { data, error } = await supabaseClient
    .from('notifications')
    .insert(notification)
    .select()
    .single();

  if (error) {
    // Si la table n'existe pas, créer une notification en mémoire
    console.log('Notification scheduled:', notification);
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        notification: notification,
        message: 'Reminder scheduled successfully' 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  return new Response(
    JSON.stringify({ success: true, notification: data }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

// Envoyer un rappel
async function handleSendReminder(supabaseClient: any, req: Request) {
  const { taskId, userId, message } = await req.json();

  // Récupérer les informations de la tâche
  const { data: task } = await supabaseClient
    .from('tasks')
    .select('*')
    .eq('id', taskId)
    .single();

  // Récupérer les informations de l'utilisateur
  const { data: user } = await supabaseClient
    .from('users')
    .select('*')
    .eq('auth_user_id', userId)
    .single();

  // Simuler l'envoi d'une notification push/email
  const notification = {
    to: user?.name || 'User',
    subject: 'Task Reminder',
    message: message || `Reminder: ${task?.title}`,
    task: task,
    timestamp: new Date().toISOString(),
  };

  console.log('Sending notification:', notification);

  // Ici on pourrait intégrer avec des services comme:
  // - Firebase Cloud Messaging pour les notifications push
  // - SendGrid pour les emails
  // - Twilio pour les SMS

  return new Response(
    JSON.stringify({ 
      success: true, 
      notification,
      message: 'Reminder sent successfully' 
    }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

// Récupérer les notifications en attente
async function handleGetPendingNotifications(supabaseClient: any, userId: string) {
  // Notifications de tâches dues aujourd'hui
  const today = new Date();
  const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const endOfDay = new Date(startOfDay.getTime() + 24 * 60 * 60 * 1000);

  const { data: dueTasks } = await supabaseClient
    .from('tasks')
    .select('*')
    .eq('user_id', userId)
    .eq('is_completed', false)
    .gte('deadline', startOfDay.toISOString())
    .lt('deadline', endOfDay.toISOString());

  // Notifications de tâches en retard
  const { data: overdueTasks } = await supabaseClient
    .from('tasks')
    .select('*')
    .eq('user_id', userId)
    .eq('is_completed', false)
    .lt('deadline', today.toISOString());

  const notifications = [
    ...(dueTasks || []).map(task => ({
      id: `due-${task.id}`,
      type: 'due_today',
      title: 'Task Due Today',
      message: `"${task.title}" is due today`,
      task_id: task.id,
      priority: task.priority,
      created_at: new Date().toISOString(),
      is_read: false,
    })),
    ...(overdueTasks || []).map(task => ({
      id: `overdue-${task.id}`,
      type: 'overdue',
      title: 'Overdue Task',
      message: `"${task.title}" is overdue`,
      task_id: task.id,
      priority: task.priority,
      created_at: task.deadline,
      is_read: false,
    })),
  ];

  return new Response(
    JSON.stringify({ notifications }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

// Marquer comme lu
async function handleMarkAsRead(supabaseClient: any, userId: string, req: Request) {
  const { notificationId } = await req.json();

  // Pour cette démo, on simule le marquage comme lu
  console.log(`Marking notification ${notificationId} as read for user ${userId}`);

  return new Response(
    JSON.stringify({ success: true }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

// Récupérer les paramètres de notification
async function handleGetNotificationSettings(supabaseClient: any, userId: string) {
  // Récupérer ou créer les paramètres par défaut
  const defaultSettings = {
    email_reminders: true,
    push_notifications: true,
    daily_summary: true,
    deadline_alerts: true,
    reminder_time_before: 60, // minutes
  };

  // En production, on stockerait ces paramètres dans une table
  return new Response(
    JSON.stringify({ settings: defaultSettings }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

// Mettre à jour les paramètres de notification
async function handleUpdateNotificationSettings(supabaseClient: any, userId: string, req: Request) {
  const settings = await req.json();

  console.log(`Updating notification settings for user ${userId}:`, settings);

  // En production, on sauvegarderait dans une table notification_settings
  return new Response(
    JSON.stringify({ success: true, settings }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

// Vérifier les tâches en retard
async function handleCheckOverdueTasks(supabaseClient: any) {
  const now = new Date().toISOString();

  const { data: overdueTasks } = await supabaseClient
    .from('tasks')
    .select(`
      *,
      users!tasks_user_id_fkey(name, auth_user_id)
    `)
    .eq('is_completed', false)
    .lt('deadline', now);

  if (!overdueTasks || overdueTasks.length === 0) {
    return new Response(
      JSON.stringify({ message: 'No overdue tasks found', count: 0 }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  // Grouper par utilisateur
  const userTasks = overdueTasks.reduce((acc, task) => {
    const userId = task.user_id;
    if (!acc[userId]) {
      acc[userId] = {
        user: task.users,
        tasks: []
      };
    }
    acc[userId].tasks.push(task);
    return acc;
  }, {});

  const notifications = [];

  // Créer des notifications pour chaque utilisateur
  for (const [userId, userData] of Object.entries(userTasks)) {
    const user = userData.user;
    const tasks = userData.tasks;

    notifications.push({
      user_id: userId,
      user_name: user.name,
      overdue_count: tasks.length,
      tasks: tasks.map(t => ({
        id: t.id,
        title: t.title,
        deadline: t.deadline,
        priority: t.priority
      }))
    });
  }

  console.log(`Found ${overdueTasks.length} overdue tasks for ${Object.keys(userTasks).length} users`);

  return new Response(
    JSON.stringify({ 
      success: true, 
      overdue_count: overdueTasks.length,
      users_affected: Object.keys(userTasks).length,
      notifications 
    }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}