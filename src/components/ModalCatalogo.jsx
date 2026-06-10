// src/components/ModalCatalogo.jsx
import { useState } from 'react';
import { X } from 'lucide-react';
import { useMutationsCatalogo } from '../hooks/useCarros';

export default function ModalCatalogo({ isOpen, onClose }) {
  const [novoServico, setNovoServico] = useState('');
  const { adicionarAoCatalogo } = useMutationsCatalogo();

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!novoServico.trim()) return;
    adicionarAoCatalogo.mutate(novoServico, { onSuccess: () => { setNovoServico(''); onClose(); } });
  };

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0, 0, 0, 0.7)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(4px)' }}>
      <div style={{ backgroundColor: 'var(--bg-coluna)', padding: '24px', borderRadius: '12px', width: '100%', maxWidth: '400px', border: '1px solid var(--border-color)', boxShadow: '0 20px 40px rgba(0,0,0,0.6)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2 style={{ margin: 0, fontSize: '18px', color: 'var(--text-main)' }}>Novo Serviço Padrão</h2>
          <button className="btn-outline" onClick={onClose} style={{ padding: '4px', borderRadius: '4px', border: 'none' }}>
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <input className="input-dark" autoFocus value={novoServico} onChange={(e) => setNovoServico(e.target.value)} placeholder="Ex: Higienização" style={{ padding: '12px', borderRadius: '8px', fontSize: '14px' }} />
          <button type="submit" disabled={adicionarAoCatalogo.isPending || !novoServico.trim()} className="btn-red" style={{ padding: '12px', borderRadius: '8px', fontWeight: 'bold' }}>
            {adicionarAoCatalogo.isPending ? 'A SALVAR...' : 'SALVAR NO CATÁLOGO'}
          </button>
        </form>
      </div>
    </div>
  );
}