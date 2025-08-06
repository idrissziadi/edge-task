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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { Plus, Search, Filter, CheckSquare, Calendar, AlertCircle, Trash2, Edit, Clock, Star, Archive, RotateCcw } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { formatUserForHeader } from "@/lib/utils";
import { taskService, Task } from "@/lib/taskService";
import { categoryService, Category } from "@/lib/categoryService";
import { PageWrapper } from "@/components/PageWrapper";



export const TasksPage = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterPriority, setFilterPriority] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterCategory, setFilterCategory] = useState("all");
  const [sortBy, setSortBy] = useState("created_at");
  const [sortOrder, setSortOrder] = useState("desc");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [selectedTasks, setSelectedTasks] = useState<string[]>([]);
  const [user, setUser] = useState<any>(null);
  const { toast } = useToast();

  const [newTask, setNewTask] = useState({
    title: "",
    description: "",
    priority: "medium",
    deadline: "",
    category_id: "",
    is_recurring: false,
    recurrence_rule: ""
  });

  useEffect(() => {
    checkUser();
    fetchTasks();
    fetchCategories();
  }, []);

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setUser(user);
  };

  const fetchTasks = async () => {
    try {
      const tasks = await taskService.getTasks();
      setTasks(tasks);
    } catch (error) {
      console.error('Error fetching tasks:', error);
      toast({
        title: "Error",
        description: "Failed to fetch tasks",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const categories = await categoryService.getCategories();
      setCategories(categories);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const createTask = async () => {
    try {
      const task = await taskService.createTask({
        title: newTask.title,
        description: newTask.description,
        priority: newTask.priority as 'low' | 'medium' | 'high',
        deadline: newTask.deadline || undefined,
        category_id: newTask.category_id || undefined,
        is_completed: false,
        is_recurring: newTask.is_recurring,
        recurrence_rule: newTask.recurrence_rule
      });

      if (task) {
        setTasks(prev => [task, ...prev]);
        setIsCreateDialogOpen(false);
        setNewTask({
          title: "",
          description: "",
          priority: "medium",
          deadline: "",
          category_id: "",
          is_recurring: false,
          recurrence_rule: ""
        });
        
        toast({
          title: "Success",
          description: "Task created successfully",
        });
      }
    } catch (error) {
      console.error('Error creating task:', error);
      toast({
        title: "Error",
        description: "Failed to create task",
        variant: "destructive"
      });
    }
  };

  const updateTask = async (taskId: string, updates: Partial<Task>) => {
    try {
      const updatedTask = await taskService.updateTask(taskId, updates);
      
      if (updatedTask) {
        setTasks(prev => prev.map(task => 
          task.id === taskId ? updatedTask : task
        ));
        
        toast({
          title: "Success",
          description: "Task updated successfully",
        });
      }
    } catch (error) {
      console.error('Error updating task:', error);
      toast({
        title: "Error",
        description: "Failed to update task",
        variant: "destructive"
      });
    }
  };
  const toggleComplete = async (taskId: string) => {
    try {
      const success = await taskService.toggleTaskCompletion(taskId);
      
      if (success) {
        setTasks(prev => prev.map(task => 
          task.id === taskId ? { ...task, is_completed: !task.is_completed } : task
        ));
        
        toast({
          title: "Success",
          description: "Task updated successfully",
        });
      }
    } catch (error) {
      console.error('Error toggling task:', error);
      toast({
        title: "Error",
        description: "Failed to update task",
        variant: "destructive"
      });
    }
  };

  const deleteTask = async (taskId: string) => {
    try {
      const success = await taskService.deleteTask(taskId);
      
      if (success) {
        setTasks(prev => prev.filter(task => task.id !== taskId));
        
        toast({
          title: "Success",
          description: "Task deleted successfully",
        });
      }
    } catch (error) {
      console.error('Error deleting task:', error);
      toast({
        title: "Error",
        description: "Failed to delete task",
        variant: "destructive"
      });
    }
  };

  const bulkAction = async (action: string) => {
    if (selectedTasks.length === 0) return;

    try {
      for (const taskId of selectedTasks) {
        if (action === 'complete') {
          await updateTask(taskId, { is_completed: true });
        } else if (action === 'delete') {
          await deleteTask(taskId);
        }
      }
      setSelectedTasks([]);
      toast({
        title: "Success",
        description: `${action === 'complete' ? 'Completed' : 'Deleted'} ${selectedTasks.length} tasks`
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to perform bulk action",
        variant: "destructive"
      });
    }
  };
  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPriority = filterPriority === "all" || task.priority === filterPriority;
    const matchesCategory = filterCategory === "all" || task.category_id === filterCategory;
    const matchesStatus = filterStatus === "all" || 
      (filterStatus === "completed" && task.is_completed) ||
      (filterStatus === "pending" && !task.is_completed) ||
      (filterStatus === "overdue" && !task.is_completed && task.deadline && new Date(task.deadline) < new Date());
    return matchesSearch && matchesPriority && matchesCategory && matchesStatus;
  });

  const sortedTasks = [...filteredTasks].sort((a, b) => {
    if (sortBy === 'deadline') {
      const aTime = a.deadline ? new Date(a.deadline).getTime() : Number.MAX_SAFE_INTEGER;
      const bTime = b.deadline ? new Date(b.deadline).getTime() : Number.MAX_SAFE_INTEGER;
      
      if (sortOrder === 'asc') {
        return aTime - bTime;
      } else {
        return bTime - aTime;
      }
    }
    
    const aValue = a[sortBy as keyof Task] as string;
    const bValue = b[sortBy as keyof Task] as string;
    
    if (sortOrder === 'asc') {
      return aValue?.localeCompare(bValue) || 0;
    } else {
      return bValue?.localeCompare(aValue) || 0;
    }
  });
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const getTaskStats = () => {
    const total = tasks.length;
    const completed = tasks.filter(t => t.is_completed).length;
    const pending = total - completed;
    const overdue = tasks.filter(t => !t.is_completed && t.deadline && new Date(t.deadline) < new Date()).length;
    const completionRate = total > 0 ? (completed / total) * 100 : 0;
    
    return { total, completed, pending, overdue, completionRate };
  };

  const stats = getTaskStats();
  return (
    <PageWrapper className="min-h-screen bg-background" animationType="fadeInLeft">
              <Header 
          user={formatUserForHeader(user)} 
          onLogout={() => supabase.auth.signOut()}
          onNotificationsClick={() => toast({ title: "Notifications", description: "No new notifications" })}
          onSettingsClick={() => toast({ title: "Settings", description: "Settings panel coming soon" })}
        />
      
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">My Tasks</h1>
            <p className="text-muted-foreground">Manage and track your tasks</p>
          </div>
          
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-primary">
                <Plus className="h-4 w-4 mr-2" />
                New Task
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Create New Task</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    value={newTask.title}
                    onChange={(e) => setNewTask(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Enter task title"
                  />
                </div>
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={newTask.description}
                    onChange={(e) => setNewTask(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Enter task description"
                  />
                </div>
                  <div>
                    <Label htmlFor="priority">Priority</Label>
                    <Select value={newTask.priority} onValueChange={(value) => setNewTask(prev => ({ ...prev, priority: value }))}>
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
                  <div>
                    <Label htmlFor="category">Category</Label>
                    <Select value={newTask.category_id} onValueChange={(value) => setNewTask(prev => ({ ...prev, category_id: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map(category => (
                          <SelectItem key={category.id} value={category.id}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                <div>
                  <Label htmlFor="deadline">Deadline</Label>
                  <Input
                    id="deadline"
                    type="datetime-local"
                    value={newTask.deadline}
                    onChange={(e) => setNewTask(prev => ({ ...prev, deadline: e.target.value }))}
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="recurring"
                    checked={newTask.is_recurring}
                    onCheckedChange={(checked) => setNewTask(prev => ({ ...prev, is_recurring: !!checked }))}
                  />
                  <Label htmlFor="recurring">Recurring Task</Label>
                </div>
                {newTask.is_recurring && (
                  <div>
                    <Label htmlFor="recurrence">Recurrence Rule</Label>
                    <Select value={newTask.recurrence_rule} onValueChange={(value) => setNewTask(prev => ({ ...prev, recurrence_rule: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select recurrence" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="DAILY">Daily</SelectItem>
                        <SelectItem value="WEEKLY">Weekly</SelectItem>
                        <SelectItem value="MONTHLY">Monthly</SelectItem>
                        <SelectItem value="YEARLY">Yearly</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
                <Button onClick={createTask} className="w-full bg-gradient-primary">
                  Create Task
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Task Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Tasks</p>
                  <p className="text-2xl font-bold">{stats.total}</p>
                </div>
                <CheckSquare className="h-8 w-8 text-primary" />
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
                <CheckSquare className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Pending</p>
                  <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
                </div>
                <Clock className="h-8 w-8 text-yellow-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Overdue</p>
                  <p className="text-2xl font-bold text-red-600">{stats.overdue}</p>
                </div>
                <AlertCircle className="h-8 w-8 text-red-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Progress Bar */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Overall Progress</span>
              <span className="text-sm text-muted-foreground">{Math.round(stats.completionRate)}%</span>
            </div>
            <Progress value={stats.completionRate} className="h-2" />
          </CardContent>
        </Card>
        {/* Filters */}
        <div className="flex flex-col lg:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search tasks..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-full lg:w-48">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Tasks</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="overdue">Overdue</SelectItem>
            </SelectContent>
          </Select>
          <Select value={filterPriority} onValueChange={setFilterPriority}>
            <SelectTrigger className="w-full lg:w-48">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Filter by priority" />
            </SelectTrigger>
            <SelectContent>
                              <SelectItem value="all">All Priorities</SelectItem>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="low">Low</SelectItem>
            </SelectContent>
          </Select>
          <Select value={filterCategory} onValueChange={setFilterCategory}>
            <SelectTrigger className="w-full lg:w-48">
              <SelectValue placeholder="Filter by category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map(category => (
                <SelectItem key={category.id} value={category.id}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={`${sortBy}-${sortOrder}`} onValueChange={(value) => {
            const [field, order] = value.split('-');
            setSortBy(field);
            setSortOrder(order);
          }}>
            <SelectTrigger className="w-full lg:w-48">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="created_at-desc">Newest First</SelectItem>
              <SelectItem value="created_at-asc">Oldest First</SelectItem>
              <SelectItem value="deadline-asc">Deadline (Soon)</SelectItem>
              <SelectItem value="deadline-desc">Deadline (Later)</SelectItem>
              <SelectItem value="priority-desc">Priority (High)</SelectItem>
              <SelectItem value="title-asc">Title (A-Z)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Bulk Actions */}
        {selectedTasks.length > 0 && (
          <Card className="mb-6">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">
                  {selectedTasks.length} task(s) selected
                </span>
                <div className="flex gap-2">
                  <Button size="sm" onClick={() => bulkAction('complete')}>
                    <CheckSquare className="h-4 w-4 mr-2" />
                    Complete
                  </Button>
                  <Button size="sm" variant="destructive" onClick={() => bulkAction('delete')}>
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => setSelectedTasks([])}>
                    Cancel
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Task Tabs */}
        <Tabs defaultValue="grid" className="space-y-4">
          <TabsList>
            <TabsTrigger value="grid">Grid View</TabsTrigger>
            <TabsTrigger value="list">List View</TabsTrigger>
            <TabsTrigger value="kanban">Kanban Board</TabsTrigger>
          </TabsList>

          <TabsContent value="grid">
        {/* Tasks Grid */}
        {loading ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader>
                  <div className="h-4 bg-muted rounded w-3/4"></div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="h-3 bg-muted rounded"></div>
                    <div className="h-3 bg-muted rounded w-5/6"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {sortedTasks.map((task) => (
              <Card key={task.id} className={`transition-all hover:shadow-card ${task.is_completed ? 'opacity-60' : ''}`}>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <Checkbox
                        checked={selectedTasks.includes(task.id)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setSelectedTasks(prev => [...prev, task.id]);
                          } else {
                            setSelectedTasks(prev => prev.filter(id => id !== task.id));
                          }
                        }}
                      />
                    <CardTitle className={`text-lg ${task.is_completed ? 'line-through' : ''}`}>
                      {task.title}
                    </CardTitle>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={`${getPriorityColor(task.priority)} text-white`}>
                        {task.priority}
                      </Badge>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setEditingTask(task)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteTask(task.id)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {task.description && (
                    <p className="text-sm text-muted-foreground">{task.description}</p>
                  )}
                  
                  {task.deadline && (
                    <div className={`flex items-center gap-2 text-sm ${
                      !task.is_completed && new Date(task.deadline) < new Date() 
                        ? 'text-red-600' : 'text-muted-foreground'
                    }`}>
                      <Calendar className="h-4 w-4" />
                      {new Date(task.deadline).toLocaleString()}
                      {!task.is_completed && new Date(task.deadline) < new Date() && (
                        <Badge variant="destructive" className="ml-2">Overdue</Badge>
                      )}
                    </div>
                  )}
                  
                  <div className="flex items-center justify-between">
                    <Button
                      variant={task.is_completed ? "secondary" : "default"}
                      size="sm"
                      onClick={() => toggleComplete(task.id)}
                      className={task.is_completed ? "" : "bg-gradient-primary"}
                    >
                      <CheckSquare className="h-4 w-4 mr-2" />
                      {task.is_completed ? 'Completed' : 'Mark Complete'}
                    </Button>
                    
                    {task.is_recurring && (
                      <Badge variant="outline">
                        <RotateCcw className="h-3 w-3 mr-1" />
                        Recurring
                      </Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
          </TabsContent>

          <TabsContent value="list">
            {/* List View */}
            <Card>
              <CardContent className="p-0">
                <div className="divide-y">
                  {sortedTasks.map((task) => (
                    <div key={task.id} className="flex items-center justify-between p-4 hover:bg-muted/50">
                      <div className="flex items-center gap-4 flex-1">
                        <Checkbox
                          checked={selectedTasks.includes(task.id)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setSelectedTasks(prev => [...prev, task.id]);
                            } else {
                              setSelectedTasks(prev => prev.filter(id => id !== task.id));
                            }
                          }}
                        />
                        <div className="flex-1">
                          <h3 className={`font-medium ${task.is_completed ? 'line-through text-muted-foreground' : ''}`}>
                            {task.title}
                          </h3>
                          {task.description && (
                            <p className="text-sm text-muted-foreground mt-1">{task.description}</p>
                          )}
                          <div className="flex items-center gap-4 mt-2">
                            <Badge className={`${getPriorityColor(task.priority)} text-white text-xs`}>
                              {task.priority}
                            </Badge>
                            {task.deadline && (
                              <span className={`text-xs ${
                                !task.is_completed && new Date(task.deadline) < new Date() 
                                  ? 'text-red-600' : 'text-muted-foreground'
                              }`}>
                                Due: {new Date(task.deadline).toLocaleDateString()}
                              </span>
                            )}
                            {task.is_recurring && (
                              <Badge variant="outline" className="text-xs">
                                <RotateCcw className="h-3 w-3 mr-1" />
                                Recurring
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleComplete(task.id)}
                        >
                          <CheckSquare className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setEditingTask(task)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteTask(task.id)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="kanban">
            {/* Kanban Board */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {['pending', 'in-progress', 'completed'].map((status) => (
                <Card key={status}>
                  <CardHeader>
                    <CardTitle className="capitalize">{status.replace('-', ' ')}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {sortedTasks
                      .filter(task => {
                        if (status === 'completed') return task.is_completed;
                        if (status === 'pending') return !task.is_completed && (!task.deadline || new Date(task.deadline) >= new Date());
                        if (status === 'in-progress') return !task.is_completed && task.deadline && new Date(task.deadline) < new Date();
                        return false;
                      })
                      .map((task) => (
                        <Card key={task.id} className="p-3 cursor-pointer hover:shadow-md transition-shadow">
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <h4 className="font-medium text-sm">{task.title}</h4>
                              <Badge className={`${getPriorityColor(task.priority)} text-white text-xs`}>
                                {task.priority}
                              </Badge>
                            </div>
                            {task.description && (
                              <p className="text-xs text-muted-foreground">{task.description}</p>
                            )}
                            {task.deadline && (
                              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                <Calendar className="h-3 w-3" />
                                {new Date(task.deadline).toLocaleDateString()}
                              </div>
                            )}
                            <div className="flex items-center justify-between">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => toggleComplete(task.id)}
                                className="h-6 px-2 text-xs"
                              >
                                <CheckSquare className="h-3 w-3 mr-1" />
                                {task.is_completed ? 'Undo' : 'Complete'}
                              </Button>
                              <div className="flex gap-1">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => setEditingTask(task)}
                                  className="h-6 w-6 p-0"
                                >
                                  <Edit className="h-3 w-3" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => deleteTask(task.id)}
                                  className="h-6 w-6 p-0 text-destructive hover:text-destructive"
                                >
                                  <Trash2 className="h-3 w-3" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        </Card>
                      ))}
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>

        {!loading && sortedTasks.length === 0 && (
          <div className="text-center py-12">
            <CheckSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No tasks found</h3>
            <p className="text-muted-foreground">
              {searchTerm || filterPriority ? 'Try adjusting your filters' : 'Create your first task to get started'}
            </p>
          </div>
        )}

        {/* Edit Task Dialog */}
        <Dialog open={!!editingTask} onOpenChange={() => setEditingTask(null)}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Edit Task</DialogTitle>
            </DialogHeader>
            {editingTask && (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="edit-title">Title</Label>
                  <Input
                    id="edit-title"
                    value={editingTask.title}
                    onChange={(e) => setEditingTask(prev => prev ? { ...prev, title: e.target.value } : null)}
                    placeholder="Enter task title"
                  />
                </div>
                <div>
                  <Label htmlFor="edit-description">Description</Label>
                  <Textarea
                    id="edit-description"
                    value={editingTask.description || ''}
                    onChange={(e) => setEditingTask(prev => prev ? { ...prev, description: e.target.value } : null)}
                    placeholder="Enter task description"
                  />
                </div>
                <div>
                  <Label htmlFor="edit-priority">Priority</Label>
                  <Select 
                    value={editingTask.priority} 
                    onValueChange={(value) => setEditingTask(prev => prev ? { ...prev, priority: value as any } : null)}
                  >
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
                <div>
                  <Label htmlFor="edit-deadline">Deadline</Label>
                  <Input
                    id="edit-deadline"
                    type="datetime-local"
                    value={editingTask.deadline ? new Date(editingTask.deadline).toISOString().slice(0, 16) : ''}
                    onChange={(e) => setEditingTask(prev => prev ? { ...prev, deadline: e.target.value } : null)}
                  />
                </div>
                <div className="flex gap-2">
                  <Button 
                    onClick={() => {
                      updateTask(editingTask.id, {
                        title: editingTask.title,
                        description: editingTask.description,
                        priority: editingTask.priority,
                        deadline: editingTask.deadline
                      });
                      setEditingTask(null);
                    }} 
                    className="flex-1 bg-gradient-primary"
                  >
                    Update Task
                  </Button>
                  <Button variant="outline" onClick={() => setEditingTask(null)}>
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </PageWrapper>
  );
};