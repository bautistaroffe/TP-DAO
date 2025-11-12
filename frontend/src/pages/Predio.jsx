import React from "react";
import { useNavigate } from "react-router-dom"; // Importamos useNavigate

export default function PredioPage() {
  const navigate = useNavigate(); // Inicializamos el hook useNavigate

  const secciones = [
    { nombre: "Canchas", descripcion: "Ver y modificar las canchas registradas.", path: "/predio/canchas" },
    { nombre: "Turnos", descripcion: "Administrar horarios y disponibilidad.", path: "/predio/turnos" },
    { nombre: "Usuarios", descripcion: "Gestionar clientes registrados.", path: "/predio/usuarios" },
    { nombre: "Pagos", descripcion: "Ver y administrar los pagos realizados.", path: "/predio/pagos" },
    { nombre: "Reservas", descripcion: "Consultar y modificar reservas activas.", path: "/predio/reservas" },
    { nombre: "Torneos", descripcion: "Administrar torneos y equipos.", path: "/predio/torneos" },
  ];

  // Función para manejar la navegación
  const handleNavigate = (path) => {
    navigate(path);
  };

  return (
    <div className="predio-page">
      <div className="predio-container">
        {/* === Encabezado con mismo estilo que Home === */}
        <section className="hero"> {/* Usamos la clase 'hero' existente para consistencia */}
          <h1>Gestión del Predio</h1>
          <p>Seleccioná una sección para administrar.</p>
        </section>

        <div className="predio-grid"> {/* Cambiado a 'predio-grid' para estilos específicos */}
          {secciones.map((sec) => (
            <div key={sec.nombre} className="predio-card"> {/* Cambiado a 'predio-card' */}
              <h3>{sec.nombre}</h3>
              <p>{sec.descripcion}</p>
              {/* Le pasamos el 'path' de cada sección al hacer clic */}
              <button onClick={() => handleNavigate(sec.path)}>
                Ingresar
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}