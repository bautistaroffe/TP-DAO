export default function PredioPage() {
  const secciones = [
    { nombre: "Canchas", descripcion: "Ver y modificar las canchas registradas." },
    { nombre: "Turnos", descripcion: "Administrar horarios y disponibilidad." },
    { nombre: "Usuarios", descripcion: "Gestionar clientes registrados." },
    { nombre: "Pagos", descripcion: "Ver y administrar los pagos realizados." },
    { nombre: "Reservas", descripcion: "Consultar y modificar reservas activas." },
    { nombre: "Torneos", descripcion: "Administrar torneos y equipos." },
  ];

  return (
    <div className="predio-page">
      <div className="predio-container">
        {/* === Encabezado con mismo estilo que Home === */}
        <section className="hero">
          <h1>Gestión del Predio</h1>
          <p>Seleccioná una sección para administrar.</p>
        </section>

        <div className="grid">
          {secciones.map((sec) => (
            <div key={sec.nombre} className="card">
              <h3>{sec.nombre}</h3>
              <p>{sec.descripcion}</p>
              <button>Ingresar</button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}