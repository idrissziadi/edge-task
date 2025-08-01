import { useState, useEffect } from "react";
import { Header } from "@/components/layout/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Calendar,
  Clock,
  Target,
  Award,
  Activity,
  PieChart,
  LineChart,
  Download
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface AnalyticsData {
  dailyStats: any[];
  weeklyStats: any;
  monthlyStats: any;
  trends: any[];
  productivity: {
    averageCompletionTime: number;
    mostProductiveHour: number;
    mostProductiveDay: string;
    streakDays: number;
  };
  taskDistribution: {
    byPriority: { high: number; medium: number; low: number };
    byStatus: { completed: number; pending: number; overdue: number };
    byCategory: any[];
  };
}

export const AnalyticsPage = () => {
  const [user, setUser] = useState<any>(null);
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState("30");
  const [chartType, setChartType] = useState("bar");
  const { toast } = useToast();

  useEffect(() => {
    checkUser();
    loadAnalytics();
  }, [timeRange]);

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setUser(user);
  };

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      
      // Load daily stats
      const dailyResponse = await supabase.functions.invoke('productivity-service', {
        body: { action: 'daily-stats' }
      });

      // Load weekly stats
      const weeklyResponse = await supabase.functions.invoke('productivity-service', {
        body: { action: 'weekly-stats' }
      });

      // Load monthly stats
      const monthlyResponse = await supabase.functions.invoke('productivity-service', {
        body: { action: 'monthly-stats' }
      });

      // Load trends
      const trendsResponse = await supabase.functions.invoke('productivity-service', {
        body: { action: 'productivity-trends' }
      });

      // Simulate additional analytics data
      const mockAnalytics: AnalyticsData = {
        dailyStats: dailyResponse.data?.stats ? [dailyResponse.data.stats] : [],
        weeklyStats: weeklyResponse.data?.weeklyStats || {},
        monthlyStats: monthlyResponse.data?.monthlyStats || {},
        trends: trendsResponse.data?.trends || [],
        productivity: {
          averageCompletionTime: 2.5,
          mostProductiveHour: 10,
          mostProductiveDay: 'Tuesday',
          streakDays: 7
        },
        taskDistribution: {
          byPriority: { high: 15, medium: 35, low: 20 },
          byStatus: { completed: 45, pending: 20, overdue: 5 },
          byCategory: [
            { name: 'Work', count: 25, color: '#3b82f6' },
            { name: 'Personal', count: 20, color: '#10b981' },
            { name: 'Health', count: 15, color: '#f59e0b' },
            { name: 'Learning', count: 10, color: '#8b5cf6' }
          ]
        }
      };

      setAnalytics(mockAnalytics);
    } catch (error) {
      console.error('Error loading analytics:', error);
      toast({
        title: "Error",
        description: "Failed to load analytics data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const exportData = () => {
    if (!analytics) return;
    
    const data = JSON.stringify(analytics, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `analytics-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast({
      title: "Success",
      description: "Analytics data exported successfully"
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header user={user} onLogout={() => supabase.auth.signOut()} />
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-muted rounded w-1/4"></div>
            <div className="grid gap-4 md:grid-cols-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-32 bg-muted rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header user={user} onLogout={() => supabase.auth.signOut()} />
      
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
              <BarChart3 className="h-8 w-8" />
              Analytics Dashboard
            </h1>
            <p className="text-muted-foreground">Track your productivity and task completion patterns</p>
          </div>
          
          <div className="flex gap-2">
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7">Last 7 days</SelectItem>
                <SelectItem value="30">Last 30 days</SelectItem>
                <SelectItem value="90">Last 90 days</SelectItem>
                <SelectItem value="365">Last year</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={exportData} variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-600">Completion Rate</p>
                  <p className="text-3xl font-bold text-blue-700">
                    {analytics?.dailyStats[0]?.completionRate || 0}%
                  </p>
                  <div className="flex items-center mt-2">
                    <TrendingUp className="h-4 w-4 text-green-600 mr-1" />
                    <span className="text-sm text-green-600">+12% from last week</span>
                  </div>
                </div>
                <Target className="h-12 w-12 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-600">Current Streak</p>
                  <p className="text-3xl font-bold text-green-700">
                    {analytics?.productivity.streakDays || 0} days
                  </p>
                  <div className="flex items-center mt-2">
                    <Award className="h-4 w-4 text-green-600 mr-1" />
                    <span className="text-sm text-green-600">Personal best!</span>
                  </div>
                </div>
                <Activity className="h-12 w-12 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-purple-600">Avg. Completion Time</p>
                  <p className="text-3xl font-bold text-purple-700">
                    {analytics?.productivity.averageCompletionTime || 0}h
                  </p>
                  <div className="flex items-center mt-2">
                    <TrendingDown className="h-4 w-4 text-green-600 mr-1" />
                    <span className="text-sm text-green-600">-0.5h improvement</span>
                  </div>
                </div>
                <Clock className="h-12 w-12 text-purple-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-orange-600">Most Productive</p>
                  <p className="text-2xl font-bold text-orange-700">
                    {analytics?.productivity.mostProductiveDay || 'Tuesday'}
                  </p>
                  <p className="text-lg font-semibold text-orange-700">
                    {analytics?.productivity.mostProductiveHour || 10}:00 AM
                  </p>
                </div>
                <Calendar className="h-12 w-12 text-orange-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Analytics Tabs */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="trends">Trends</TabsTrigger>
            <TabsTrigger value="distribution">Distribution</TabsTrigger>
            <TabsTrigger value="insights">Insights</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Weekly Progress */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    Weekly Progress
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {analytics?.weeklyStats?.dailyStats?.map((day: any, index: number) => (
                      <div key={index} className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="font-medium">{day.dayName}</span>
                          <span className="text-muted-foreground">
                            {day.completed}/{day.created} tasks
                          </span>
                        </div>
                        <Progress 
                          value={day.created > 0 ? (day.completed / day.created) * 100 : 0} 
                          className="h-2"
                        />
                      </div>
                    )) || (
                      <div className="text-center py-8 text-muted-foreground">
                        <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p>No weekly data available</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Task Status Overview */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <PieChart className="h-5 w-5" />
                    Task Status Overview
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-green-500"></div>
                        <span className="text-sm">Completed</span>
                      </div>
                      <div className="text-right">
                        <span className="font-semibold">{analytics?.taskDistribution.byStatus.completed || 0}</span>
                        <Progress 
                          value={analytics?.taskDistribution.byStatus.completed || 0} 
                          className="w-20 h-2 mt-1"
                        />
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                        <span className="text-sm">Pending</span>
                      </div>
                      <div className="text-right">
                        <span className="font-semibold">{analytics?.taskDistribution.byStatus.pending || 0}</span>
                        <Progress 
                          value={analytics?.taskDistribution.byStatus.pending || 0} 
                          className="w-20 h-2 mt-1"
                        />
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-red-500"></div>
                        <span className="text-sm">Overdue</span>
                      </div>
                      <div className="text-right">
                        <span className="font-semibold">{analytics?.taskDistribution.byStatus.overdue || 0}</span>
                        <Progress 
                          value={analytics?.taskDistribution.byStatus.overdue || 0} 
                          className="w-20 h-2 mt-1"
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Monthly Overview */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Monthly Overview
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <p className="text-3xl font-bold text-primary">
                      {analytics?.monthlyStats?.totalCompleted || 0}
                    </p>
                    <p className="text-sm text-muted-foreground">Tasks Completed</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold text-green-600">
                      {Math.round(analytics?.monthlyStats?.completionRate || 0)}%
                    </p>
                    <p className="text-sm text-muted-foreground">Completion Rate</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold text-orange-600">
                      {analytics?.monthlyStats?.totalCreated || 0}
                    </p>
                    <p className="text-sm text-muted-foreground">Tasks Created</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="trends" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <LineChart className="h-5 w-5" />
                  Productivity Trends (Last 30 Days)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analytics?.trends?.slice(0, 10).map((trend: any, index: number) => (
                    <div key={index} className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">
                        {new Date(trend.date).toLocaleDateString()}
                      </span>
                      <div className="flex items-center gap-2">
                        <Progress value={trend.completed * 10} className="w-20 h-2" />
                        <span className="text-sm font-medium w-8">{trend.completed}</span>
                      </div>
                    </div>
                  )) || (
                    <div className="text-center py-8 text-muted-foreground">
                      <LineChart className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>No trend data available</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="distribution" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Priority Distribution */}
              <Card>
                <CardHeader>
                  <CardTitle>Priority Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Badge className="bg-red-500 text-white">High</Badge>
                      </div>
                      <div className="flex items-center gap-2">
                        <Progress 
                          value={(analytics?.taskDistribution.byPriority.high || 0) * 2} 
                          className="w-24 h-2"
                        />
                        <span className="text-sm font-medium w-8">
                          {analytics?.taskDistribution.byPriority.high || 0}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Badge className="bg-yellow-500 text-white">Medium</Badge>
                      </div>
                      <div className="flex items-center gap-2">
                        <Progress 
                          value={(analytics?.taskDistribution.byPriority.medium || 0) * 2} 
                          className="w-24 h-2"
                        />
                        <span className="text-sm font-medium w-8">
                          {analytics?.taskDistribution.byPriority.medium || 0}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Badge className="bg-green-500 text-white">Low</Badge>
                      </div>
                      <div className="flex items-center gap-2">
                        <Progress 
                          value={(analytics?.taskDistribution.byPriority.low || 0) * 2} 
                          className="w-24 h-2"
                        />
                        <span className="text-sm font-medium w-8">
                          {analytics?.taskDistribution.byPriority.low || 0}
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Category Distribution */}
              <Card>
                <CardHeader>
                  <CardTitle>Category Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {analytics?.taskDistribution.byCategory.map((category: any, index: number) => (
                      <div key={index} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div 
                            className="w-3 h-3 rounded-full" 
                            style={{ backgroundColor: category.color }}
                          ></div>
                          <span className="text-sm font-medium">{category.name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Progress 
                            value={category.count * 2} 
                            className="w-24 h-2"
                          />
                          <span className="text-sm font-medium w-8">{category.count}</span>
                        </div>
                      </div>
                    )) || (
                      <div className="text-center py-8 text-muted-foreground">
                        <PieChart className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p>No category data available</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="insights" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Performance Insights */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Performance Insights
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                    <div className="flex items-center gap-2 mb-2">
                      <Award className="h-5 w-5 text-green-600" />
                      <span className="font-medium text-green-800">Great Progress!</span>
                    </div>
                    <p className="text-sm text-green-700">
                      You've completed 85% more tasks this week compared to last week.
                    </p>
                  </div>
                  
                  <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="flex items-center gap-2 mb-2">
                      <Clock className="h-5 w-5 text-blue-600" />
                      <span className="font-medium text-blue-800">Peak Performance</span>
                    </div>
                    <p className="text-sm text-blue-700">
                      Your most productive time is {analytics?.productivity.mostProductiveHour}:00 AM on {analytics?.productivity.mostProductiveDay}s.
                    </p>
                  </div>
                  
                  <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                    <div className="flex items-center gap-2 mb-2">
                      <Target className="h-5 w-5 text-purple-600" />
                      <span className="font-medium text-purple-800">Streak Achievement</span>
                    </div>
                    <p className="text-sm text-purple-700">
                      You're on a {analytics?.productivity.streakDays}-day completion streak! Keep it up!
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Recommendations */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5" />
                    Recommendations
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                    <div className="flex items-center gap-2 mb-2">
                      <Calendar className="h-5 w-5 text-yellow-600" />
                      <span className="font-medium text-yellow-800">Schedule Optimization</span>
                    </div>
                    <p className="text-sm text-yellow-700">
                      Consider scheduling important tasks during your peak hours (10:00 AM - 12:00 PM).
                    </p>
                  </div>
                  
                  <div className="p-4 bg-orange-50 rounded-lg border border-orange-200">
                    <div className="flex items-center gap-2 mb-2">
                      <TrendingUp className="h-5 w-5 text-orange-600" />
                      <span className="font-medium text-orange-800">Priority Focus</span>
                    </div>
                    <p className="text-sm text-orange-700">
                      You have many medium-priority tasks. Consider promoting some to high priority for better focus.
                    </p>
                  </div>
                  
                  <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                    <div className="flex items-center gap-2 mb-2">
                      <Clock className="h-5 w-5 text-red-600" />
                      <span className="font-medium text-red-800">Overdue Alert</span>
                    </div>
                    <p className="text-sm text-red-700">
                      You have {analytics?.taskDistribution.byStatus.overdue || 0} overdue tasks. Consider reviewing your deadlines.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};