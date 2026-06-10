// src/hooks/useCarros.js
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { useEffect } from 'react';

export function useCarros() {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['carros_em_andamento'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('carros')
        .select(`
          *,
          servicos (*)
        `)
        .eq('status_geral', 'em_andamento')
        .order('ordem', { ascending: true }); // Ordena pela prioridade definida pelo arrasto

      if (error) throw new Error(error.message);
      return data;
    }
  });

  useEffect(() => {
    const canal = supabase
      .channel('oficina_mudancas')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'carros' }, () => {
        queryClient.invalidateQueries({ queryKey: ['carros_em_andamento'] });
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'servicos' }, () => {
        queryClient.invalidateQueries({ queryKey: ['carros_em_andamento'] });
      })
      .subscribe();

    return () => {
      supabase.removeChannel(canal);
    };
  }, [queryClient]);

  return query;
}

export function useHistorico() {
  return useQuery({
    queryKey: ['carros_historico'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('carros')
        .select(`
          *,
          servicos (*)
        `)
        .eq('status_geral', 'historico')
        .order('created_at', { ascending: false });

      if (error) throw new Error(error.message);
      return data;
    }
  });
}

export function useMutationsCarro() {
  const queryClient = useQueryClient();

  const alternarServico = useMutation({
    mutationFn: async ({ id, concluido }) => {
      const { error } = await supabase.from('servicos').update({ concluido }).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['carros_em_andamento'] })
  });

  const finalizarCarro = useMutation({
    mutationFn: async (id) => {
      const { error } = await supabase.from('carros').update({ status_geral: 'historico' }).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['carros_em_andamento'] });
      queryClient.invalidateQueries({ queryKey: ['carros_historico'] });
    }
  });

  const reordenarCarros = useMutation({
    mutationFn: async (listaOrdenada) => {
      const promises = listaOrdenada.map(carro => 
        supabase.from('carros').update({ ordem: carro.ordem }).eq('id', carro.id)
      );
      await Promise.all(promises);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['carros_em_andamento'] })
  });

  const atualizarDescricao = useMutation({
    mutationFn: async ({ id, descricao }) => {
      const { error } = await supabase.from('servicos').update({ descricao }).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['carros_em_andamento'] })
  });

  const adicionarServicoExtra = useMutation({
    mutationFn: async ({ carro_id, titulo }) => {
      const { error } = await supabase.from('servicos').insert([{ carro_id, titulo, descricao: '', concluido: false }]);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['carros_em_andamento'] })
  });

  // NOVA MUTATION: Elimina o carro e os seus serviços do banco de dados
  const eliminarCarro = useMutation({
    mutationFn: async (id) => {
      const { error } = await supabase.from('carros').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      // Atualiza ambas as colunas para o caso de o carro ser apagado do histórico
      queryClient.invalidateQueries({ queryKey: ['carros_em_andamento'] });
      queryClient.invalidateQueries({ queryKey: ['carros_historico'] });
    }
  });

  return { 
    alternarServico, 
    finalizarCarro, 
    reordenarCarros, 
    atualizarDescricao, 
    adicionarServicoExtra, 
    eliminarCarro // Retorna a nova função
  };
}

// Adicione no final do src/hooks/useCarros.js
export function useCatalogo() {
  return useQuery({
    queryKey: ['catalogo_servicos'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('catalogo_servicos')
        .select('*')
        .order('nome', { ascending: true });

      if (error) throw new Error(error.message);
      return data;
    }
  });
}

// Adicione isto no final do src/hooks/useCarros.js

export function useMutationsCatalogo() {
  const queryClient = useQueryClient();

  const adicionarAoCatalogo = useMutation({
    mutationFn: async (nome) => {
      const { error } = await supabase
        .from('catalogo_servicos')
        .insert([{ nome }]);
      if (error) throw error;
    },
    onSuccess: () => {
      // Atualiza a lista de checkboxes instantaneamente
      queryClient.invalidateQueries({ queryKey: ['catalogo_servicos'] });
    }
  });

  return { adicionarAoCatalogo };
}