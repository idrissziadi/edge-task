import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { taskService } from '@/lib/taskService';
import { goalService } from '@/lib/goalService';
import { categoryService } from '@/lib/categoryService';
import { calendarService } from '@/lib/calendarService';
import { notificationService } from '@/lib/notificationService';
import { useToast } from '@/hooks/use-toast';

export const DatabaseTest: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<string[]>([]);
  const { toast } = useToast();

  const addResult = (message: string) => {
    setResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  const testDatabaseConnection = async () => {
    setLoading(true);
    setResults([]);
    
    try {
      addResult('Testing database connection...');
      
      // Test 1: Vérifier l'authentification
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        addResult(`✅ User authenticated: ${user.email}`);
      } else {
        addResult('❌ No user authenticated');
        return;
      }

      // Test 2: Vérifier l'accès à la table tasks
      const { data: tasks, error: tasksError } = await supabase
        .from('tasks')
        .select('count')
        .limit(1);

      if (tasksError) {
        addResult(`❌ Tasks table error: ${tasksError.message}`);
      } else {
        addResult('✅ Tasks table accessible');
      }

      // Test 3: Vérifier l'accès à la table goals
      const { data: goals, error: goalsError } = await supabase
        .from('goals')
        .select('count')
        .limit(1);

      if (goalsError) {
        addResult(`❌ Goals table error: ${goalsError.message}`);
      } else {
        addResult('✅ Goals table accessible');
      }

      // Test 4: Vérifier l'accès à la table categories
      const { data: categories, error: categoriesError } = await supabase
        .from('categories')
        .select('count')
        .limit(1);

      if (categoriesError) {
        addResult(`❌ Categories table error: ${categoriesError.message}`);
      } else {
        addResult('✅ Categories table accessible');
      }

      // Test 5: Vérifier l'accès à la table calendar_events
      const { data: events, error: eventsError } = await supabase
        .from('calendar_events')
        .select('count')
        .limit(1);

      if (eventsError) {
        addResult(`❌ Calendar events table error: ${eventsError.message}`);
      } else {
        addResult('✅ Calendar events table accessible');
      }

      // Test 6: Vérifier l'accès à la table notifications
      const { data: notifications, error: notificationsError } = await supabase
        .from('notifications')
        .select('count')
        .limit(1);

      if (notificationsError) {
        addResult(`❌ Notifications table error: ${notificationsError.message}`);
      } else {
        addResult('✅ Notifications table accessible');
      }

      // Test 7: Créer une tâche de test
      addResult('Testing task creation...');
      const testTask = await taskService.createTask({
        title: 'Test Task',
        description: 'This is a test task',
        priority: 'medium',
        is_completed: false,
        is_recurring: false
      });

      if (testTask) {
        addResult('✅ Test task created successfully');
        
        // Supprimer la tâche de test
        const deleted = await taskService.deleteTask(testTask.id);
        if (deleted) {
          addResult('✅ Test task deleted successfully');
        } else {
          addResult('❌ Failed to delete test task');
        }
      } else {
        addResult('❌ Failed to create test task');
      }

      // Test 8: Créer un objectif de test
      addResult('Testing goal creation...');
      const testGoal = await goalService.createGoal({
        title: 'Test Goal',
        description: 'This is a test goal',
        category: 'Personal',
        target_value: 100,
        current_value: 0,
        unit: 'points',
        priority: 'medium',
        is_completed: false
      });

      if (testGoal) {
        addResult('✅ Test goal created successfully');
        
        // Supprimer l'objectif de test
        const deleted = await goalService.deleteGoal(testGoal.id);
        if (deleted) {
          addResult('✅ Test goal deleted successfully');
        } else {
          addResult('❌ Failed to delete test goal');
        }
      } else {
        addResult('❌ Failed to create test goal');
      }

      // Test 9: Créer une catégorie de test
      addResult('Testing category creation...');
      const testCategory = await categoryService.createCategory({
        name: 'Test Category',
        color: '#3B82F6',
        description: 'Test category description'
      });

      if (testCategory) {
        addResult('✅ Test category created successfully');
        
        // Supprimer la catégorie de test
        const deleted = await categoryService.deleteCategory(testCategory.id);
        if (deleted) {
          addResult('✅ Test category deleted successfully');
        } else {
          addResult('❌ Failed to delete test category');
        }
      } else {
        addResult('❌ Failed to create test category');
      }

      // Test 10: Créer un événement de test
      addResult('Testing calendar event creation...');
      const testEvent = await calendarService.createEvent({
        title: 'Test Event',
        description: 'This is a test event',
        start_time: new Date().toISOString(),
        end_time: new Date(Date.now() + 3600000).toISOString(), // 1 hour later
        all_day: false,
        color: '#3B82F6'
      });

      if (testEvent) {
        addResult('✅ Test event created successfully');
        
        // Supprimer l'événement de test
        const deleted = await calendarService.deleteEvent(testEvent.id);
        if (deleted) {
          addResult('✅ Test event deleted successfully');
        } else {
          addResult('❌ Failed to delete test event');
        }
      } else {
        addResult('❌ Failed to create test event');
      }

      // Test 11: Créer une notification de test
      addResult('Testing notification creation...');
      const testNotification = await notificationService.createNotification({
        title: 'Test Notification',
        message: 'This is a test notification',
        type: 'info',
        is_read: false
      });

      if (testNotification) {
        addResult('✅ Test notification created successfully');
        
        // Supprimer la notification de test
        const deleted = await notificationService.deleteNotification(testNotification.id);
        if (deleted) {
          addResult('✅ Test notification deleted successfully');
        } else {
          addResult('❌ Failed to delete test notification');
        }
      } else {
        addResult('❌ Failed to create test notification');
      }

    } catch (error) {
      addResult(`❌ Error: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  const clearResults = () => {
    setResults([]);
  };

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold">Database Test</h1>
        
        <Card>
          <CardHeader>
            <CardTitle>Database Connection Test</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Button 
                onClick={testDatabaseConnection} 
                disabled={loading}
              >
                {loading ? 'Testing...' : 'Run Database Test'}
              </Button>
              <Button 
                onClick={clearResults} 
                variant="outline"
              >
                Clear Results
              </Button>
            </div>
            
            <div className="bg-muted p-4 rounded-lg max-h-96 overflow-y-auto">
              {results.length === 0 ? (
                <p className="text-muted-foreground">No test results yet. Click "Run Database Test" to start.</p>
              ) : (
                results.map((result, index) => (
                  <div key={index} className="text-sm font-mono mb-1">
                    {result}
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}; 