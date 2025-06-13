import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useRouter } from 'expo-router';

type Role = 'user' | 'admin';

interface AuthContextProps {
  session: any;
  user: any;
  role: Role | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, role: Role) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextProps>({} as AuthContextProps);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [session, setSession] = useState<any>(null);
  const [user, setUser] = useState<any>(null);
  const [role, setRole] = useState<Role | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const fetchUser = async () => {
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();

    if (sessionData?.session) {
      const user = sessionData.session.user;
      setSession(sessionData.session);
      setUser(user);
      await fetchRole(user.id);
    } else {
      setSession(null);
      setUser(null);
      setRole(null);
    }

    setLoading(false);
  };

  const fetchRole = async (userId: string) => {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('role')
      .eq('id', userId)
      .single();

    if (!error && data) {
      setRole(data.role);
    }
  };

  const login = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    await fetchUser();
    router.replace('/');
  };

  const register = async (email: string, password: string, role: Role) => {
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) throw error;

    const userId = data.user?.id;
    if (userId) {
      await supabase.from('user_profiles').insert([{ id: userId, role }]);
    }

    await fetchUser();
    router.replace('/');
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setSession(null);
    setUser(null);
    setRole(null);
    router.replace('/login');
  };

  useEffect(() => {
    fetchUser();
  }, []);

  useEffect(() => {
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        setSession(session);
        setUser(session.user);
        fetchRole(session.user.id);
      } else {
        setSession(null);
        setUser(null);
        setRole(null);
      }
    });

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  return (
    <AuthContext.Provider value={{ session, user, role, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);