import { useState, useEffect } from "react";
import { torneoService } from "../../services/torneoService.js";

const TorneoForm = ({ id_torneo, onSuccess, onCancel }) => {
  const isEditing = !!id_torneo;

  const [formData, setFormData] = useState({
    nombre: "",
    fecha_inicio: "",
    fecha_fin: "",
    categoria: "",
  });

  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

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
        });
        setLoading(false);
      })
      .catch((err) => {
        alert("Error al cargar torneo: " + err.message);
        setLoading(false);
      });
  }, [isEditing, id_torneo]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const payload = {
        nombre: formData.nombre,
        fecha_inicio: formData.fecha_inicio,
        fecha_fin: formData.fecha_fin,
        categoria: formData.categoria,
      };

      if (isEditing) {
        await torneoService.ActualizarTorneo(id_torneo, payload);
        setSuccessMessage("Torneo actualizado con éxito");
      } else {
        await torneoService.crearTorneo(payload);
        setSuccessMessage("Torneo creado con éxito");
      }

      // Show success window and wait for user to close it
      setShowSuccess(true);
    } catch (error) {
      alert(
        "Error al guardar torneo: " + (error.message || JSON.stringify(error))
      );
    }
  };

  const categorias = ["Sub 10", "Sub 12", "Sub 14", "Sub 16"];

  if (loading) {
    return (
      <div className="p-3 text-primary d-flex align-items-center">
        <div
          className="spinner-border me-2"
          role="status"
          style={{ width: "1.2rem", height: "1.2rem" }}
        >
          <span className="visually-hidden">Loading...</span>
        </div>
        Cargando torneo...
      </div>
    );
  }

  return (
    <div>
      {/* Success modal overlay */}
      {showSuccess && (
        <div
          className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center"
          style={{ zIndex: 1050, background: "rgba(0,0,0,0.5)" }}
        >
          <div
            className="bg-white rounded p-4 shadow"
            style={{ maxWidth: "480px", width: "90%" }}
          >
            <div className="d-flex flex-column text-center">
              <h5 className="text-success">{successMessage}</h5>
              <p className="mb-3">
                {isEditing ? (
                  "Los cambios fueron guardados correctamente."
                ) : (
                  <span>
                    El torneo <strong>{formData.nombre}</strong> fue creado con
                    éxito.
                  </span>
                )}
              </p>
              <div className="d-flex justify-content-center gap-2 mt-2">
                <button
                  className="btn btn-primary"
                  onClick={() => {
                    setShowSuccess(false);
                    if (onSuccess) onSuccess();
                  }}
                >
                  Aceptar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="d-flex align-items-start mt-5">
        <div className="text-start w-100 d-flex justify-content-center">
          <div className="card shadow-sm">
            <div
              className="card shadow p-5 w-100"
              style={{ maxWidth: "750px" }}
            >
              <h4 className="card-title text-primary fw-bold">
                {isEditing
                  ? `Editar Torneo (ID: ${id_torneo})`
                  : "Crear Torneo"}
              </h4>

              <div className="mb-3 w-100">
                <input
                  type="text"
                  name="nombre"
                  placeholder="Nombre del torneo"
                  value={formData.nombre}
                  onChange={handleChange}
                  className="form-control"
                  required
                />
              </div>

              <div className="row g-3 w-100">
                <div className="col-md-6">
                  <label className="form-label">Fecha Inicio</label>
                  <input
                    type="date"
                    name="fecha_inicio"
                    value={formData.fecha_inicio}
                    onChange={handleChange}
                    className="form-control"
                    required
                  />
                </div>

                <div className="col-md-6">
                  <label className="form-label">Fecha Fin</label>
                  <input
                    type="date"
                    name="fecha_fin"
                    value={formData.fecha_fin}
                    onChange={handleChange}
                    className="form-control"
                    required
                  />
                </div>
              </div>

              <div className="mb-3 mt-3 w-100">
                <label className="form-label">Categoría</label>
                <select
                  name="categoria"
                  value={formData.categoria}
                  onChange={handleChange}
                  className="form-select"
                  required
                >
                  <option value="">Seleccione categoría</option>
                  {categorias.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div className="d-flex justify-content-end gap-2 mt-3">
                <button
                  type="button"
                  onClick={onCancel}
                  className="btn btn-secondary"
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  className="btn btn-primary"
                  onClick={handleSubmit}
                >
                  {isEditing ? "Guardar Cambios" : "Crear Torneo"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TorneoForm;
