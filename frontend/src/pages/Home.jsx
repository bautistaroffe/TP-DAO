import React, { useState } from 'react';
import ReservaForm from '../components/forms/ReservaForm/ReservaForm.jsx';
import TorneoForm from '../components/forms/TorneoForm.jsx';

export default function HomePage() {
  // Estados de cada modal
  const [showReservaForm, setShowReservaForm] = useState(false);
  const [showTorneoForm, setShowTorneoForm] = useState(false);

  // Abrir/Cerrar Reserva
  const handleOpenReserva = () => setShowReservaForm(true);
  const handleCloseReserva = () => setShowReservaForm(false);

  // Abrir/Cerrar Torneo
  const handleOpenTorneo = () => setShowTorneoForm(true);
  const handleCloseTorneo = () => setShowTorneoForm(false);

  // MODAL — si está abierto el de Reserva
  if (showReservaForm) {
    return (
      <div className="fixed inset-0 bg-gray-900 bg-opacity-80 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          <ReservaForm
            onSuccess={handleCloseReserva}
            onCancel={handleCloseReserva}
          />
        </div>
      </div>
    );
  }

  // MODAL — si está abierto el de Torneo
  if (showTorneoForm) {
    return (
      <div className="fixed inset-0 bg-gray-900 bg-opacity-80 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          <TorneoForm
            onSuccess={handleCloseTorneo}
            onCancel={handleCloseTorneo}
          />
        </div>
      </div>
    );
  }

  // CONTENIDO NORMAL
  return (
    <div className="container home-page p-8">
      <section className="hero bg-indigo-50 p-6 rounded-xl shadow-lg mb-8">
        <h1 className="text-4xl font-extrabold text-indigo-800 mb-2">
          Bienvenido al Panel de Administración de Estadia
        </h1>

        <p className="text-lg text-gray-600 mb-4">
          Desde aquí podés gestionar reservas, torneos y visualizar el estado del predio.
        </p>

        <div className="home-actions flex space-x-4">
          <button
            onClick={handleOpenReserva}
            className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg shadow-md transition duration-300"
          >
            Crear Reserva
          </button>

          <button
            onClick={handleOpenTorneo}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg shadow-md transition duration-300"
          >
            Nuevo Torneo
          </button>
        </div>
      </section>

      {/* resto de la página igual */}
    </div>
  );
}
