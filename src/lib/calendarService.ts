import { supabase } from "@/integrations/supabase/client";

export interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  start_time: string;
  end_time: string;
  all_day: boolean;
  location?: string;
  color: string;
  category_id?: string;
  user_id: string;
  created_at: string;
  updated_at: string;
}

export interface CalendarEventStats {
  total: number;
  upcoming: number;
  past: number;
  today: number;
}

export const calendarService = {
  // Récupérer tous les événements de l'utilisateur
  async getEvents(): Promise<CalendarEvent[]> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('calendar_events')
        .select('*')
        .eq('user_id', user.id)
        .order('start_time');

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching events:', error);
      return [];
    }
  },

  // Récupérer les événements pour une période donnée
  async getEventsByDateRange(startDate: string, endDate: string): Promise<CalendarEvent[]> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('calendar_events')
        .select('*')
        .eq('user_id', user.id)
        .gte('start_time', startDate)
        .lte('end_time', endDate)
        .order('start_time');

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching events by date range:', error);
      return [];
    }
  },

  // Créer un nouvel événement
  async createEvent(event: Omit<CalendarEvent, 'id' | 'created_at' | 'updated_at' | 'user_id'>): Promise<CalendarEvent | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('calendar_events')
        .insert([{
          ...event,
          user_id: user.id,
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

  // Supprimer un événement
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

  // Récupérer les statistiques des événements
  async getEventStats(): Promise<CalendarEventStats> {
    try {
      const events = await this.getEvents();
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

      const total = events.length;
      const upcoming = events.filter(event => new Date(event.start_time) > now).length;
      const past = events.filter(event => new Date(event.end_time) < now).length;
      const todayEvents = events.filter(event => {
        const eventDate = new Date(event.start_time);
        return eventDate >= today && eventDate < new Date(today.getTime() + 24 * 60 * 60 * 1000);
      }).length;

      return {
        total,
        upcoming,
        past,
        today: todayEvents
      };
    } catch (error) {
      console.error('Error getting event stats:', error);
      return {
        total: 0,
        upcoming: 0,
        past: 0,
        today: 0
      };
    }
  }
}; 