import { Navigate, Outlet } from 'react-router-dom';

interface RotasPrivadasProps {
  usuarioLogado: boolean;
  carregando: boolean;
}

export function RotasPrivadas({ usuarioLogado, carregando }: RotasPrivadasProps) {
  if (carregando) {
  return (
    <div className="loading-container">
      <div className="loading-spinner"></div>
      
      <div className="loading-text-wrapper">
        <h2 className="loading-title">Carregando</h2>
        <p className="loading-subtitle">Preparando o sistema...</p>
      </div>
    </div>
  );
}

  if (!usuarioLogado) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}