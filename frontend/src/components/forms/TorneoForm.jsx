import { useState, useEffect } from "react";
import { torneoService } from "../../services/torneoService.js";

const TorneoForm = ({ id_torneo, onSuccess, onCancel }) => {
  const isEditing = !!id_torneo;

  const [formData, setFormData] = useState({
    nombre: "",
    fecha_inicio: "",
    fecha_fin: "",
    categoria: "",
    ids_canchas: [],
    hora_inicio: "08:00",
    hora_fin: "20:00",
  });

  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const categorias = ["Sub 10", "Sub 12", "Sub 14", "Sub 16"];

  // Simulación de canchas disponibles
  const canchasDisponibles = [
    { id: 1, nombre: "Cancha 1" },
    { id: 2, nombre: "Cancha 2" },
    { id: 3, nombre: "Cancha 3" },
    { id: 4, nombre: "Cancha 4" },
  ];

  // Cargar torneo si estamos editando
  useEffect(() => {
    if (!isEditing) return;
    setLoading(true);

    torneoService
      .obtenerTorneoPorId(id_torneo)
      .then((data) => {
        setFormData({
          nombre: data.nombre ?? "",
          fecha_inicio: data.fecha_inicio ?? "",
          fecha_fin: data.fecha_fin ?? "",
          categoria: data.categoria ?? "",
          ids_canchas: data.ids_canchas ?? [],
          hora_inicio: data.hora_inicio ?? "08:00",
          hora_fin: data.hora_fin ?? "20:00",
        });
        setLoading(false);
      })
      .catch((err) => {
        alert("Error al cargar torneo: " + err.message);
        setLoading(false);
      });
  }, [isEditing, id_torneo]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleCheckboxChange = (id) => {
    const selected = [...formData.ids_canchas];
    if (selected.includes(id)) {
      setFormData({ ...formData, ids_canchas: selected.filter((c) => c !== id) });
    } else {
      selected.push(id);
      setFormData({ ...formData, ids_canchas: selected });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = {
        nombre: formData.nombre,
        fecha_inicio: formData.fecha_inicio,
        fecha_fin: formData.fecha_fin,
        categoria: formData.categoria,
      };

      let torneoCreado;
      if (isEditing) {
        torneoCreado = await torneoService.ActualizarTorneo(id_torneo, payload);
        setSuccessMessage("Torneo actualizado con éxito");
      } else {
        torneoCreado = await torneoService.crearTorneo(payload);
        setSuccessMessage("Torneo creado con éxito");

        // Generar reservas con canchas seleccionadas
        const reservasPayload = {
          ids_canchas: formData.ids_canchas,
          fecha_inicio: formData.fecha_inicio,
          fecha_fin: formData.fecha_fin,
          hora_inicio: formData.hora_inicio,
          hora_fin: formData.hora_fin,
          id_cliente: 1,
          id_servicio: null,
          origen: "torneo",
        };

        await torneoService.generarReservasTorneo(torneoCreado.id_torneo, reservasPayload);
      }

      setShowSuccess(true);
    } catch (error) {
      alert("Error al guardar torneo: " + (error.message || JSON.stringify(error)));
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-3 text-primary d-flex align-items-center">
        <div className="spinner-border me-2" role="status" style={{ width: "1.2rem", height: "1.2rem" }}>
          <span className="visually-hidden">Loading...</span>
        </div>
        Cargando...
      </div>
    );
  }

  return (
    <div>
      {showSuccess && (
        <div className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center" style={{ zIndex: 1050, background: "rgba(0,0,0,0.5)" }}>
          <div className="bg-white rounded p-4 shadow" style={{ maxWidth: "480px", width: "90%" }}>
            <div className="d-flex flex-column text-center">
              <h5 className="text-success">{successMessage}</h5>
              <p className="mb-3">
                {isEditing
                  ? "Los cambios fueron guardados correctamente."
                  : `El torneo ${formData.nombre} fue creado con éxito y se generaron reservas automáticamente.`}
              </p>
              <button className="btn btn-primary" onClick={() => { setShowSuccess(false); if (onSuccess) onSuccess(); }}>Aceptar</button>
            </div>
          </div>
        </div>
      )}

      <div className="d-flex align-items-start mt-5 justify-content-center">
        <div className="card shadow-sm w-100" style={{ maxWidth: "750px" }}>
          <div className="card shadow p-5 w-100">
            <h4 className="card-title text-primary fw-bold">
              {isEditing ? `Editar Torneo (ID: ${id_torneo})` : "Crear Torneo"}
            </h4>

            <form className="mt-4" onSubmit={handleSubmit}>
              <div className="mb-3">
                <input type="text" name="nombre" placeholder="Nombre del torneo" value={formData.nombre} onChange={handleChange} className="form-control" required />
              </div>

              <div className="row g-3 mb-3">
                <div className="col-md-6">
                  <label className="form-label">Fecha Inicio</label>
                  <input type="date" name="fecha_inicio" value={formData.fecha_inicio} onChange={handleChange} className="form-control" required />
                </div>
                <div className="col-md-6">
                  <label className="form-label">Fecha Fin</label>
                  <input type="date" name="fecha_fin" value={formData.fecha_fin} onChange={handleChange} className="form-control" required />
                </div>
              </div>

              <div className="mb-3">
                <label className="form-label">Categoría</label>
                <select name="categoria" value={formData.categoria} onChange={handleChange} className="form-select" required>
                  <option value="">Seleccione categoría</option>
                  {categorias.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div className="mb-3">
                <label className="form-label">Canchas</label>
                <div className="d-flex flex-wrap gap-3">
                  {canchasDisponibles.map((c) => (
                    <div className="form-check" key={c.id}>
                      <input
                        type="checkbox"
                        id={`cancha-${c.id}`}
                        checked={formData.ids_canchas.includes(c.id)}
                        onChange={() => handleCheckboxChange(c.id)}
                        className="form-check-input"
                      />
                      <label className="form-check-label" htmlFor={`cancha-${c.id}`}>{c.nombre}</label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="row g-3 mb-3">
                <div className="col-md-6">
                  <label className="form-label">Hora Inicio</label>
                  <input type="time" name="hora_inicio" value={formData.hora_inicio} onChange={handleChange} className="form-control" required />
                </div>
                <div className="col-md-6">
                  <label className="form-label">Hora Fin</label>
                  <input type="time" name="hora_fin" value={formData.hora_fin} onChange={handleChange} className="form-control" required />
                </div>
              </div>

              <div className="d-flex justify-content-end gap-2 mt-3">
                <button type="button" onClick={onCancel} className="btn btn-secondary">Cancelar</button>
                <button type="submit" className="btn btn-primary">{isEditing ? "Guardar Cambios" : "Crear Torneo"}</button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TorneoForm;






