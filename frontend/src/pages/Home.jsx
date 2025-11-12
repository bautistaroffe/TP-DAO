import React, { useState } from 'react';
// 1. Importa el formulario que creamos anteriormente
import ReservaForm from '../components/forms/ReservaForm';

// Conviértelo a un componente de función para usar Hooks (useState)
export default function HomePage() {
  // 2. Estado para controlar la visibilidad del modal/formulario
  const [showReservaForm, setShowReservaForm] = useState(false);

  const handleOpenForm = () => {
    setShowReservaForm(true);
  };

  const handleCloseForm = () => {
    setShowReservaForm(false);
  };

  return (
    <div className="container home-page">
      
      {/* 3. Renderizado Condicional del Formulario (Modal) */}
      {showReservaForm && (
        <div className="modal-overlay">
          <div className="modal-content">
            <ReservaForm 
              onClose={handleCloseForm} 
            />
          </div>
        </div>
      )}

      <section className="hero">
        <h1>Bienvenido al Panel de Administración de Estadia </h1>
        <p>Desde aquí podés gestionar reservas, torneos y visualizar el estado del predio.</p>
        <div className="home-actions">
          {/* 4. Asigna el evento onClick para abrir el formulario */}
          <button onClick={handleOpenForm} disabled={showReservaForm}> 
            Crear Reserva
          </button>
          <button> Nuevo Torneo</button>
        </div>
      </section>

      <section className="gallery">
        <h3>Nuestras canchas</h3>
        <div className="gallery-grid">
          <img src="/canchas/F7.jpg" alt="Cancha 1" />
          <img src="/canchas/padel.jpg" alt="Cancha 2" />
          <img src="/canchas/basket.jpg" alt="Cancha 3" />
        </div>
      </section>

      <section className="map-section">
        <h3>Ubicación</h3>
        <iframe
          title="Ubicación EcoPark"
          src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3405.880562395233!2d-64.26842862459957!3d-31.38985667427392!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x94329f556c9207d3%3A0x5be585a19c7f870c!2zRXN0w6FkaWEgRsO6dGJvbA!5e0!3m2!1ses-419!2sar!4v1762714174268!5m2!1ses-419!2sar"
          width="100%"
          height="300"
          style={{border: 0}}
          allowFullScreen=""
          loading="lazy"
        ></iframe>
      </section>
    </div>
  );
}