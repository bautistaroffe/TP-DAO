import React, { useCallback, useState } from "react";
import TorneoTable from "../components/tables/TorneoTable";
import TorneoForm from "../components/forms/TorneoForm";

export default function TorneosPage() {
  const [torneoEditId, setTorneoEditId] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleAgregarTorneo = () => {
    setTorneoEditId(0); // 0 => modo creación
  };

  const handleEditStart = useCallback((id_torneo) => {
    setTorneoEditId(id_torneo);
  }, []);

  const handleFormComplete = () => {
    setTorneoEditId(null);        // volver a tabla
    setRefreshKey((prev) => prev + 1); // refrescar tabla
  };

  // Si estás editando o creando, mostrás el form
  if (torneoEditId !== null) {
    return (
      <div className="container home-page p-4">
        <TorneoForm
          id_torneo={torneoEditId > 0 ? torneoEditId : null}
          onSuccess={handleFormComplete}
          onCancel={handleFormComplete}
        />
      </div>
    );
  }

  // Vista por defecto: tabla
  return (
    <div className="container home-page p-4">
      <h1 className="text-3xl font-bold mb-6">🏆 Gestión de Torneos</h1>

      <div className="home-actions mb-6 text-left">
        <button
          onClick={handleAgregarTorneo}
          className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg shadow-md transition duration-300"
        >
          + Agregar Torneo
        </button>
      </div>

      <TorneoTable
        key={refreshKey}
        onEditStart={handleEditStart}
      />
    </div>
  );
}

