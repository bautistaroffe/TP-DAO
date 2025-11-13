import React, { useState } from 'react';
import ReservaForm from '../components/forms/ReservaForm.jsx'; // 1. Importa el formulario, asumiendo la ruta correcta

// Conviértelo a un componente de función para usar Hooks (useState)
export default function HomePage() {
  // 2. Estado para controlar la visibilidad del modal/formulario
  const [showReservaForm, setShowReservaForm] = useState(false);

  const handleOpenForm = () => {
    setShowReservaForm(true);
  };

  const handleCloseForm = () => {
    setShowReservaForm(false);
    // Nota: Aquí se podría agregar lógica para refrescar datos de la página principal si fuera necesario
  };

  // 3. Renderizado Condicional del Formulario (Modal)
  if (showReservaForm) {
    return (
        // Estilo Modal/Overlay para centrar el formulario
        <div className="fixed inset-0 bg-gray-900 bg-opacity-80 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <ReservaForm
                    onSuccess={handleCloseForm} // Cierra y potencialmente refresca al éxito
                    onCancel={handleCloseForm} // Cierra al cancelar
                />
            </div>
        </div>
    );
  }

  // Contenido de la Página Principal
  return (
    <div className="container home-page p-8">


      <section className="hero bg-indigo-50 p-6 rounded-xl shadow-lg mb-8">
        <h1 className="text-4xl font-extrabold text-indigo-800 mb-2">Bienvenido al Panel de Administración de Estadia </h1>
        <p className="text-lg text-gray-600 mb-4">Desde aquí podés gestionar reservas, torneos y visualizar el estado del predio.</p>
        <div className="home-actions flex space-x-4">
          {/* 4. Asigna el evento onClick para abrir el formulario */}
          <button
            onClick={handleOpenForm}
            className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg shadow-md transition duration-300"
          >
            Crear Reserva
          </button>
          <button className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg shadow-md transition duration-300">
            Nuevo Torneo
          </button>
        </div>
      </section>

      <section className="gallery mb-8">
        <h3 className="text-2xl font-semibold text-gray-800 mb-4">Nuestras canchas</h3>
        <div className="gallery-grid grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Imágenes restauradas */}
          <img className="rounded-lg shadow-md w-full h-auto object-cover" src="/canchas/F7.jpg" alt="Cancha 1" />
          <img className="rounded-lg shadow-md w-full h-auto object-cover" src="/canchas/padel.jpg" alt="Cancha 2" />
          <img className="rounded-lg shadow-md w-full h-auto object-cover" src="/canchas/basket.jpg" alt="Cancha 3" />
        </div>
      </section>

      <section className="map-section">
        <h3 className="text-2xl font-semibold text-gray-800 mb-4">Ubicación</h3>
        <div className="rounded-xl shadow-xl overflow-hidden">
        {/* Iframe de Google Maps restaurado */}
        <iframe
          title="Ubicación EcoPark"
          src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3405.880562395233!2d-64.26842862459957!3d-31.38985667427392!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x94329f556c9207d3%3A0x5be585a19c7f870c!2zRXN0w6FkaWEgRsO6dGJvbA!5e0!3m2!1ses-419!2sar!4v1762714174268!5m2!1ses-419!2sar"
          width="100%"
          height="300"
          style={{border: 0}}
          allowFullScreen=""
          loading="lazy"
        ></iframe>
        </div>
      </section>
    </div>
  );
}