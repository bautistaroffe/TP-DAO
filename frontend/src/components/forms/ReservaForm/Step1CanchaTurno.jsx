import React from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const Step1CanchaTurno = ({
  formData,
  handleChange,
  canchas,
  turnos,
  validationErrors,
  loading,
}) => {
  // Filtrar turnos por cancha seleccionada
  const turnosDeCancha = formData.id_cancha
    ? turnos.filter((t) => t.id_cancha === Number(formData.id_cancha))
    : [];

  // Fechas únicas disponibles
  const fechasDisponibles = [...new Set(turnosDeCancha.map((t) => t.fecha))];

  // Filtrar horarios según fecha elegida
  const horariosDisponibles = formData.fecha
    ? turnosDeCancha
        .filter((t) => t.fecha === formData.fecha)
        .sort(
          (a, b) =>
            new Date(`${a.fecha}T${a.hora_inicio}`) -
            new Date(`${b.fecha}T${b.hora_inicio}`)
        )
    : [];

  return (
    <div className="d-flex align-items-start mt-4">
      <div className="text-start w-100 d-flex justify-content-center">
        <div className="card shadow p-4 w-100" style={{ maxWidth: "700px" }}>
          <h4 className="mb-3 text-primary fw-bold text-center">
            Seleccione cancha y turno
          </h4>
          <h6 className="text-secondary mb-4 text-center">Paso 1 de 4</h6>

          {/* Selección de cancha */}
          <div className="mb-3 w-100">
            <label htmlFor="id_cancha" className="form-label fw-semibold">
              Cancha
            </label>
            <select
              id="id_cancha"
              name="id_cancha"
              value={formData.id_cancha}
              onChange={(e) => {
                handleChange(e);
                // Resetear fecha y turno cuando cambia la cancha
                handleChange({ target: { name: "fecha", value: "" } });
                handleChange({ target: { name: "id_turno", value: "" } });
              }}
              className={`form-select ${
                validationErrors.id_cancha ? "is-invalid" : ""
              }`}
              disabled={loading}
            >
              <option value="">Seleccione una cancha</option>
              {canchas.map((c) => (
                <option key={c.id_cancha} value={c.id_cancha}>
                  {c.nombre} - ${c.precio_base}
                </option>
              ))}
            </select>

            {validationErrors.id_cancha && (
              <div className="invalid-feedback">
                {validationErrors.id_cancha}
              </div>
            )}
          </div>

          {/* Selección de fecha (DatePicker) */}
          <div className="mb-3 w-100">
            <label className="form-label fw-semibold w-100">Fecha</label>
            <div className="mb-3 w-100">
              <DatePicker
                selected={
                  formData.fecha ? new Date(`${formData.fecha}T00:00:00`) : null
                }
                onChange={(fecha) => {
                  const iso = fecha.toISOString().split("T")[0];
                  handleChange({
                    target: { name: "fecha", value: iso },
                  });
                  // Reset turno
                  handleChange({
                    target: { name: "id_turno", value: "" },
                  });
                }}
                className="form-control w-100"
                placeholderText="Seleccione una fecha"
                dateFormat="dd/MM/yyyy"
                disabled={!formData.id_cancha}
                filterDate={(date) =>
                  fechasDisponibles.includes(date.toISOString().split("T")[0])
                }
              />
              {!formData.id_cancha && (
                <small className="text-muted w-100">
                  Primero seleccione una cancha.
                </small>
              )}
            </div>
          </div>

          {/* Selección de horario */}
          <div className="mb-3 w-100">
            <label className="form-label fw-semibold">Horario</label>
            <select
              id="id_turno"
              name="id_turno"
              value={formData.id_turno}
              onChange={handleChange}
              className={`form-select ${
                validationErrors.id_turno ? "is-invalid" : ""
              }`}
              disabled={!formData.fecha || horariosDisponibles.length === 0}
            >
              <option value="">
                {formData.fecha
                  ? horariosDisponibles.length > 0
                    ? "Seleccione un horario"
                    : "No hay horarios disponibles"
                  : "Seleccione una fecha"}
              </option>

              {horariosDisponibles.map((t) => (
                <option key={t.id_turno} value={t.id_turno}>
                  {t.hora_inicio.substring(0, 5)} - {t.hora_fin.substring(0, 5)}
                </option>
              ))}
            </select>

            {validationErrors.id_turno && (
              <div className="invalid-feedback">
                {validationErrors.id_turno}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Step1CanchaTurno;
