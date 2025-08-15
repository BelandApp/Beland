// src/components/UserDashboard.tsx
import React from "react";
import { useAuth } from "src/hooks/AuthContext";
import SuperAdminPanel from "./components/SuperAdminPanel";
import AdminPanel from "./components/AdminPanel";
import LeaderPanel from "./components/LeaderPanel";
import EmpresaPanel from "./components/EmpresaPanel";
import UserPanel from "./components/UserPanel";

const UserDashboard: React.FC = () => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        Cargando...
      </div>
    );
  }

  if (!user) {
    // Esto debería redirigir al login si un usuario no está autenticado
    return (
      <div className="text-center p-8">
        No tienes permisos para ver esta página.
      </div>
    );
  }

  // Renderizado condicional basado en el rol del usuario
  switch (user.role) {
    case "SUPERADMIN":
      return <SuperAdminPanel />;
    case "ADMIN":
      return <AdminPanel />;
    case "LEADER":
      return <LeaderPanel />;
    case "EMPRESA":
      return <EmpresaPanel />;
    case "USER":
      return <UserPanel />;
    default:
      return (
        <div className="text-center p-8">
          <h1 className="text-red-500 font-bold">
            Error: Rol de usuario no reconocido.
          </h1>
          <p>Contacta al soporte técnico si crees que esto es un error.</p>
        </div>
      );
  }
};

export default UserDashboard;
