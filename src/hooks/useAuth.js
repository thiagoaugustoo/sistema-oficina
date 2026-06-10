// src/hooks/useAuth.js
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export function useAuth() {
  const [user, setUser] = useState(null);
  const [carregandoAuth, setCarregandoAuth] = useState(true);

  useEffect(() => {
    // Busca a sessão inicial ao abrir a página
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user || null);
      setCarregandoAuth(false);
    });

    // Fica escutando se alguém fez login ou logout
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
    });

    return () => subscription.unsubscribe();
  }, []);

  return { user, carregandoAuth };
}