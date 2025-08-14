// src/components/SuperAdminPanel.tsx
import React from "react";

const SuperAdminPanel: React.FC = () => {
  return (
    <div className="p-4 bg-white shadow-md rounded-lg">
      <h2 className="text-2xl font-bold mb-4">Panel de Administración</h2>
      <p>
        Bienvenido, administrador. Desde aquí puedes gestionar usuarios,
        reportes y configuraciones del sistema.
      </p>
      {/* Aquí puedes añadir la lógica y los componentes para la gestión de usuarios */}
      <div className="mt-4">
        {/* <GestionUsuariosTable /> */}
        {/* <ReportesSistema /> */}
      </div>
    </div>
  );
};

export default SuperAdminPanel;
