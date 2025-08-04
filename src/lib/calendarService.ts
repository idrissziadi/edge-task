
import { supabase } from "@/integrations/supabase/client";

export interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  start_time: string;
  end_time: string;
  all_day: boolean;
  location?: string;
  color?: string;
  category_id?: string;
  user_id: string;
  created_at: string;
  updated_at: string;
}

export const calendarService = {
  // Récupérer le user_id depuis la table users
  async getUserId(): Promise<string | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const { data, error } = await supabase
        .from('users')
        .select('id')
        .eq('auth_user_id', user.id)
        .single();

      if (error) {
        console.error('Error getting user_id:', error);
        return null;
      }
      
      return data.id;
    } catch (error) {
      console.error('Error getting user_id:', error);
      return null;
    }
  },

  // Récupérer tous les événements de l'utilisateur
  async getEvents(): Promise<CalendarEvent[]> {
    try {
      const userId = await this.getUserId();
      if (!userId) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('calendar_events')
        .select('*')
        .eq('user_id', userId)
        .order('start_time', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching events:', error);
      return [];
    }
  },

  // Créer un nouvel événement
  async createEvent(event: Omit<CalendarEvent, 'id' | 'created_at' | 'updated_at' | 'user_id'>): Promise<CalendarEvent | null> {
    try {
      const userId = await this.getUserId();
      if (!userId) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('calendar_events')
        .insert([{
          ...event,
          user_id: userId,
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating event:', error);
      return null;
    }
  },

  // Mettre à jour un événement
  async updateEvent(id: string, updates: Partial<CalendarEvent>): Promise<CalendarEvent | null> {
    try {
      const { data, error } = await supabase
        .from('calendar_events')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating event:', error);
      return null;
    }
  },

  async deleteEvent(id: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('calendar_events')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error deleting event:', error);
      return false;
    }
  },

  async getEventsForPeriod(startDate: string, endDate: string): Promise<CalendarEvent[]> {
    try {
      const userId = await this.getUserId();
      if (!userId) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('calendar_events')
        .select('*')
        .eq('user_id', userId)
        .gte('start_time', startDate)
        .lte('end_time', endDate)
        .order('start_time');

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching events for period:', error);
      return [];
    }
  }
};
