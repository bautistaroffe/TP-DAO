import React, { useState } from "react";
import ReservaTable from "../components/tables/ReservaTable.jsx";
import ReservaForm from "../components/forms/ReservaForm/ReservaForm.jsx";

export default function ReservasPage() {
  // Modal state
  const [showReservaForm, setShowReservaForm] = useState(false);
  const [refreshKey, setRefreshKey] = useState(false);

  // Función de acción para el botón Agregar (toggle)
  const handleAgregarReserva = () => {
    setShowReservaForm((prev) => !prev);
  };

  const closeReservaForm = () => setShowReservaForm(false);
  const onReservaFormSuccess = () => {
    // Close modal and trigger table refresh
    setShowReservaForm(false);
    setRefreshKey((prev) => !prev);
  };

  return (
    <div className="container home-page p-4">
      {/* Header Card */}
      <div className="card shadow-sm mb-4">
        <div className="card-body d-flex align-items-center justify-content-between">
          <div className="w-100">
            <h1 className="h4 fw-bold mb-1">Gestión de reservas</h1>
            <p className="mb-0 text-muted w-100">
              Aquí se listarán, crearán y eliminarán todas las reservas de tu
              complejo deportivo.
            </p>
          </div>

          <div className="w-100">
            <button
              onClick={handleAgregarReserva}
              className="btn btn-success btn-lg "
            >
              {showReservaForm ? "Cerrar Formulario" : "+ Agregar Reserva"}
            </button>
          </div>
        </div>
      </div>

      {/* Reserva table */}
      {/* Formulario Inline — Aparece arriba de la tabla */}
      {showReservaForm && (
        <div>
          <div className="card-body">
            <ReservaForm
              onSuccess={onReservaFormSuccess}
              onCancel={closeReservaForm}
            />
          </div>
        </div>
      )}
      <div className="card shadow-sm">
        <div className="card-body">
          <ReservaTable refreshKey={refreshKey} />
        </div>
      </div>
    </div>
  );
}
