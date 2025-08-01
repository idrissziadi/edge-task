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

export const Dashboard = () => {
  const [user, setUser] = useState<any>(null);
  const [stats, setStats] = useState<any>(null);
  const [recentTasks, setRecentTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    checkUser();
    loadDashboardData();
  }, []);

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setUser(user);
  };

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Charger les statistiques quotidiennes
      const response = await supabase.functions.invoke('productivity-service', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action: 'daily-stats' })
      });

      if (response.data) {
        setStats(response.data.stats);
      }

      // Charger les tâches récentes
      const tasksResponse = await supabase.functions.invoke('task-controller', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (tasksResponse.data?.tasks) {
        setRecentTasks(tasksResponse.data.tasks.slice(0, 5));
      }

    } catch (error) {
      console.error('Error loading dashboard:', error);
      toast({
        title: "Error",
        description: "Failed to load dashboard data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast({
      title: "Logged out",
      description: "You have been successfully logged out.",
    });
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

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header user={user} onLogout={handleLogout} />
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header user={user} onLogout={handleLogout} />
      
      <div className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">
            Welcome back, {user?.user_metadata?.name || user?.email?.split('@')[0] || 'User'}!
          </h1>
          <p className="text-muted-foreground text-lg">
            Here's what's happening with your tasks today.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completed Today</CardTitle>
              <CheckSquare className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">
                {stats?.completedToday || 0}
              </div>
              <p className="text-xs text-muted-foreground">
                {stats?.completionRate ? `${Math.round(stats.completionRate)}% completion rate` : 'Keep going!'}
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-warning/10 to-warning/5 border-warning/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Tasks</CardTitle>
              <Clock className="h-4 w-4 text-warning" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-warning">
                {stats?.pendingTasks || 0}
              </div>
              <p className="text-xs text-muted-foreground">
                Tasks waiting for you
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-success/10 to-success/5 border-success/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">This Week</CardTitle>
              <TrendingUp className="h-4 w-4 text-success" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-success">
                {stats?.weeklyCompleted || 0}
              </div>
              <p className="text-xs text-muted-foreground">
                Weekly progress
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-destructive/10 to-destructive/5 border-destructive/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Overdue</CardTitle>
              <AlertTriangle className="h-4 w-4 text-destructive" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-destructive">
                {stats?.overdueTasks || 0}
              </div>
              <p className="text-xs text-muted-foreground">
                Need attention
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <h2 className="text-2xl font-semibold mb-6">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {quickActions.map((action, index) => (
              <Link key={index} to={action.href}>
                <FeatureCard
                  title={action.title}
                  description={action.description}
                  icon={action.icon}
                  iconColor={action.iconColor}
                  buttonText={action.buttonText}
                  buttonVariant="outline"
                />
              </Link>
            ))}
          </div>
        </div>

        {/* Recent Tasks */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card>
            <CardHeader>
              <CardTitle>Recent Tasks</CardTitle>
              <CardDescription>Your latest task activity</CardDescription>
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
                    <Button variant="ghost" size="sm">
                      View
                    </Button>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <CheckSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No tasks yet. Create your first task to get started!</p>
                  <Link to="/tasks/new" className="inline-block mt-4">
                    <Button>Create Task</Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Priority Distribution */}
          <Card>
            <CardHeader>
              <CardTitle>Priority Distribution</CardTitle>
              <CardDescription>Breakdown of your pending tasks</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {stats?.priorityDistribution ? (
                <>
                  <div className="flex items-center justify-between">
                    <span className="flex items-center">
                      <div className="w-3 h-3 rounded-full bg-destructive mr-2"></div>
                      High Priority
                    </span>
                    <span className="font-semibold">{stats.priorityDistribution.high}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="flex items-center">
                      <div className="w-3 h-3 rounded-full bg-warning mr-2"></div>
                      Medium Priority
                    </span>
                    <span className="font-semibold">{stats.priorityDistribution.medium}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="flex items-center">
                      <div className="w-3 h-3 rounded-full bg-success mr-2"></div>
                      Low Priority
                    </span>
                    <span className="font-semibold">{stats.priorityDistribution.low}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="flex items-center">
                      <div className="w-3 h-3 rounded-full bg-muted mr-2"></div>
                      No Priority
                    </span>
                    <span className="font-semibold">{stats.priorityDistribution.none}</span>
                  </div>
                </>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No priority data available</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};