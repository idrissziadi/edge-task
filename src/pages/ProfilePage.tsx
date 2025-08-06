import React, { useState, useEffect } from 'react';
import { Header } from '@/components/layout/Header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { formatUserForHeader } from '@/lib/utils';
import { User, Mail, Calendar, MapPin, Save, Camera, Award, Activity } from 'lucide-react';
import { PageWrapper } from "@/components/PageWrapper";

interface UserProfile {
  id: string;
  full_name: string;
  email: string;
  avatar_url?: string;
  timezone: string;
  created_at: string;
}

export const ProfilePage = () => {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [stats, setStats] = useState({
    totalTasks: 0,
    completedTasks: 0,
    totalGoals: 0,
    completedGoals: 0,
    joinDate: '',
    streak: 0
  });
  const { toast } = useToast();

  useEffect(() => {
    checkUser();
    loadProfile();
    loadStats();
  }, []);

  const checkUser = async () => {
    try {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error) throw error;
      setUser(user);
    } catch (error) {
      console.error('Error checking user:', error);
    }
  };

  const loadProfile = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('auth_user_id', user.id)
        .single();

      if (error) {
        console.error('Error loading profile:', error);
      } else if (data) {
        setProfile(data);
      }
    } catch (error) {
      console.error('Error loading profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Get user's internal ID
      const { data: userRecord } = await supabase
        .from('users')
        .select('id')
        .eq('auth_user_id', user.id)
        .single();

      if (userRecord) {
        // Get task stats
        const { data: tasks } = await supabase
          .from('tasks')
          .select('is_completed')
          .eq('user_id', userRecord.id);

        // Get goal stats
        const { data: goals } = await supabase
          .from('goals')
          .select('is_completed')
          .eq('user_id', userRecord.id);

        const taskStats = tasks || [];
        const goalStats = goals || [];

        setStats({
          totalTasks: taskStats.length,
          completedTasks: taskStats.filter(t => t.is_completed).length,
          totalGoals: goalStats.length,
          completedGoals: goalStats.filter(g => g.is_completed).length,
          joinDate: new Date(user.created_at).toLocaleDateString(),
          streak: 5 // Mock streak for now
        });
      }
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const saveProfile = async () => {
    try {
      setSaving(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user || !profile) return;

      const { error } = await supabase
        .from('users')
        .update({
          full_name: profile.full_name,
          timezone: profile.timezone,
        })
        .eq('auth_user_id', user.id);

      if (error) throw error;

      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully.",
      });
    } catch (error) {
      console.error('Error saving profile:', error);
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
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

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header 
          user={formatUserForHeader(user)} 
          onLogout={handleLogout}
        />
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading Profile...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-background">
        <Header 
          user={formatUserForHeader(user)} 
          onLogout={handleLogout}
        />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <p className="text-muted-foreground">Profile not found.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <PageWrapper className="min-h-screen bg-background" animationType="fadeInScale" dir={document.documentElement.dir}>
      <Header 
        user={formatUserForHeader(user)} 
        onLogout={handleLogout}
      />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center space-x-3 mb-2">
              <User className="h-8 w-8 text-primary" />
              <h1 className="text-3xl font-bold">Profile</h1>
            </div>
            <p className="text-muted-foreground">
              Manage your personal information and view your progress.
            </p>
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            {/* Profile Information */}
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Personal Information</CardTitle>
                  <CardDescription>
                    Update your personal details and preferences.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Avatar Section */}
                  <div className="flex items-center space-x-4">
                    <Avatar className="h-20 w-20">
                      <AvatarImage src={profile.avatar_url} />
                      <AvatarFallback className="text-lg">
                        {profile.full_name?.charAt(0)?.toUpperCase() || profile.email?.charAt(0)?.toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <Button variant="outline" size="sm">
                        <Camera className="mr-2 h-4 w-4" />
                        Change Photo
                      </Button>
                      <p className="text-sm text-muted-foreground mt-1">
                        JPG, GIF or PNG. 1MB max.
                      </p>
                    </div>
                  </div>

                  {/* Form Fields */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="fullName">Full Name</Label>
                      <Input
                        id="fullName"
                        value={profile.full_name || ''}
                        onChange={(e) => 
                          setProfile(prev => prev ? { ...prev, full_name: e.target.value } : null)
                        }
                        placeholder="Enter your full name"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        value={profile.email}
                        disabled
                        className="bg-muted"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="timezone">Timezone</Label>
                      <Input
                        id="timezone"
                        value={profile.timezone}
                        onChange={(e) => 
                          setProfile(prev => prev ? { ...prev, timezone: e.target.value } : null)
                        }
                        placeholder="e.g., UTC, America/New_York"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Member Since</Label>
                      <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        <span>{stats.joinDate}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <Button 
                      onClick={saveProfile} 
                      disabled={saving}
                      className="bg-gradient-primary"
                    >
                      <Save className="mr-2 h-4 w-4" />
                      {saving ? 'Saving...' : 'Save Changes'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Statistics Sidebar */}
            <div className="space-y-6">
              {/* Quick Stats */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5" />
                    Quick Stats
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Tasks Completed</span>
                    <Badge variant="secondary">{stats.completedTasks}/{stats.totalTasks}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Goals Achieved</span>
                    <Badge variant="secondary">{stats.completedGoals}/{stats.totalGoals}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Current Streak</span>
                    <Badge className="bg-orange-500">{stats.streak} days</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Completion Rate</span>
                    <Badge className="bg-green-500">
                      {stats.totalTasks > 0 ? Math.round((stats.completedTasks / stats.totalTasks) * 100) : 0}%
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              {/* Achievements */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Award className="h-5 w-5" />
                    Recent Achievements
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <div className="h-8 w-8 rounded-full bg-yellow-100 flex items-center justify-center">
                      <Award className="h-4 w-4 text-yellow-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">First Goal Completed</p>
                      <p className="text-xs text-muted-foreground">Completed your first goal</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                      <Activity className="h-4 w-4 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">Productive Week</p>
                      <p className="text-xs text-muted-foreground">Completed 10+ tasks this week</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
                      <User className="h-4 w-4 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">Profile Complete</p>
                      <p className="text-xs text-muted-foreground">Completed your profile setup</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </PageWrapper>
  );
};