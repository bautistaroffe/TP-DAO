import React from "react";
import { useNavigate } from "react-router-dom"; // Importamos useNavigate

export default function PredioPage() {
  const navigate = useNavigate(); // Inicializamos el hook useNavigate

  const secciones = [
    {
      nombre: "Canchas",
      descripcion: "Ver y administrar las canchas registradas.",
      path: "/predio/canchas",
    },
    {
      nombre: "Turnos",
      descripcion: "Administrar horarios y disponibilidad.",
      path: "/predio/turnos",
    },
    {
      nombre: "Usuarios",
      descripcion: "Gestionar clientes registrados.",
      path: "/predio/usuarios",
    },
    {
      nombre: "Pagos",
      descripcion: "Ver y administrar los pagos realizados.",
      path: "/predio/pagos",
    },
    {
      nombre: "Reservas",
      descripcion: "Consultar y eliminar reservas activas.",
      path: "/predio/reservas",
    },
    {
      nombre: "Torneos",
      descripcion: "Administrar torneos y equipos.",
      path: "/predio/torneos",
    },
  ];

  // Función para manejar la navegación
  const handleNavigate = (path) => {
    navigate(path);
  };

  return (
    <div className="container py-4">
      {/* Header */}
      <section className="hero">
        {" "}
        {/* Usamos la clase 'hero' existente para consistencia */}
        <h1>Gestión del Predio</h1>
        <p>Seleccioná una sección para administrar.</p>
      </section>
      {/* Grid de secciones */}
      <div className="row g-3">
        {secciones.map((sec) => (
          <div className="col-12 col-sm-6 col-md-4" key={sec.nombre}>
            <div className="card h-100 shadow-sm">
              <div className="card-body d-flex flex-column">
                <h5 className="card-title">{sec.nombre}</h5>
                <p className="card-text text-muted flex-grow-1">
                  {sec.descripcion}
                </p>
                <div className="mt-3">
                  <button
                    className="btn btn-primary"
                    style={{ backgroundColor: "#1e3a8a", color: "white" }}
                    onClick={() => handleNavigate(sec.path)}
                    aria-label={`Ingresar a ${sec.nombre}`}
                  >
                    Ingresar
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
