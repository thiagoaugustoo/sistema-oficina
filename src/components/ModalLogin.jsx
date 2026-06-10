// src/components/ModalLogin.jsx
import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { X } from 'lucide-react';

export default function ModalLogin({ isOpen, onClose }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [erro, setErro] = useState('');
  const [carregando, setCarregando] = useState(false);

  if (!isOpen) return null;

  const handleLogin = async (e) => {
    e.preventDefault();
    setErro('');
    setCarregando(true);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setErro('E-mail ou senha incorretos.');
    } else {
      setEmail('');
      setPassword('');
      onClose(); // Fecha o modal se o login der certo
    }
    setCarregando(false);
  };

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0, 0, 0, 0.7)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(4px)' }}>
      <div style={{ backgroundColor: 'var(--bg-coluna)', padding: '24px', borderRadius: '12px', width: '100%', maxWidth: '350px', border: '1px solid var(--border-color)', boxShadow: '0 20px 40px rgba(0,0,0,0.6)' }}>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2 style={{ margin: 0, fontSize: '20px', color: 'var(--text-main)' }}>Acesso Restrito</h2>
          <button className="btn-outline" onClick={onClose} style={{ padding: '4px', borderRadius: '4px' }}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {erro && <p style={{ color: 'var(--red-accent)', margin: 0, fontSize: '14px', textAlign: 'center' }}>{erro}</p>}
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '12px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>E-mail</label>
            <input type="email" required className="input-dark" value={email} onChange={(e) => setEmail(e.target.value)} style={{ padding: '12px', borderRadius: '8px' }} />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '12px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Senha</label>
            <input type="password" required className="input-dark" value={password} onChange={(e) => setPassword(e.target.value)} style={{ padding: '12px', borderRadius: '8px' }} />
          </div>

          <button type="submit" disabled={carregando} className="btn-red" style={{ padding: '12px', borderRadius: '8px', fontWeight: 'bold', marginTop: '8px' }}>
            {carregando ? 'ENTRANDO...' : 'ENTRAR'}
          </button>
        </form>

      </div>
    </div>
  );
}