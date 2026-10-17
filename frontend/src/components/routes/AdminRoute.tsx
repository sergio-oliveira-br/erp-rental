// frontend/src/components/routes/AdminRoute.tsx

import { Navigate, Outlet } from 'react-router-dom';
import { toast } from 'sonner';

export function AdminRoute() {
  const token = localStorage.getItem('erp_access_token');
  const userStr = localStorage.getItem('erp_user');

  // 1. Se não houver token, redireciona para o login
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  let isAdmin = false;
  try {
    const user = userStr ? JSON.parse(userStr) : null;
    isAdmin = user?.is_admin === true;
  } catch (e) {
    isAdmin = false;
  }

  // 2. Se o usuário estiver logado mas NÃO for admin, bloqueia e redireciona
  if (!isAdmin) {
    toast.error('Acesso negado: Requer privilégios de Administrador.');
    return <Navigate to="/dashboard" replace />;
  }

  // 3. Se for Admin, renderiza a rota filha normalmente
  return <Outlet />;
}