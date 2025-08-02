import { supabase } from "@/integrations/supabase/client";

export interface Goal {
  id: string;
  title: string;
  description?: string;
  category: string;
  target_value: number;
  current_value: number;
  unit: string;
  deadline?: string;
  is_completed: boolean;
  priority: 'low' | 'medium' | 'high';
  created_at: string;
  updated_at: string;
  user_id: string;
}

export interface GoalStats {
  total: number;
  completed: number;
  active: number;
  overdue: number;
  completionRate: number;
}

export const goalService = {
  // Récupérer tous les objectifs de l'utilisateur
  async getGoals(): Promise<Goal[]> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('goals')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching goals:', error);
      return [];
    }
  },

  // Créer un nouvel objectif
  async createGoal(goal: Omit<Goal, 'id' | 'created_at' | 'updated_at' | 'user_id'>): Promise<Goal | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('goals')
        .insert([{
          ...goal,
          user_id: user.id,
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating goal:', error);
      return null;
    }
  },

  // Mettre à jour un objectif
  async updateGoal(id: string, updates: Partial<Goal>): Promise<Goal | null> {
    try {
      const { data, error } = await supabase
        .from('goals')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating goal:', error);
      return null;
    }
  },

  // Supprimer un objectif
  async deleteGoal(id: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('goals')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error deleting goal:', error);
      return false;
    }
  },

  // Récupérer les statistiques des objectifs
  async getGoalStats(): Promise<GoalStats> {
    try {
      const goals = await this.getGoals();
      const now = new Date();

      const total = goals.length;
      const completed = goals.filter(goal => goal.is_completed).length;
      const active = goals.filter(goal => !goal.is_completed).length;
      const overdue = goals.filter(goal => 
        !goal.is_completed && 
        goal.deadline && 
        new Date(goal.deadline) < now
      ).length;

      return {
        total,
        completed,
        active,
        overdue,
        completionRate: total > 0 ? Math.round((completed / total) * 100) : 0
      };
    } catch (error) {
      console.error('Error getting goal stats:', error);
      return {
        total: 0,
        completed: 0,
        active: 0,
        overdue: 0,
        completionRate: 0
      };
    }
  },

  // Mettre à jour la progression d'un objectif
  async updateProgress(id: string, currentValue: number): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('goals')
        .update({ 
          current_value: currentValue,
          is_completed: currentValue >= 100 // Marquer comme terminé si 100% atteint
        })
        .eq('id', id);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error updating goal progress:', error);
      return false;
    }
  }
}; 