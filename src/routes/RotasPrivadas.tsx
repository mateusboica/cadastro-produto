import { Navigate, Outlet } from 'react-router-dom';

interface RotasPrivadasProps {
  usuarioLogado: boolean;
  carregando: boolean;
}

export function RotasPrivadas({ usuarioLogado, carregando }: RotasPrivadasProps) {
  if (carregando) {
    return <div style={{ textAlign: 'center', marginTop: '50px' }}>Carregando sistema...</div>;
  }

  if (!usuarioLogado) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}