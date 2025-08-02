import { useState, useEffect } from "react";
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Plus,
  Clock,
  MapPin,
  Users,
  Bell,
  Edit,
  Trash2,
  Filter,
  Search,
  Download,
  Upload
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { formatUserForHeader } from "@/lib/utils";
import { calendarService, CalendarEvent as CalendarEventType } from "@/lib/calendarService";
import { taskService, Task } from "@/lib/taskService";


export const CalendarPage = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<'month' | 'week' | 'day'>('month');
  const [events, setEvents] = useState<CalendarEventType[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateEventOpen, setIsCreateEventOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEventType | null>(null);
  const [filterCategory, setFilterCategory] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [user, setUser] = useState<any>(null);
  const { toast } = useToast();

  const [newEvent, setNewEvent] = useState({
    title: "",
    description: "",
    start_time: "",
    end_time: "",
    all_day: false,
    location: "",
    color: "#3B82F6"
  });

  const categories = [
    { value: "personal", label: "Personal", color: "bg-blue-500" },
    { value: "work", label: "Work", color: "bg-green-500" },
    { value: "meeting", label: "Meeting", color: "bg-purple-500" },
    { value: "appointment", label: "Appointment", color: "bg-red-500" },
    { value: "deadline", label: "Deadline", color: "bg-orange-500" },
    { value: "social", label: "Social", color: "bg-pink-500" }
  ];

  useEffect(() => {
    checkUser();
    loadCalendarData();
  }, []);

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setUser(user);
  };

  const loadCalendarData = async () => {
    try {
      setLoading(true);
      
      // Load calendar events
      const events = await calendarService.getEvents();
      setEvents(events);

      // Load tasks with deadlines
      const tasks = await taskService.getTasks();
      setTasks(tasks.filter(task => task.deadline));

    } catch (error) {
      console.error('Error loading calendar data:', error);
      toast({
        title: "Error",
        description: "Failed to load calendar data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const createEvent = async () => {
    try {
      const event = await calendarService.createEvent({
        title: newEvent.title,
        description: newEvent.description,
        start_time: newEvent.start_time,
        end_time: newEvent.end_time,
        all_day: newEvent.all_day,
        location: newEvent.location,
        color: newEvent.color
      });

      if (event) {
        setEvents(prev => [...prev, event]);
        setIsCreateEventOpen(false);
        setNewEvent({
          title: "",
          description: "",
          start_time: "",
          end_time: "",
          all_day: false,
          location: "",
          color: "#3B82F6"
        });

        toast({
          title: "Success",
          description: "Event created successfully"
        });
      }
    } catch (error) {
      console.error('Error creating event:', error);
      toast({
        title: "Error",
        description: "Failed to create event",
        variant: "destructive"
      });
    }
  };

  const deleteEvent = async (eventId: string) => {
    try {
      const success = await calendarService.deleteEvent(eventId);
      
      if (success) {
        setEvents(prev => prev.filter(event => event.id !== eventId));
        setSelectedEvent(null);
        toast({
          title: "Success",
          description: "Event deleted successfully"
        });
      }
    } catch (error) {
      console.error('Error deleting event:', error);
      toast({
        title: "Error",
        description: "Failed to delete event",
        variant: "destructive"
      });
    }
  };

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }
    
    return days;
  };

  const getEventsForDate = (date: Date) => {
    return events.filter(event => {
      const eventDate = new Date(event.start_time);
      return eventDate.toDateString() === date.toDateString();
    });
  };

  const getTasksForDate = (date: Date) => {
    return tasks.filter(task => {
      if (!task.deadline) return false;
      const taskDate = new Date(task.deadline);
      return taskDate.toDateString() === date.toDateString();
    });
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      if (direction === 'prev') {
        newDate.setMonth(prev.getMonth() - 1);
      } else {
        newDate.setMonth(prev.getMonth() + 1);
      }
      return newDate;
    });
  };

  const navigateWeek = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      if (direction === 'prev') {
        newDate.setDate(prev.getDate() - 7);
      } else {
        newDate.setDate(prev.getDate() + 7);
      }
      return newDate;
    });
  };

  const navigateDay = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      if (direction === 'prev') {
        newDate.setDate(prev.getDate() - 1);
      } else {
        newDate.setDate(prev.getDate() + 1);
      }
      return newDate;
    });
  };

  const getWeekDays = (date: Date) => {
    const startOfWeek = new Date(date);
    const day = startOfWeek.getDay();
    const diff = startOfWeek.getDate() - day;
    startOfWeek.setDate(diff);

    const weekDays = [];
    for (let i = 0; i < 7; i++) {
      const day = new Date(startOfWeek);
      day.setDate(startOfWeek.getDate() + i);
      weekDays.push(day);
    }
    return weekDays;
  };

  const getCategoryColor = (category: string) => {
    return categories.find(c => c.value === category)?.color || "bg-gray-500";
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'border-l-red-500';
      case 'medium': return 'border-l-yellow-500';
      case 'low': return 'border-l-green-500';
      default: return 'border-l-gray-500';
    }
  };

  const exportCalendar = () => {
    const calendarData = {
      events,
      tasks: tasks.filter(t => t.deadline),
      exported_at: new Date().toISOString()
    };
    
    const dataStr = JSON.stringify(calendarData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `calendar-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    toast({
      title: "Success",
      description: "Calendar exported successfully"
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header user={formatUserForHeader(user)} onLogout={() => supabase.auth.signOut()} />
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-muted rounded w-1/4"></div>
            <div className="h-96 bg-muted rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
              <Header user={formatUserForHeader(user)} onLogout={() => supabase.auth.signOut()} />
      
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
              <CalendarIcon className="h-8 w-8" />
              Calendar
            </h1>
            <p className="text-muted-foreground">Manage your events, deadlines, and schedule</p>
          </div>
          
          <div className="flex flex-wrap gap-2">
            <div className="flex gap-1">
              <Button
                variant={view === 'month' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setView('month')}
              >
                Month
              </Button>
              <Button
                variant={view === 'week' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setView('week')}
              >
                Week
              </Button>
              <Button
                variant={view === 'day' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setView('day')}
              >
                Day
              </Button>
            </div>
            
            <Button onClick={exportCalendar} variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
            
            <Dialog open={isCreateEventOpen} onOpenChange={setIsCreateEventOpen}>
              <DialogTrigger asChild>
                <Button className="bg-gradient-primary">
                  <Plus className="h-4 w-4 mr-2" />
                  New Event
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Create New Event</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="event-title">Event Title</Label>
                    <Input
                      id="event-title"
                      value={newEvent.title}
                      onChange={(e) => setNewEvent(prev => ({ ...prev, title: e.target.value }))}
                      placeholder="Enter event title"
                    />
                  </div>
                  <div>
                    <Label htmlFor="event-description">Description</Label>
                    <Textarea
                      id="event-description"
                      value={newEvent.description}
                      onChange={(e) => setNewEvent(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Event description"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="start-time">Start Date & Time</Label>
                      <Input
                        id="start-time"
                        type="datetime-local"
                        value={newEvent.start_time}
                        onChange={(e) => setNewEvent(prev => ({ ...prev, start_time: e.target.value }))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="end-time">End Date & Time</Label>
                      <Input
                        id="end-time"
                        type="datetime-local"
                        value={newEvent.end_time}
                        onChange={(e) => setNewEvent(prev => ({ ...prev, end_time: e.target.value }))}
                      />
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="all-day"
                      checked={newEvent.all_day}
                      onChange={(e) => setNewEvent(prev => ({ ...prev, all_day: e.target.checked }))}
                    />
                    <Label htmlFor="all-day">All Day Event</Label>
                  </div>
                  <div>
                    <Label htmlFor="location">Location</Label>
                    <Input
                      id="location"
                      value={newEvent.location}
                      onChange={(e) => setNewEvent(prev => ({ ...prev, location: e.target.value }))}
                      placeholder="Event location"
                    />
                  </div>
                  <div>
                    <Label htmlFor="color">Color</Label>
                    <Input
                      id="color"
                      type="color"
                      value={newEvent.color}
                      onChange={(e) => setNewEvent(prev => ({ ...prev, color: e.target.value }))}
                    />
                  </div>
                  <Button onClick={createEvent} className="w-full bg-gradient-primary">
                    Create Event
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Calendar Navigation */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                if (view === 'month') navigateMonth('prev');
                else if (view === 'week') navigateWeek('prev');
                else navigateDay('prev');
              }}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <h2 className="text-xl font-semibold min-w-48 text-center">
              {view === 'month' && currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
              {view === 'week' && `Week of ${currentDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`}
              {view === 'day' && currentDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
            </h2>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                if (view === 'month') navigateMonth('next');
                else if (view === 'week') navigateWeek('next');
                else navigateDay('next');
              }}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentDate(new Date())}
          >
            Today
          </Button>
        </div>

        {/* Calendar Views */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-3">
            {view === 'month' && (
              <Card>
                <CardContent className="p-0">
                  <div className="grid grid-cols-7 gap-0 border-b">
                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                      <div key={day} className="p-3 text-center font-medium text-sm bg-muted">
                        {day}
                      </div>
                    ))}
                  </div>
                  <div className="grid grid-cols-7 gap-0">
                    {getDaysInMonth(currentDate).map((day, index) => (
                      <div
                        key={index}
                        className={`min-h-32 p-2 border-r border-b ${
                          day ? 'hover:bg-muted/50 cursor-pointer' : ''
                        } ${
                          day && day.toDateString() === new Date().toDateString() 
                            ? 'bg-primary/10 border-primary' 
                            : ''
                        }`}
                      >
                        {day && (
                          <>
                            <div className="font-medium text-sm mb-1">
                              {day.getDate()}
                            </div>
                            <div className="space-y-1">
                              {getEventsForDate(day).slice(0, 2).map(event => (
                                 <div
                                   key={event.id}
                                   className="text-xs p-1 rounded truncate cursor-pointer bg-blue-500 text-white"
                                   onClick={() => setSelectedEvent(event)}
                                 >
                                   {event.title}
                                 </div>
                              ))}
                              {getTasksForDate(day).slice(0, 1).map(task => (
                                <div
                                  key={task.id}
                                  className="text-xs p-1 rounded truncate bg-orange-100 text-orange-800 border-l-2 border-orange-500"
                                >
                                  📋 {task.title}
                                </div>
                              ))}
                              {(getEventsForDate(day).length + getTasksForDate(day).length) > 3 && (
                                <div className="text-xs text-muted-foreground">
                                  +{(getEventsForDate(day).length + getTasksForDate(day).length) - 3} more
                                </div>
                              )}
                            </div>
                          </>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {view === 'week' && (
              <Card>
                <CardContent className="p-0">
                  <div className="grid grid-cols-8 gap-0 border-b">
                    <div className="p-3 text-center font-medium text-sm bg-muted">Time</div>
                    {getWeekDays(currentDate).map(day => (
                      <div key={day.toISOString()} className="p-3 text-center font-medium text-sm bg-muted">
                        <div>{day.toLocaleDateString('en-US', { weekday: 'short' })}</div>
                        <div className={`text-lg ${
                          day.toDateString() === new Date().toDateString() 
                            ? 'bg-primary text-primary-foreground rounded-full w-8 h-8 flex items-center justify-center mx-auto' 
                            : ''
                        }`}>
                          {day.getDate()}
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="max-h-96 overflow-y-auto">
                    {Array.from({ length: 24 }, (_, hour) => (
                      <div key={hour} className="grid grid-cols-8 gap-0 border-b">
                        <div className="p-2 text-xs text-muted-foreground bg-muted/50 text-center">
                          {hour.toString().padStart(2, '0')}:00
                        </div>
                        {getWeekDays(currentDate).map(day => (
                          <div key={`${day.toISOString()}-${hour}`} className="min-h-12 p-1 border-r">
                           {getEventsForDate(day)
                             .filter(event => {
                               const eventHour = new Date(event.start_time).getHours();
                               return eventHour === hour;
                             })
                             .map(event => (
                               <div
                                 key={event.id}
                                 className="text-xs p-1 rounded mb-1 cursor-pointer bg-blue-500 text-white"
                                 onClick={() => setSelectedEvent(event)}
                               >
                                 {event.title}
                               </div>
                             ))}
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {view === 'day' && (
              <Card>
                <CardHeader>
                  <CardTitle>
                    {currentDate.toLocaleDateString('en-US', { 
                      weekday: 'long', 
                      month: 'long', 
                      day: 'numeric', 
                      year: 'numeric' 
                    })}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {Array.from({ length: 24 }, (_, hour) => (
                      <div key={hour} className="flex gap-4 min-h-12 border-b pb-2">
                        <div className="w-16 text-sm text-muted-foreground">
                          {hour.toString().padStart(2, '0')}:00
                        </div>
                        <div className="flex-1">
                           {getEventsForDate(currentDate)
                             .filter(event => {
                               const eventHour = new Date(event.start_time).getHours();
                               return eventHour === hour;
                             })
                             .map(event => (
                               <div
                                 key={event.id}
                                 className="p-2 rounded mb-2 cursor-pointer border-l-4 border-l-blue-500 bg-muted/50"
                                 onClick={() => setSelectedEvent(event)}
                               >
                                 <div className="font-medium">{event.title}</div>
                                 {event.location && (
                                   <div className="text-sm text-muted-foreground flex items-center gap-1">
                                     <MapPin className="h-3 w-3" />
                                     {event.location}
                                   </div>
                                 )}
                                 <div className="text-sm text-muted-foreground">
                                   {new Date(event.start_time).toLocaleTimeString('en-US', { 
                                     hour: 'numeric', 
                                     minute: '2-digit' 
                                   })} - {new Date(event.end_time).toLocaleTimeString('en-US', { 
                                     hour: 'numeric', 
                                     minute: '2-digit' 
                                   })}
                                 </div>
                               </div>
                             ))}
                          {getTasksForDate(currentDate).map(task => (
                            <div
                              key={task.id}
                              className="p-2 rounded mb-2 bg-orange-50 border-l-4 border-orange-500"
                            >
                              <div className="font-medium flex items-center gap-2">
                                📋 {task.title}
                                <Badge className={`${task.priority === 'high' ? 'bg-red-500' : task.priority === 'medium' ? 'bg-yellow-500' : 'bg-green-500'} text-white text-xs`}>
                                  {task.priority}
                                </Badge>
                              </div>
                              <div className="text-sm text-muted-foreground">
                                Task Deadline
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Upcoming Events */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Upcoming Events</CardTitle>
              </CardHeader>
              <CardContent>
                 <div className="space-y-3">
                   {events
                     .filter(event => new Date(event.start_time) >= new Date())
                     .sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime())
                     .slice(0, 5)
                     .map(event => (
                       <div
                         key={event.id}
                         className="p-3 rounded border cursor-pointer hover:bg-muted/50"
                         onClick={() => setSelectedEvent(event)}
                       >
                         <div className="font-medium text-sm">{event.title}</div>
                         <div className="text-xs text-muted-foreground flex items-center gap-1">
                           <CalendarIcon className="h-3 w-3" />
                           {new Date(event.start_time).toLocaleDateString()}
                         </div>
                         <div className="text-xs text-muted-foreground flex items-center gap-1">
                           <Clock className="h-3 w-3" />
                           {new Date(event.start_time).toLocaleTimeString('en-US', { 
                             hour: 'numeric', 
                             minute: '2-digit' 
                           })}
                         </div>
                       </div>
                     ))}
                 </div>
              </CardContent>
            </Card>

            {/* Task Deadlines */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Task Deadlines</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {tasks
                    .filter(task => task.deadline && new Date(task.deadline) >= new Date())
                    .sort((a, b) => new Date(a.deadline!).getTime() - new Date(b.deadline!).getTime())
                    .slice(0, 5)
                    .map(task => (
                      <div
                        key={task.id}
                        className="p-3 rounded border bg-orange-50 border-orange-200"
                      >
                        <div className="font-medium text-sm">{task.title}</div>
                        <div className="text-xs text-muted-foreground flex items-center gap-1">
                          <CalendarIcon className="h-3 w-3" />
                          Due: {new Date(task.deadline!).toLocaleDateString()}
                        </div>
                        <Badge className={`${task.priority === 'high' ? 'bg-red-500' : task.priority === 'medium' ? 'bg-yellow-500' : 'bg-green-500'} text-white text-xs mt-1`}>
                          {task.priority}
                        </Badge>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Quick Stats</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm">Events Today</span>
                    <span className="font-medium">
                      {getEventsForDate(new Date()).length}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Tasks Due Today</span>
                    <span className="font-medium">
                      {getTasksForDate(new Date()).length}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">This Week</span>
                     <span className="font-medium">
                       {events.filter(event => {
                         const eventDate = new Date(event.start_time);
                         const weekStart = new Date();
                         weekStart.setDate(weekStart.getDate() - weekStart.getDay());
                         const weekEnd = new Date(weekStart);
                         weekEnd.setDate(weekStart.getDate() + 6);
                         return eventDate >= weekStart && eventDate <= weekEnd;
                       }).length}
                     </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Event Details Dialog */}
        <Dialog open={!!selectedEvent} onOpenChange={() => setSelectedEvent(null)}>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>{selectedEvent?.title}</DialogTitle>
            </DialogHeader>
            {selectedEvent && (
              <div className="space-y-4">
                {selectedEvent.description && (
                  <div>
                    <Label>Description</Label>
                    <p className="text-sm text-muted-foreground">{selectedEvent.description}</p>
                  </div>
                )}
                <div className="grid grid-cols-2 gap-4">
                   <div>
                     <Label>Start</Label>
                     <p className="text-sm">
                       {new Date(selectedEvent.start_time).toLocaleString()}
                     </p>
                   </div>
                   <div>
                     <Label>End</Label>
                     <p className="text-sm">
                       {new Date(selectedEvent.end_time).toLocaleString()}
                     </p>
                   </div>
                </div>
                {selectedEvent.location && (
                  <div>
                    <Label>Location</Label>
                    <p className="text-sm flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      {selectedEvent.location}
                    </p>
                  </div>
                )}
                 <div className="flex gap-2">
                   <Badge className="bg-blue-500 text-white">
                     Event
                   </Badge>
                 </div>
                <div className="flex gap-2 pt-4">
                  <Button variant="outline" className="flex-1">
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </Button>
                  <Button 
                    variant="destructive" 
                    className="flex-1"
                    onClick={() => deleteEvent(selectedEvent.id)}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};