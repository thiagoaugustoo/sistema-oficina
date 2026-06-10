// src/components/FormNovoCarro.jsx
import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { useQueryClient } from '@tanstack/react-query';
import { useCatalogo } from '../hooks/useCarros';
import { PlusCircle } from 'lucide-react';
import ModalCatalogo from './ModalCatalogo';

export default function FormNovoCarro() {
  const queryClient = useQueryClient();
  const { data: catalogo, isLoading: carregandoCatalogo } = useCatalogo();
  
  const [placa, setPlaca] = useState('');
  const [modelo, setModelo] = useState('');
  const [servicosSelecionados, setServicosSelecionados] = useState([]);
  const [carregando, setCarregando] = useState(false);
  const [modalAberto, setModalAberto] = useState(false);

  // MÁGICA DA FORMATAÇÃO AQUI
  const handlePlacaChange = (e) => {
    let valor = e.target.value;
    
    // 1. Remove tudo que não for letra ou número e converte para maiúsculo
    valor = valor.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
    
    // 2. Adiciona o hífen automaticamente após a 3ª letra, limitando o total a 7 alfanuméricos
    if (valor.length > 3) {
      valor = valor.substring(0, 3) + '-' + valor.substring(3, 7);
    }
    
    setPlaca(valor);
  };

  const handleToggleServico = (nomeServico) => {
    setServicosSelecionados(prev => 
      prev.includes(nomeServico) ? prev.filter(s => s !== nomeServico) : [...prev, nomeServico]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!placa || !modelo || servicosSelecionados.length === 0) return alert("Preencha placa, modelo e selecione 1 serviço.");
    setCarregando(true);
    
    try {
      const { data: carroInserido, error: erroCarro } = await supabase.from('carros').insert([{ placa, modelo }]).select().single();
      if (erroCarro) throw erroCarro;
      
      const servicosParaInserir = servicosSelecionados.map(titulo => ({ 
        carro_id: carroInserido.id, 
        titulo, 
        descricao: '', 
        concluido: false 
      }));
      
      const { error: erroServicos } = await supabase.from('servicos').insert(servicosParaInserir);
      if (erroServicos) throw erroServicos;
      
      setPlaca(''); setModelo(''); setServicosSelecionados([]);
      queryClient.invalidateQueries({ queryKey: ['carros_em_andamento'] });
    } catch (error) { 
      alert("Erro: " + error.message); 
    } finally { 
      setCarregando(false); 
    }
  };

  return (
    <>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px', padding: '24px', backgroundColor: 'var(--bg-coluna)', borderRadius: '12px', border: '1px solid var(--border-color)', boxShadow: '0 4px 20px rgba(0,0,0,0.3)' }}>
        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', flex: 1, minWidth: '150px' }}>
            <label style={{ fontSize: '13px', fontWeight: 'bold', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Placa</label>
            <input 
              className="input-dark" 
              value={placa} 
              onChange={handlePlacaChange} // Usando a nova função aqui
              placeholder="ABC-1234" 
              maxLength={8} 
              style={{ padding: '12px', borderRadius: '8px' }} 
            />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', flex: 2, minWidth: '200px' }}>
            <label style={{ fontSize: '13px', fontWeight: 'bold', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Modelo do Veículo</label>
            <input className="input-dark" value={modelo} onChange={(e) => setModelo(e.target.value)} placeholder="Ex: Celta 2010" style={{ padding: '12px', borderRadius: '8px' }} />
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <label style={{ fontSize: '13px', fontWeight: 'bold', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Serviços Iniciais:</label>
            <button type="button" onClick={() => setModalAberto(true)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--red-accent)' }} title="Adicionar ao catálogo"><PlusCircle size={20} /></button>
          </div>
          {carregandoCatalogo ? <p style={{ color: 'var(--text-muted)' }}>A carregar...</p> : (
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              {catalogo?.map(item => (
                <label key={item.id} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 14px', backgroundColor: servicosSelecionados.includes(item.nome) ? 'rgba(225, 29, 72, 0.15)' : 'var(--bg-input)', borderRadius: '24px', fontSize: '13px', cursor: 'pointer', border: servicosSelecionados.includes(item.nome) ? '1px solid var(--red-accent)' : '1px solid var(--border-color)', color: servicosSelecionados.includes(item.nome) ? 'var(--red-accent)' : 'var(--text-main)', transition: 'all 0.2s' }}>
                  <input type="checkbox" checked={servicosSelecionados.includes(item.nome)} onChange={() => handleToggleServico(item.nome)} style={{ display: 'none' }} />
                  {item.nome}
                </label>
              ))}
            </div>
          )}
        </div>
        <button type="submit" disabled={carregando} className="btn-red" style={{ padding: '14px 24px', borderRadius: '8px', alignSelf: 'flex-start', fontWeight: 'bold', fontSize: '14px', letterSpacing: '0.5px' }}>
          {carregando ? 'A ADICIONAR...' : 'ADICIONAR CARRO'}
        </button>
      </form>
      <ModalCatalogo isOpen={modalAberto} onClose={() => setModalAberto(false)} />
    </>
  );
}