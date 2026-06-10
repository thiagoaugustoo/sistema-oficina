// src/components/CardCarro.jsx
import { CheckCircle, AlertTriangle, Plus, Trash2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useMutationsCarro } from '../hooks/useCarros';

// Sub-componente para os serviços com estilo Dark Neon
function ServicoItem({ servico, isHistorico, alternarServico, atualizarDescricao, isUserLogado }) {
  const [texto, setTexto] = useState(servico.descricao || '');
  useEffect(() => setTexto(servico.descricao || ''), [servico.descricao]);

  // Estilos de status para os ícones neon
  const corIcone = servico.concluido ? '#10b981' : 'var(--red-accent)'; // Verde neon ou Vermelho neon
  const sombraIcone = servico.concluido ? '0 0 10px rgba(16, 185, 129, 0.4)' : '0 0 10px rgba(225, 29, 72, 0.4)';

  return (
    <li style={{ 
      marginBottom: '16px', padding: '12px', 
      backgroundColor: isHistorico ? 'rgba(31, 41, 55, 0.3)' : 'rgba(3, 7, 18, 0.5)', 
      borderRadius: '8px', border: `1px solid ${isHistorico ? '#1e293b' : 'var(--border-color)'}`,
      transition: 'border-color 0.3s ease'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
        <button 
          onClick={() => !isHistorico && isUserLogado && alternarServico.mutate({ id: servico.id, concluido: !servico.concluido })}
          disabled={alternarServico.isPending || isHistorico || !isUserLogado}
          style={{ background: 'none', border: 'none', cursor: (isHistorico || !isUserLogado) ? 'default' : 'pointer', display: 'flex', alignItems: 'center', padding: 0, color: corIcone, filter: `drop-shadow(${sombraIcone})` }}
        >
          {servico.concluido ? <CheckCircle size={22} /> : <AlertTriangle size={22} />}
        </button>
        <span style={{ textDecoration: servico.concluido ? 'line-through' : 'none', color: servico.concluido ? 'var(--text-muted)' : 'var(--text-main)', fontWeight: '600', fontSize: '15px' }}>
          {servico.titulo}
        </span>
      </div>

      <textarea
        className="input-dark" value={texto} onChange={(e) => setTexto(e.target.value)}
        onBlur={() => { if (texto !== servico.descricao && isUserLogado) atualizarDescricao.mutate({ id: servico.id, descricao: texto }); }}
        onMouseDown={(e) => e.stopPropagation()} 
        disabled={isHistorico || !isUserLogado}
        placeholder={isHistorico || !isUserLogado ? "Sem descrição." : "Adicione detalhes da execução..."}
        style={{ 
          width: '100%', padding: '10px', borderRadius: '6px', minHeight: '45px', boxSizing: 'border-box', 
          resize: 'vertical', fontSize: '13px', 
          // Ajuste fino para o fundo no modo somente leitura
          backgroundColor: (isHistorico || !isUserLogado) ? 'transparent' : 'var(--bg-app)', 
          border: (isHistorico || !isUserLogado) ? '1px solid #1e293b' : '1px solid var(--border-color)'
        }}
      />
    </li>
  );
}

export default function CardCarro({ carro, isUserLogado }) {
  const [novoServico, setNovoServico] = useState('');
  const { alternarServico, finalizarCarro, atualizarDescricao, adicionarServicoExtra, eliminarCarro } = useMutationsCarro();

  const isHistorico = carro.status_geral === 'historico';
  const todosConcluidos = carro.servicos?.length > 0 && carro.servicos.every(s => s.concluido);

  const handleEliminarCarro = () => {
    if (window.confirm(`Tem a certeza que deseja eliminar o carro ${carro.placa}?`)) eliminarCarro.mutate(carro.id);
  };

  // Efeito de brilho neon na borda do card ativo (não histórico)
  const bordaCardAtivo = !isHistorico ? '1px solid #334155' : '1px solid #1e293b';
  const sombraCardAtivo = !isHistorico ? '0 4px 6px rgba(0,0,0,0.3), 0 0 10px rgba(225, 29, 72, 0.1)' : '0 4px 6px rgba(0,0,0,0.2)';

  return (
    <div className="card-hover" style={{ 
      backgroundColor: isHistorico ? 'rgba(17, 24, 39, 0.4)' : 'var(--bg-card)', 
      border: bordaCardAtivo, borderRadius: '12px', padding: '20px', 
      marginBottom: '16px', boxSizing: 'border-box', 
      boxShadow: sombraCardAtivo, opacity: isHistorico ? 0.7 : 1,
      transition: 'transform 0.2s ease, border-color 0.3s ease, box-shadow 0.3s ease'
    }}>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px', marginBottom: '16px', borderBottom: '1px solid #1e293b', paddingBottom: '12px' }}>
        <div>
          <h3 style={{ margin: 0, fontSize: '20px', color: 'var(--text-main)', letterSpacing: '1px', textTransform: 'uppercase', textShadow: !isHistorico ? '0 0 5px rgba(248, 250, 252, 0.5)' : 'none' }}>
            {carro.placa}
          </h3>
          <span style={{ fontSize: '13px', color: 'var(--text-muted)', fontWeight: '500' }}>{carro.modelo}</span>
        </div>
        
        {isUserLogado && (
          <button className="btn-outline" onClick={handleEliminarCarro} disabled={eliminarCarro.isPending} onMouseDown={(e) => e.stopPropagation()} style={{ padding: '6px', borderRadius: '6px', display: 'flex', alignItems: 'center' }} title="Eliminar">
            <Trash2 size={18} />
          </button>
        )}
      </div>

      <div>
        <strong style={{ fontSize: '13px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block', marginBottom: '10px' }}>Serviços:</strong>
        <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
          {carro.servicos?.map((servico) => (
            <ServicoItem key={servico.id} servico={servico} isHistorico={isHistorico} alternarServico={alternarServico} atualizarDescricao={atualizarDescricao} isUserLogado={isUserLogado} />
          ))}
        </ul>
      </div>

      {!isHistorico && isUserLogado && (
        <form onSubmit={(e) => { e.preventDefault(); if (!novoServico.trim()) return; adicionarServicoExtra.mutate({ carro_id: carro.id, titulo: novoServico }); setNovoServico(''); }} style={{ display: 'flex', gap: '8px', marginTop: '20px', borderTop: '1px solid #1e293b', paddingTop: '16px' }}>
          <input className="input-dark" value={novoServico} onChange={(e) => setNovoServico(e.target.value)} onMouseDown={(e) => e.stopPropagation()} placeholder="Serviço extra..." style={{ flex: 1, padding: '12px', borderRadius: '8px', fontSize: '13px' }} />
          <button type="submit" disabled={adicionarServicoExtra.isPending || !novoServico.trim()} className="btn-outline" style={{ padding: '0 16px', borderRadius: '8px', display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
            <Plus size={20} />
          </button>
        </form>
      )}

      {todosConcluidos && !isHistorico && isUserLogado && (
        <button onClick={() => finalizarCarro.mutate(carro.id)} disabled={finalizarCarro.isPending} className="btn-red" style={{ width: '100%', padding: '16px', marginTop: '20px', borderRadius: '8px', fontWeight: 'bold', letterSpacing: '1px', textTransform: 'uppercase', fontSize: '14px', boxShadow: '0 0 15px rgba(225, 29, 72, 0.4)' }}>
          {finalizarCarro.isPending ? 'A FINALIZAR...' : 'FINALIZAR CARRO'}
        </button>
      )}
    </div>
  );
}