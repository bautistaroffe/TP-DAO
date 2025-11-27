import React from "react";

const formatTurno = (turno) => {
  if (!turno || !turno.fecha || !turno.hora_inicio || !turno.hora_fin) {
    return "Turno no disponible";
  }
  const horaInicio = turno.hora_inicio.substring(0, 5);
  const horaFin = turno.hora_fin.substring(0, 5);
  const [year, month, day] = turno.fecha.split("-");
  return `${day}/${month} de ${horaInicio} a ${horaFin}`;
};

/**
 * Componente para el Paso 4: Resumen de la Reserva y Selección de Pago.
 * @param {object} props - Propiedades recibidas desde ReservaForm.jsx
 * @param {object} props.canchaSeleccionada - DTO de la cancha.
 * @param {object} props.userData - DTO del usuario encontrado/a crear.
 * @param {object} props.formData - Datos del formulario (incluye metodo_pago).
 * @param {function} props.handleChange - Función para manejar cambios (solo para metodo_pago).
 * @param {number} props.costoBaseCancha - Costo base.
 * @param {number} props.costoServicios - Costo total de adicionales.
 * @param {number} props.costoTotal - Monto total final.
 * @param {Array<object>} props.turnos - Lista completa de turnos para buscar.
 */
const Step4Resumen = ({
  canchaSeleccionada,
  userData,
  formData,
  handleChange,
  costoBaseCancha,
  costoServicios,
  costoTotal,
  turnos,
}) => {
  // Buscar el turno seleccionado para el display legible
  const turnoSeleccionado = turnos.find(
    (t) => t.id_turno === formData.id_turno
  );

  // Contar cuántos servicios fueron seleccionados
  const totalServiciosSeleccionados = Object.values(
    formData.servicios_adicionales
  ).filter((val) => val > 0 || val === true).length;

  if (!canchaSeleccionada || !turnoSeleccionado || !userData) {
    return (
      <div className="text-center p-3 border border-danger rounded bg-light text-danger">
        <p className="mb-0">
          ⛔ <strong>Error:</strong> Falta información clave (Cancha, Turno o
          Cliente) para generar el resumen.
        </p>
        <p className="small mt-1">Por favor, vuelva a los pasos anteriores.</p>
      </div>
    );
  }

  return (
    <div className="mb-4">
      <h5 className="text-primary fw-bold">Resumen y Pago</h5>

      {/* Detalle de la Reserva */}
      <div className="border p-3 rounded bg-info bg-opacity-10 border-info mb-3">
        <h6 className="fw-bold mb-2 text-info border-bottom pb-1">
          Detalle de la Reserva
        </h6>
        <p className="mb-1">
          <strong>Cancha:</strong> {canchaSeleccionada.nombre} (
          {canchaSeleccionada.tipo})
        </p>
        <p className="mb-1">
          <strong>Turno:</strong> {formatTurno(turnoSeleccionado)}
        </p>
        <p className="mb-0">
          <strong>Cliente:</strong> {userData.nombre} {userData.apellido} (DNI:{" "}
          {userData.dni})
        </p>
      </div>

      {/* Resumen de Costos */}
      <div className="border p-3 rounded shadow bg-white mb-3">
        <h6 className="fw-bold mb-2">Cálculo de Monto</h6>
        <div>
          <div className="d-flex justify-content-between mb-1 text-muted">
            <span>Precio Base Cancha:</span>
            <span className="fw-semibold font-monospace">
              ${costoBaseCancha.toFixed(2)}
            </span>
          </div>
          <div className="d-flex justify-content-between border-bottom pb-2 mb-2">
            <span>
              Servicios Adicionales ({totalServiciosSeleccionados} ítems):
            </span>
            <span className="fw-semibold font-monospace">
              ${costoServicios.toFixed(2)}
            </span>
          </div>
        </div>

        <div className="d-flex justify-content-between align-items-center pt-3">
          <span className="fw-bold h5 text-success mb-0">
            MONTO TOTAL A PAGAR:
          </span>
          <span className="h5 fw-bold text-success mb-0">
            ${costoTotal.toFixed(2)}
          </span>
        </div>
      </div>

      {/* Selección de Método de Pago */}
      <div className="mb-3">
        <h6 className="fw-medium text-dark">Método de Pago</h6>
        <div className="d-flex flex-column flex-sm-row gap-3">
          {/* Opción 1: Efectivo */}
          <label
            className={`d-flex align-items-center gap-3 border p-3 rounded flex-fill ${
              formData.metodo_pago === "efectivo"
                ? "border-warning bg-warning bg-opacity-10"
                : "border-light bg-white"
            }`}
          >
            <input
              type="radio"
              name="metodo_pago"
              value="efectivo"
              checked={formData.metodo_pago === "efectivo"}
              onChange={handleChange}
              className="form-check-input me-2"
            />
            <div>
              <div className="fw-semibold">Efectivo</div>
              <small className="text-muted">
                Se registra la reserva y se paga al momento de usarla.
              </small>
            </div>
          </label>

          {/* Opción 2: Mercado Pago */}
          <label
            className={`d-flex align-items-center gap-3 border p-3 rounded flex-fill ${
              formData.metodo_pago === "mercado_pago"
                ? "border-primary bg-primary bg-opacity-10"
                : "border-light bg-white"
            }`}
          >
            <input
              type="radio"
              name="metodo_pago"
              value="mercado_pago"
              checked={formData.metodo_pago === "mercado_pago"}
              onChange={handleChange}
              className="form-check-input me-2"
            />
            <div>
              <div className="fw-semibold">Mercado Pago</div>
              <small className="text-muted">
                Pago online. Se requiere pago inmediato para confirmar.
              </small>
            </div>
          </label>
        </div>
      </div>
    </div>
  );
};

export default Step4Resumen;
