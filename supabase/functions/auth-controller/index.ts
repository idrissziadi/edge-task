import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const url = new URL(req.url);
    const action = url.searchParams.get('action');

    console.log(`AuthController: ${req.method} ${action}`);

    switch (action) {
      case 'register':
        return await handleRegister(supabaseClient, req);
      case 'login':
        return await handleLogin(supabaseClient, req);
      case 'logout':
        return await handleLogout(supabaseClient, req);
      case 'user-info':
        return await handleUserInfo(supabaseClient, req);
      case 'refresh':
        return await handleRefreshToken(supabaseClient, req);
      default:
        return new Response(
          JSON.stringify({ error: 'Invalid action' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    }
  } catch (error) {
    console.error('AuthController Error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

// Inscription
async function handleRegister(supabaseClient: any, req: Request) {
  const { email, password, name } = await req.json();
  
  if (!email || !password) {
    return new Response(
      JSON.stringify({ error: 'Email and password are required' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  try {
    // Créer l'utilisateur avec Supabase Auth
    const { data: authData, error: authError } = await supabaseClient.auth.admin.createUser({
      email,
      password,
      user_metadata: { name },
      email_confirm: true
    });

    if (authError) throw authError;

    // Créer le profil utilisateur dans la table users
    const { error: profileError } = await supabaseClient
      .from('users')
      .insert({
        auth_user_id: authData.user.id,
        name: name || email.split('@')[0],
        role: 'user'
      });

    if (profileError) {
      console.log('Profile creation error:', profileError);
      // Ne pas faire échouer la création si le profil échoue
    }

    // Initialiser les stats de productivité
    const { error: statsError } = await supabaseClient
      .from('productivity_stats')
      .insert({
        user_id: authData.user.id,
        completed_today: 0,
        weekly_completed: 0,
        focus_mode_enabled: false
      });

    if (statsError) {
      console.log('Stats creation error:', statsError);
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        user: {
          id: authData.user.id,
          email: authData.user.email,
          name: name || email.split('@')[0]
        }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Registration error:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Registration failed' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
}

// Connexion
async function handleLogin(supabaseClient: any, req: Request) {
  const { email, password } = await req.json();
  
  if (!email || !password) {
    return new Response(
      JSON.stringify({ error: 'Email and password are required' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  try {
    const { data, error } = await supabaseClient.auth.signInWithPassword({
      email,
      password
    });

    if (error) throw error;

    // Récupérer les informations du profil utilisateur
    const { data: profile } = await supabaseClient
      .from('users')
      .select('*')
      .eq('auth_user_id', data.user.id)
      .single();

    return new Response(
      JSON.stringify({ 
        success: true,
        session: data.session,
        user: {
          id: data.user.id,
          email: data.user.email,
          name: profile?.name || data.user.user_metadata?.name || email.split('@')[0],
          role: profile?.role || 'user'
        }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Login error:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Login failed' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
}

// Déconnexion
async function handleLogout(supabaseClient: any, req: Request) {
  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'No authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const token = authHeader.replace('Bearer ', '');
    const { error } = await supabaseClient.auth.admin.signOut(token);

    if (error) throw error;

    return new Response(
      JSON.stringify({ success: true }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Logout error:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Logout failed' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
}

// Récupérer les infos utilisateur
async function handleUserInfo(supabaseClient: any, req: Request) {
  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'No authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error } = await supabaseClient.auth.getUser(token);

    if (error || !user) {
      return new Response(
        JSON.stringify({ error: 'Invalid token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Récupérer le profil complet
    const { data: profile } = await supabaseClient
      .from('users')
      .select('*')
      .eq('auth_user_id', user.id)
      .single();

    return new Response(
      JSON.stringify({ 
        user: {
          id: user.id,
          email: user.email,
          name: profile?.name || user.user_metadata?.name || user.email?.split('@')[0],
          role: profile?.role || 'user',
          created_at: user.created_at
        }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('User info error:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Failed to get user info' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
}

// Rafraîchir le token
async function handleRefreshToken(supabaseClient: any, req: Request) {
  try {
    const { refresh_token } = await req.json();
    
    if (!refresh_token) {
      return new Response(
        JSON.stringify({ error: 'Refresh token is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { data, error } = await supabaseClient.auth.refreshSession({
      refresh_token
    });

    if (error) throw error;

    return new Response(
      JSON.stringify({ 
        success: true,
        session: data.session
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Token refresh error:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Token refresh failed' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
}