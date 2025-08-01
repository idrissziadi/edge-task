import { useState, useEffect } from "react";
import { Header } from "@/components/layout/Header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FeatureCard } from "@/components/ui/feature-card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import {
  CheckSquare,
  Clock,
  TrendingUp,
  AlertTriangle,
  Plus,
  BarChart3,
  Target,
  Calendar,
} from "lucide-react";
import { Link } from "react-router-dom";
import { formatUserForHeader } from "@/lib/utils";
import { taskService, TaskStats } from "@/lib/taskService";
import { goalService, GoalStats } from "@/lib/goalService";

export const Dashboard = () => {
  const [user, setUser] = useState<any>(null);
  const [taskStats, setTaskStats] = useState<TaskStats>({
    total: 0,
    completed: 0,
    pending: 0,
    overdue: 0,
    completionRate: 0
  });
  const [goalStats, setGoalStats] = useState<GoalStats>({
    total: 0,
    completed: 0,
    active: 0,
    overdue: 0,
    completionRate: 0
  });
  const [recentTasks, setRecentTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    console.log('Dashboard - Component mounted');
    checkUser();
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Charger les statistiques des tâches
      const taskStatsData = await taskService.getTaskStats();
      setTaskStats(taskStatsData);
      
      // Charger les statistiques des objectifs
      const goalStatsData = await goalService.getGoalStats();
      setGoalStats(goalStatsData);
      
      // Charger les tâches récentes
      const tasks = await taskService.getTasks();
      setRecentTasks(tasks.slice(0, 5));
      
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      toast({
        title: "Error",
        description: "Failed to load dashboard data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const checkUser = async () => {
    try {
      console.log('Dashboard - Checking user...');
      const { data: { user }, error } = await supabase.auth.getUser();
      console.log('Dashboard - User check result:', user?.email, error);
      setUser(user);
    } catch (error) {
      console.error('Dashboard - Error checking user:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      toast({
        title: "Logged out",
        description: "You have been successfully logged out.",
      });
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const quickActions = [
    {
      title: "Create Task",
      description: "Add a new task to your list",
      icon: Plus,
      iconColor: "blue" as const,
      buttonText: "Create",
      href: "/tasks"
    },
    {
      title: "View Analytics",
      description: "Check your productivity trends",
      icon: BarChart3,
      iconColor: "green" as const,
      buttonText: "Analytics",
      href: "/analytics"
    },
    {
      title: "Goals",
      description: "Set and track your goals",
      icon: Target,
      iconColor: "purple" as const,
      buttonText: "Goals",
      href: "/goals"
    },
    {
      title: "Calendar",
      description: "View your scheduled tasks",
      icon: Calendar,
      iconColor: "orange" as const,
      buttonText: "Calendar",
      href: "/calendar"
    },
  ];

  console.log('Dashboard - Rendering, loading:', loading, 'user:', user?.email);

  if (loading) {
    console.log('Dashboard - Showing loading state');
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading Dashboard...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  console.log('Dashboard - Rendering main content');
  return (
    <div className="min-h-screen bg-background">
      <Header 
        user={formatUserForHeader(user)} 
        onLogout={handleLogout}
        onNotificationsClick={() => toast({ title: "Notifications", description: "No new notifications" })}
        onSettingsClick={() => toast({ title: "Settings", description: "Settings panel coming soon" })}
      />
      
      <div className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">
            Welcome back, {user?.user_metadata?.name || user?.email?.split('@')[0] || 'User'}!
          </h1>
          <p className="text-muted-foreground">
            Here's what's happening with your tasks today.
          </p>
        </div>



        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Tasks</CardTitle>
              <CheckSquare className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{taskStats.total}</div>
              <p className="text-xs text-muted-foreground">
                {taskStats.total > 0 ? `${taskStats.completionRate}% completion rate` : 'No tasks yet'}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completed</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{taskStats.completed}</div>
              <p className="text-xs text-muted-foreground">
                {taskStats.completionRate}% completion rate
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{taskStats.pending}</div>
              <p className="text-xs text-muted-foreground">
                {taskStats.pending > 0 ? 'Tasks waiting for you' : 'No pending tasks'}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Overdue</CardTitle>
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{taskStats.overdue}</div>
              <p className="text-xs text-muted-foreground">
                {taskStats.overdue > 0 ? 'Need attention' : 'All tasks on time'}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {quickActions.map((action) => (
              <FeatureCard
                key={action.title}
                title={action.title}
                description={action.description}
                icon={action.icon}
                iconColor={action.iconColor}
                buttonText={action.buttonText}
                href={action.href}
              />
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Recent Tasks</h2>
          <Card>
            <CardHeader>
              <CardTitle>Recent Tasks</CardTitle>
              <CardDescription>
                Your latest task activity
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {recentTasks.length > 0 ? (
                recentTasks.map((task) => (
                  <div key={task.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className={`w-3 h-3 rounded-full ${
                        task.is_completed ? 'bg-success' : 
                        task.priority === 'high' ? 'bg-destructive' :
                        task.priority === 'medium' ? 'bg-warning' : 'bg-muted'
                      }`}></div>
                      <div>
                        <p className={`font-medium ${task.is_completed ? 'line-through text-muted-foreground' : ''}`}>
                          {task.title}
                        </p>
                        {task.deadline && (
                          <p className="text-sm text-muted-foreground">
                            Due: {new Date(task.deadline).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                    </div>
                    <Button variant="ghost" size="sm" asChild>
                      <Link to="/tasks">View</Link>
                    </Button>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <CheckSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No tasks yet. Create your first task to get started!</p>
                  <Button asChild className="mt-4">
                    <Link to="/tasks">Create Task</Link>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};