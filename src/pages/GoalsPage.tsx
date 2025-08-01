import { useState, useEffect } from "react";
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Target,
  Plus,
  Calendar,
  TrendingUp,
  Award,
  Clock,
  CheckCircle,
  Circle,
  Edit,
  Trash2,
  Star,
  Flag,
  BarChart3
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Goal {
  id: string;
  title: string;
  description?: string;
  category: string;
  priority: 'low' | 'medium' | 'high';
  target_value: number;
  current_value: number;
  unit: string;
  deadline?: string;
  is_completed: boolean;
  created_at: string;
  milestones: Milestone[];
}

interface Milestone {
  id: string;
  title: string;
  target_value: number;
  is_completed: boolean;
  completed_at?: string;
}

export const GoalsPage = () => {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);
  const [filterCategory, setFilterCategory] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [user, setUser] = useState<any>(null);
  const { toast } = useToast();

  const [newGoal, setNewGoal] = useState({
    title: "",
    description: "",
    category: "personal",
    priority: "medium",
    target_value: 0,
    current_value: 0,
    unit: "tasks",
    deadline: "",
    milestones: [] as { title: string; target_value: number }[]
  });

  const categories = [
    { value: "personal", label: "Personal", color: "bg-blue-500" },
    { value: "work", label: "Work", color: "bg-green-500" },
    { value: "health", label: "Health", color: "bg-red-500" },
    { value: "learning", label: "Learning", color: "bg-purple-500" },
    { value: "finance", label: "Finance", color: "bg-yellow-500" },
    { value: "social", label: "Social", color: "bg-pink-500" }
  ];

  useEffect(() => {
    checkUser();
    loadGoals();
  }, []);

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setUser(user);
  };

  const loadGoals = async () => {
    try {
      setLoading(true);
      
      // Simulate loading goals data
      const mockGoals: Goal[] = [
        {
          id: "1",
          title: "Complete 100 Tasks",
          description: "Complete 100 tasks to improve productivity",
          category: "work",
          priority: "high",
          target_value: 100,
          current_value: 75,
          unit: "tasks",
          deadline: "2024-12-31",
          is_completed: false,
          created_at: "2024-01-01",
          milestones: [
            { id: "1", title: "Complete 25 tasks", target_value: 25, is_completed: true, completed_at: "2024-02-15" },
            { id: "2", title: "Complete 50 tasks", target_value: 50, is_completed: true, completed_at: "2024-04-10" },
            { id: "3", title: "Complete 75 tasks", target_value: 75, is_completed: true, completed_at: "2024-06-20" },
            { id: "4", title: "Complete 100 tasks", target_value: 100, is_completed: false }
          ]
        },
        {
          id: "2",
          title: "Learn 5 New Skills",
          description: "Acquire 5 new professional skills this year",
          category: "learning",
          priority: "medium",
          target_value: 5,
          current_value: 2,
          unit: "skills",
          deadline: "2024-12-31",
          is_completed: false,
          created_at: "2024-01-15",
          milestones: [
            { id: "5", title: "Learn React", target_value: 1, is_completed: true, completed_at: "2024-03-01" },
            { id: "6", title: "Learn TypeScript", target_value: 2, is_completed: true, completed_at: "2024-05-15" },
            { id: "7", title: "Learn Node.js", target_value: 3, is_completed: false },
            { id: "8", title: "Learn Python", target_value: 4, is_completed: false },
            { id: "9", title: "Learn Docker", target_value: 5, is_completed: false }
          ]
        },
        {
          id: "3",
          title: "Exercise 150 Days",
          description: "Exercise at least 30 minutes for 150 days",
          category: "health",
          priority: "high",
          target_value: 150,
          current_value: 89,
          unit: "days",
          deadline: "2024-12-31",
          is_completed: false,
          created_at: "2024-01-01",
          milestones: [
            { id: "10", title: "Exercise 30 days", target_value: 30, is_completed: true, completed_at: "2024-02-01" },
            { id: "11", title: "Exercise 60 days", target_value: 60, is_completed: true, completed_at: "2024-03-15" },
            { id: "12", title: "Exercise 90 days", target_value: 90, is_completed: false },
            { id: "13", title: "Exercise 120 days", target_value: 120, is_completed: false },
            { id: "14", title: "Exercise 150 days", target_value: 150, is_completed: false }
          ]
        }
      ];

      setGoals(mockGoals);
    } catch (error) {
      console.error('Error loading goals:', error);
      toast({
        title: "Error",
        description: "Failed to load goals",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const createGoal = async () => {
    try {
      const goalData = {
        ...newGoal,
        id: Date.now().toString(),
        current_value: 0,
        is_completed: false,
        created_at: new Date().toISOString(),
        milestones: newGoal.milestones.map((m, index) => ({
          id: `${Date.now()}-${index}`,
          title: m.title,
          target_value: m.target_value,
          is_completed: false
        }))
      };

      setGoals(prev => [goalData as Goal, ...prev]);
      setIsCreateDialogOpen(false);
      setNewGoal({
        title: "",
        description: "",
        category: "personal",
        priority: "medium",
        target_value: 0,
        current_value: 0,
        unit: "tasks",
        deadline: "",
        milestones: []
      });

      toast({
        title: "Success",
        description: "Goal created successfully"
      });
    } catch (error) {
      console.error('Error creating goal:', error);
      toast({
        title: "Error",
        description: "Failed to create goal",
        variant: "destructive"
      });
    }
  };

  const updateGoalProgress = (goalId: string, newValue: number) => {
    setGoals(prev => prev.map(goal => {
      if (goal.id === goalId) {
        const updatedGoal = { ...goal, current_value: newValue };
        
        // Update milestone completion
        updatedGoal.milestones = goal.milestones.map(milestone => ({
          ...milestone,
          is_completed: newValue >= milestone.target_value,
          completed_at: newValue >= milestone.target_value && !milestone.is_completed 
            ? new Date().toISOString() 
            : milestone.completed_at
        }));

        // Check if goal is completed
        updatedGoal.is_completed = newValue >= goal.target_value;

        return updatedGoal;
      }
      return goal;
    }));

    toast({
      title: "Success",
      description: "Goal progress updated"
    });
  };

  const deleteGoal = (goalId: string) => {
    setGoals(prev => prev.filter(goal => goal.id !== goalId));
    toast({
      title: "Success",
      description: "Goal deleted successfully"
    });
  };

  const addMilestone = () => {
    setNewGoal(prev => ({
      ...prev,
      milestones: [...prev.milestones, { title: "", target_value: 0 }]
    }));
  };

  const removeMilestone = (index: number) => {
    setNewGoal(prev => ({
      ...prev,
      milestones: prev.milestones.filter((_, i) => i !== index)
    }));
  };

  const filteredGoals = goals.filter(goal => {
    const matchesCategory = !filterCategory || goal.category === filterCategory;
    const matchesStatus = filterStatus === "all" || 
      (filterStatus === "completed" && goal.is_completed) ||
      (filterStatus === "active" && !goal.is_completed) ||
      (filterStatus === "overdue" && !goal.is_completed && goal.deadline && new Date(goal.deadline) < new Date());
    return matchesCategory && matchesStatus;
  });

  const getGoalStats = () => {
    const total = goals.length;
    const completed = goals.filter(g => g.is_completed).length;
    const active = goals.filter(g => !g.is_completed).length;
    const overdue = goals.filter(g => !g.is_completed && g.deadline && new Date(g.deadline) < new Date()).length;
    const avgProgress = goals.length > 0 
      ? goals.reduce((sum, goal) => sum + (goal.current_value / goal.target_value) * 100, 0) / goals.length 
      : 0;
    
    return { total, completed, active, overdue, avgProgress };
  };

  const stats = getGoalStats();

  const getCategoryColor = (category: string) => {
    return categories.find(c => c.value === category)?.color || "bg-gray-500";
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header user={user} onLogout={() => supabase.auth.signOut()} />
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-muted rounded w-1/4"></div>
            <div className="grid gap-4 md:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-48 bg-muted rounded"></div>
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
              <Target className="h-8 w-8" />
              Goals & Objectives
            </h1>
            <p className="text-muted-foreground">Set, track, and achieve your personal and professional goals</p>
          </div>
          
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-primary">
                <Plus className="h-4 w-4 mr-2" />
                New Goal
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Create New Goal</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="title">Goal Title</Label>
                  <Input
                    id="title"
                    value={newGoal.title}
                    onChange={(e) => setNewGoal(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Enter goal title"
                  />
                </div>
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={newGoal.description}
                    onChange={(e) => setNewGoal(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Describe your goal"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="category">Category</Label>
                    <Select value={newGoal.category} onValueChange={(value) => setNewGoal(prev => ({ ...prev, category: value }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map(cat => (
                          <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="priority">Priority</Label>
                    <Select value={newGoal.priority} onValueChange={(value) => setNewGoal(prev => ({ ...prev, priority: value }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="target">Target Value</Label>
                    <Input
                      id="target"
                      type="number"
                      value={newGoal.target_value}
                      onChange={(e) => setNewGoal(prev => ({ ...prev, target_value: parseInt(e.target.value) || 0 }))}
                      placeholder="100"
                    />
                  </div>
                  <div>
                    <Label htmlFor="unit">Unit</Label>
                    <Select value={newGoal.unit} onValueChange={(value) => setNewGoal(prev => ({ ...prev, unit: value }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="tasks">Tasks</SelectItem>
                        <SelectItem value="hours">Hours</SelectItem>
                        <SelectItem value="days">Days</SelectItem>
                        <SelectItem value="projects">Projects</SelectItem>
                        <SelectItem value="skills">Skills</SelectItem>
                        <SelectItem value="books">Books</SelectItem>
                        <SelectItem value="workouts">Workouts</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <Label htmlFor="deadline">Deadline</Label>
                  <Input
                    id="deadline"
                    type="date"
                    value={newGoal.deadline}
                    onChange={(e) => setNewGoal(prev => ({ ...prev, deadline: e.target.value }))}
                  />
                </div>
                
                {/* Milestones */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <Label>Milestones</Label>
                    <Button type="button" variant="outline" size="sm" onClick={addMilestone}>
                      <Plus className="h-4 w-4 mr-1" />
                      Add
                    </Button>
                  </div>
                  <div className="space-y-2">
                    {newGoal.milestones.map((milestone, index) => (
                      <div key={index} className="flex gap-2">
                        <Input
                          placeholder="Milestone title"
                          value={milestone.title}
                          onChange={(e) => {
                            const updated = [...newGoal.milestones];
                            updated[index].title = e.target.value;
                            setNewGoal(prev => ({ ...prev, milestones: updated }));
                          }}
                        />
                        <Input
                          type="number"
                          placeholder="Value"
                          className="w-24"
                          value={milestone.target_value}
                          onChange={(e) => {
                            const updated = [...newGoal.milestones];
                            updated[index].target_value = parseInt(e.target.value) || 0;
                            setNewGoal(prev => ({ ...prev, milestones: updated }));
                          }}
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => removeMilestone(index)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>

                <Button onClick={createGoal} className="w-full bg-gradient-primary">
                  Create Goal
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Goal Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Goals</p>
                  <p className="text-2xl font-bold">{stats.total}</p>
                </div>
                <Target className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Completed</p>
                  <p className="text-2xl font-bold text-green-600">{stats.completed}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Active</p>
                  <p className="text-2xl font-bold text-blue-600">{stats.active}</p>
                </div>
                <Circle className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Avg Progress</p>
                  <p className="text-2xl font-bold text-purple-600">{Math.round(stats.avgProgress)}%</p>
                </div>
                <BarChart3 className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Goals</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="overdue">Overdue</SelectItem>
            </SelectContent>
          </Select>
          <Select value={filterCategory} onValueChange={setFilterCategory}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="Filter by category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Categories</SelectItem>
              {categories.map(cat => (
                <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Goals Tabs */}
        <Tabs defaultValue="grid" className="space-y-4">
          <TabsList>
            <TabsTrigger value="grid">Grid View</TabsTrigger>
            <TabsTrigger value="list">List View</TabsTrigger>
            <TabsTrigger value="timeline">Timeline</TabsTrigger>
          </TabsList>

          <TabsContent value="grid">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filteredGoals.map((goal) => (
                <Card key={goal.id} className={`transition-all hover:shadow-card ${goal.is_completed ? 'opacity-75' : ''}`}>
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <div className={`w-3 h-3 rounded-full ${getCategoryColor(goal.category)}`}></div>
                          <Badge className={`${getPriorityColor(goal.priority)} text-white text-xs`}>
                            {goal.priority}
                          </Badge>
                          {goal.is_completed && (
                            <Badge className="bg-green-500 text-white text-xs">
                              <Award className="h-3 w-3 mr-1" />
                              Completed
                            </Badge>
                          )}
                        </div>
                        <CardTitle className={`text-lg ${goal.is_completed ? 'line-through text-muted-foreground' : ''}`}>
                          {goal.title}
                        </CardTitle>
                        {goal.description && (
                          <p className="text-sm text-muted-foreground mt-1">{goal.description}</p>
                        )}
                      </div>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setEditingGoal(goal)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteGoal(goal.id)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Progress */}
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span>Progress</span>
                        <span className="font-medium">
                          {goal.current_value}/{goal.target_value} {goal.unit}
                        </span>
                      </div>
                      <Progress 
                        value={(goal.current_value / goal.target_value) * 100} 
                        className="h-2"
                      />
                      <div className="text-xs text-muted-foreground mt-1">
                        {Math.round((goal.current_value / goal.target_value) * 100)}% complete
                      </div>
                    </div>

                    {/* Deadline */}
                    {goal.deadline && (
                      <div className={`flex items-center gap-2 text-sm ${
                        !goal.is_completed && new Date(goal.deadline) < new Date() 
                          ? 'text-red-600' : 'text-muted-foreground'
                      }`}>
                        <Calendar className="h-4 w-4" />
                        Due: {new Date(goal.deadline).toLocaleDateString()}
                        {!goal.is_completed && new Date(goal.deadline) < new Date() && (
                          <Badge variant="destructive" className="ml-2">Overdue</Badge>
                        )}
                      </div>
                    )}

                    {/* Milestones */}
                    {goal.milestones.length > 0 && (
                      <div>
                        <p className="text-sm font-medium mb-2">Milestones</p>
                        <div className="space-y-1">
                          {goal.milestones.slice(0, 3).map((milestone) => (
                            <div key={milestone.id} className="flex items-center gap-2 text-xs">
                              {milestone.is_completed ? (
                                <CheckCircle className="h-3 w-3 text-green-600" />
                              ) : (
                                <Circle className="h-3 w-3 text-muted-foreground" />
                              )}
                              <span className={milestone.is_completed ? 'line-through text-muted-foreground' : ''}>
                                {milestone.title}
                              </span>
                            </div>
                          ))}
                          {goal.milestones.length > 3 && (
                            <p className="text-xs text-muted-foreground">
                              +{goal.milestones.length - 3} more milestones
                            </p>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Update Progress */}
                    {!goal.is_completed && (
                      <div className="flex gap-2">
                        <Input
                          type="number"
                          placeholder="Update progress"
                          className="flex-1"
                          max={goal.target_value}
                          min={0}
                          defaultValue={goal.current_value}
                          onBlur={(e) => {
                            const newValue = parseInt(e.target.value) || 0;
                            if (newValue !== goal.current_value) {
                              updateGoalProgress(goal.id, newValue);
                            }
                          }}
                        />
                        <Button
                          size="sm"
                          onClick={() => updateGoalProgress(goal.id, goal.target_value)}
                          className="bg-gradient-primary"
                        >
                          Complete
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="list">
            <Card>
              <CardContent className="p-0">
                <div className="divide-y">
                  {filteredGoals.map((goal) => (
                    <div key={goal.id} className="p-4 hover:bg-muted/50">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <div className={`w-3 h-3 rounded-full ${getCategoryColor(goal.category)}`}></div>
                            <h3 className={`font-medium ${goal.is_completed ? 'line-through text-muted-foreground' : ''}`}>
                              {goal.title}
                            </h3>
                            <Badge className={`${getPriorityColor(goal.priority)} text-white text-xs`}>
                              {goal.priority}
                            </Badge>
                            {goal.is_completed && (
                              <Badge className="bg-green-500 text-white text-xs">
                                <Award className="h-3 w-3 mr-1" />
                                Completed
                              </Badge>
                            )}
                          </div>
                          {goal.description && (
                            <p className="text-sm text-muted-foreground mb-2">{goal.description}</p>
                          )}
                          <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2">
                              <Progress 
                                value={(goal.current_value / goal.target_value) * 100} 
                                className="w-32 h-2"
                              />
                              <span className="text-sm font-medium">
                                {goal.current_value}/{goal.target_value} {goal.unit}
                              </span>
                            </div>
                            {goal.deadline && (
                              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                <Calendar className="h-4 w-4" />
                                {new Date(goal.deadline).toLocaleDateString()}
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setEditingGoal(goal)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => deleteGoal(goal.id)}
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="timeline">
            <div className="space-y-6">
              {filteredGoals
                .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
                .map((goal, index) => (
                  <div key={goal.id} className="relative">
                    {index !== filteredGoals.length - 1 && (
                      <div className="absolute left-4 top-8 w-0.5 h-full bg-border"></div>
                    )}
                    <div className="flex gap-4">
                      <div className={`w-8 h-8 rounded-full ${goal.is_completed ? 'bg-green-500' : 'bg-primary'} flex items-center justify-center flex-shrink-0`}>
                        {goal.is_completed ? (
                          <CheckCircle className="h-4 w-4 text-white" />
                        ) : (
                          <Target className="h-4 w-4 text-white" />
                        )}
                      </div>
                      <Card className="flex-1">
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <h3 className={`font-semibold ${goal.is_completed ? 'line-through text-muted-foreground' : ''}`}>
                                {goal.title}
                              </h3>
                              <p className="text-sm text-muted-foreground">
                                Created {new Date(goal.created_at).toLocaleDateString()}
                              </p>
                            </div>
                            <div className="flex gap-2">
                              <Badge className={`${getCategoryColor(goal.category)} text-white text-xs`}>
                                {categories.find(c => c.value === goal.category)?.label}
                              </Badge>
                              <Badge className={`${getPriorityColor(goal.priority)} text-white text-xs`}>
                                {goal.priority}
                              </Badge>
                            </div>
                          </div>
                          {goal.description && (
                            <p className="text-sm text-muted-foreground mb-3">{goal.description}</p>
                          )}
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Progress 
                                value={(goal.current_value / goal.target_value) * 100} 
                                className="w-32 h-2"
                              />
                              <span className="text-sm font-medium">
                                {Math.round((goal.current_value / goal.target_value) * 100)}%
                              </span>
                            </div>
                            {goal.deadline && (
                              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                <Calendar className="h-4 w-4" />
                                Due {new Date(goal.deadline).toLocaleDateString()}
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                ))}
            </div>
          </TabsContent>
        </Tabs>

        {filteredGoals.length === 0 && (
          <div className="text-center py-12">
            <Target className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No goals found</h3>
            <p className="text-muted-foreground">
              {filterCategory || filterStatus !== "all" ? 'Try adjusting your filters' : 'Create your first goal to get started'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};