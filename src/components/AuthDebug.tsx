import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const AuthDebug: React.FC = () => {
  const [user, setUser] = useState<any>(null);
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [logs, setLogs] = useState<string[]>([]);

  const addLog = (message: string) => {
    setLogs(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  useEffect(() => {
    checkAuth();
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        addLog(`Auth state change: ${event}`);
        addLog(`Session: ${session ? 'exists' : 'null'}`);
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const checkAuth = async () => {
    try {
      addLog("Checking authentication...");
      
      const { data: { session }, error } = await supabase.auth.getSession();
      addLog(`Session check: ${session ? 'exists' : 'null'}`);
      if (error) addLog(`Session error: ${error.message}`);
      
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      addLog(`User check: ${user ? user.email : 'null'}`);
      if (userError) addLog(`User error: ${userError.message}`);
      
      setSession(session);
      setUser(user);
    } catch (error) {
      addLog(`Error: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  const signInTest = async () => {
    try {
      addLog("Attempting test sign in...");
      const { data, error } = await supabase.auth.signInWithPassword({
        email: "test@example.com",
        password: "password123"
      });
      
      if (error) {
        addLog(`Sign in error: ${error.message}`);
      } else {
        addLog("Sign in successful");
      }
    } catch (error) {
      addLog(`Sign in exception: ${error}`);
    }
  };

  const signOut = async () => {
    try {
      addLog("Signing out...");
      await supabase.auth.signOut();
      addLog("Sign out successful");
    } catch (error) {
      addLog(`Sign out error: ${error}`);
    }
  };

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold">Auth Debug</h1>
        
        <Card>
          <CardHeader>
            <CardTitle>Authentication Status</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="font-semibold">Loading:</p>
                <p className="text-muted-foreground">{loading ? "Yes" : "No"}</p>
              </div>
              <div>
                <p className="font-semibold">User:</p>
                <p className="text-muted-foreground">{user ? user.email : "None"}</p>
              </div>
              <div>
                <p className="font-semibold">Session:</p>
                <p className="text-muted-foreground">{session ? "Active" : "None"}</p>
              </div>
              <div>
                <p className="font-semibold">User ID:</p>
                <p className="text-muted-foreground">{user?.id || "None"}</p>
              </div>
            </div>
            
            <div className="flex gap-2">
              <Button onClick={checkAuth}>Refresh Auth</Button>
              <Button onClick={signInTest} variant="outline">Test Sign In</Button>
              <Button onClick={signOut} variant="destructive">Sign Out</Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Debug Logs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-muted p-4 rounded-lg max-h-96 overflow-y-auto">
              {logs.map((log, index) => (
                <div key={index} className="text-sm font-mono">
                  {log}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>User Details</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-sm">
              {JSON.stringify(user, null, 2)}
            </pre>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}; 