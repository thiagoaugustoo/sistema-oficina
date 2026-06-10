// src/App.jsx
import { useState } from 'react';
import { useCarros, useHistorico, useMutationsCarro } from './hooks/useCarros';
import { useAuth } from './hooks/useAuth';
import { supabase } from './lib/supabase';
import CardCarro from './components/CardCarro';
import FormNovoCarro from './components/FormNovoCarro';
import ModalLogin from './components/ModalLogin';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { Search, LogIn, LogOut } from 'lucide-react';

export default function App() {
  const { user } = useAuth(); // Chama o nosso hook para saber se tá logado
  const { data: carros, isLoading: carregandoCarros, error: erroCarros } = useCarros();
  const { data: historico, isLoading: carregandoHistorico } = useHistorico();
  const { reordenarCarros } = useMutationsCarro();
  
  const [termoBusca, setTermoBusca] = useState('');
  const [modalLoginAberto, setModalLoginAberto] = useState(false);

  const handleOnDragEnd = (result) => {
    if (!result.destination || !user) return; // Trava o drag and drop se não for usuário
    const itensReordenados = Array.from(carros || []);
    const [itemRemovido] = itensReordenados.splice(result.source.index, 1);
    itensReordenados.splice(result.destination.index, 0, itemRemovido);
    const listaComNovaOrdem = itensReordenados.map((carro, index) => ({ id: carro.id, ordem: index }));
    reordenarCarros.mutate(listaComNovaOrdem);
  };

  const historicoFiltrado = historico?.filter((carro) => {
    const termo = termoBusca.toLowerCase();
    return carro.placa.toLowerCase().includes(termo) || carro.modelo.toLowerCase().includes(termo);
  });

  return (
    <div style={{ padding: '20px', maxWidth: '1400px', margin: '0 auto' }}>
      
      {/* CABEÇALHO COM BOTÃO DE LOGIN/LOGOUT */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', borderBottom: '2px solid var(--red-accent)', paddingBottom: '10px' }}>
        <h1 style={{ color: '#f8fafc', margin: 0 }}>Gestão da Oficina</h1>
        
        {user ? (
          <button onClick={() => supabase.auth.signOut()} className="btn-outline" style={{ padding: '8px 16px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 'bold' }}>
            <LogOut size={18} /> SAIR
          </button>
        ) : (
          <button onClick={() => setModalLoginAberto(true)} className="btn-red" style={{ padding: '8px 16px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 'bold' }}>
            <LogIn size={18} /> ENTRAR PARA EDITAR
          </button>
        )}
      </div>
      
      {/* Esconde o formulário de adicionar carro se não estiver logado */}
      {user && <FormNovoCarro />}

      <div style={{ display: 'flex', gap: '24px', marginTop: '24px', alignItems: 'flex-start', flexWrap: 'wrap' }}>
        
        <DragDropContext onDragEnd={handleOnDragEnd}>
          <div style={{ backgroundColor: 'var(--bg-coluna)', padding: '20px', borderRadius: '12px', minWidth: '340px', flex: 1, border: '1px solid var(--border-color)', boxShadow: '0 10px 30px rgba(0,0,0,0.5)' }}>
            <h2 style={{ marginTop: 0, fontSize: '16px', textTransform: 'uppercase', color: 'var(--text-muted)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--red-accent)', boxShadow: '0 0 10px var(--red-accent)' }}></div>
                Em Andamento
              </span>
              <span style={{ backgroundColor: '#1e293b', padding: '4px 12px', borderRadius: '20px', fontSize: '14px', color: '#f8fafc' }}>
                {carregandoCarros ? '...' : carros?.length || 0}
              </span>
            </h2>
            
            <Droppable droppableId="coluna-em-andamento">
              {(provided) => (
                <div {...provided.droppableProps} ref={provided.innerRef} style={{ marginTop: '20px', minHeight: '150px' }}>
                  {erroCarros && <p style={{ color: 'var(--red-accent)' }}>Erro: {erroCarros.message}</p>}
                  {!carregandoCarros && carros?.map((carro, index) => (
                    
                    // AQUI TRAVA O ARRASTO SE NÃO TIVER LOGADO
                    <Draggable key={carro.id} draggableId={carro.id} index={index} isDragDisabled={!user}>
                      {(providedDrag) => (
                        <div ref={providedDrag.innerRef} {...providedDrag.draggableProps} {...providedDrag.dragHandleProps}>
                          {/* Passamos o user pro card saber se libera os botões */}
                          <CardCarro carro={carro} isUserLogado={!!user} /> 
                        </div>
                      )}
                    </Draggable>

                  ))}
                  {provided.placeholder}
                  {!carregandoCarros && carros?.length === 0 && <p style={{ textAlign: 'center', color: 'var(--text-muted)' }}>Pátio vazio.</p>}
                </div>
              )}
            </Droppable>
          </div>
        </DragDropContext>

        <div style={{ backgroundColor: 'var(--bg-coluna)', padding: '20px', borderRadius: '12px', minWidth: '340px', flex: 1, border: '1px solid var(--border-color)', boxShadow: '0 10px 30px rgba(0,0,0,0.5)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h2 style={{ margin: 0, fontSize: '16px', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Histórico</h2>
            <span style={{ backgroundColor: '#1e293b', padding: '4px 12px', borderRadius: '20px', fontSize: '14px', color: '#f8fafc' }}>
              {carregandoHistorico ? '...' : historico?.length || 0}
            </span>
          </div>

          <div style={{ position: 'relative', marginBottom: '20px' }}>
            <Search size={18} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '12px' }} />
            <input type="text" placeholder="Buscar por placa ou modelo..." value={termoBusca} onChange={(e) => setTermoBusca(e.target.value)} className="input-dark" style={{ width: '100%', padding: '12px 12px 12px 40px', borderRadius: '8px', boxSizing: 'border-box' }} />
          </div>
          
          <div style={{ marginTop: '16px', maxHeight: '70vh', overflowY: 'auto', paddingRight: '8px' }}>
            {!carregandoHistorico && historicoFiltrado?.map(carro => (
              <CardCarro key={carro.id} carro={carro} isUserLogado={!!user} />
            ))}
            {!carregandoHistorico && historicoFiltrado?.length === 0 && <p style={{ textAlign: 'center', color: 'var(--text-muted)' }}>Nenhum veículo encontrado.</p>}
          </div>
        </div>
      </div>

      <ModalLogin isOpen={modalLoginAberto} onClose={() => setModalLoginAberto(false)} />
    </div>
  );
}