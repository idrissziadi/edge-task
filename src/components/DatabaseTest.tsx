import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { taskService } from '@/lib/taskService';
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

      // Test 4: Créer une tâche de test
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