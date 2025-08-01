import { supabase } from "@/integrations/supabase/client";

export interface Task {
  id: string;
  title: string;
  description?: string;
  priority: 'low' | 'medium' | 'high';
  deadline?: string;
  is_completed: boolean;
  is_recurring: boolean;
  recurrence_rule?: string;
  created_at: string;
  updated_at: string;
  user_id: string;
}

export interface TaskStats {
  total: number;
  completed: number;
  pending: number;
  overdue: number;
  completionRate: number;
}

export const taskService = {
  // Récupérer toutes les tâches de l'utilisateur
  async getTasks(): Promise<Task[]> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching tasks:', error);
      return [];
    }
  },

  // Créer une nouvelle tâche
  async createTask(task: Omit<Task, 'id' | 'created_at' | 'updated_at' | 'user_id'>): Promise<Task | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      console.log('Creating task for user:', user.id);
      console.log('Task data:', task);

      const { data, error } = await supabase
        .from('tasks')
        .insert([{
          ...task,
          user_id: user.id,
        }])
        .select()
        .single();

      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }
      
      console.log('Task created successfully:', data);
      return data;
    } catch (error) {
      console.error('Error creating task:', error);
      return null;
    }
  },

  // Mettre à jour une tâche
  async updateTask(id: string, updates: Partial<Task>): Promise<Task | null> {
    try {
      const { data, error } = await supabase
        .from('tasks')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating task:', error);
      return null;
    }
  },

  // Supprimer une tâche
  async deleteTask(id: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error deleting task:', error);
      return false;
    }
  },

  // Récupérer les statistiques des tâches
  async getTaskStats(): Promise<TaskStats> {
    try {
      const tasks = await this.getTasks();
      const now = new Date();

      const total = tasks.length;
      const completed = tasks.filter(task => task.is_completed).length;
      const pending = tasks.filter(task => !task.is_completed).length;
      const overdue = tasks.filter(task => 
        !task.is_completed && 
        task.deadline && 
        new Date(task.deadline) < now
      ).length;

      return {
        total,
        completed,
        pending,
        overdue,
        completionRate: total > 0 ? Math.round((completed / total) * 100) : 0
      };
    } catch (error) {
      console.error('Error getting task stats:', error);
      return {
        total: 0,
        completed: 0,
        pending: 0,
        overdue: 0,
        completionRate: 0
      };
    }
  },

  // Marquer une tâche comme terminée
  async toggleTaskCompletion(id: string): Promise<boolean> {
    try {
      const task = await this.getTasks();
      const currentTask = task.find(t => t.id === id);
      if (!currentTask) return false;

      const { error } = await supabase
        .from('tasks')
        .update({ is_completed: !currentTask.is_completed })
        .eq('id', id);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error toggling task completion:', error);
      return false;
    }
  }
}; 