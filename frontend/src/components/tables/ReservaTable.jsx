import React, { useState, useEffect } from "react";
import { reservaService } from "../../services/reservaService.js";
import { turnoService } from "../../services/turnoService.js";
import { usuarioService } from "../../services/usuarioService.js";

const ReservaTable = ({ refreshKey }) => {
  // Estados
  const [reservas, setReservas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [confirmId, setConfirmId] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Lógica de carga de datos
  const loadReservas = async () => {
    try {
      const data = await reservaService.obtenerReservas();

      // Para cada reserva, obtener el turno correspondiente
      const reservasConTurno = await Promise.all(
        data.map(async (reserva) => {
          try {
            const turno = await turnoService.obtenerTurnoPorId(
              reserva.id_turno
            );
            const cliente = await usuarioService.obtenerUsuarioPorId(
              reserva.id_cliente
            );
            return {
              ...reserva,
              turno_fecha: `${turno.fecha} - ${turno.hora_inicio.slice(0, 5)}`,
              nombre_cliente: `${cliente.nombre} ${cliente.apellido}`,
            };
          } catch {
            return { ...reserva, turno_fecha: "N/D", nombre_cliente: "N/D" };
          }
        })
      );

      setReservas(reservasConTurno);
      setError(null);
    } catch (err) {
      setError(
        "Error al cargar la lista de reservas. Revisa la conexión con el Backend."
      );
      console.error("Detalle del error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReservas();
  }, [refreshKey]);

  // ---------------------------------
  // Lógica de Acciones
  // ---------------------------------

  const handleEliminar = (id_reserva) => {
    setConfirmId(id_reserva); // Abre el modal de confirmación
  };

  const cancelDeletion = () => {
    setConfirmId(null);
  };

  const confirmDeletion = async () => {
    const idToDelete = confirmId;
    if (!idToDelete) return;

    setIsDeleting(true);
    setError(null); // Limpiar errores previos

    try {
      // Llama al servicio de eliminación
      await reservaService.eliminarReserva(idToDelete);

      // Actualiza la lista en el estado
      //setReservas((prev) => prev.filter((r) => r.id_reserva !== idToDelete));
      loadReservas(); // Recarga la lista completa desde el backend
      console.log(`Reserva ${idToDelete} eliminada con éxito.`);
    } catch (err) {
      // Captura el mensaje de error detallado del servicio
      setError(`Error al eliminar la reserva: ${err.message}`);
      console.error("Error de eliminación:", err);
    } finally {
      setIsDeleting(false);
      cancelDeletion(); // Cierra el modal de confirmación
    }
  };

  // Encuentra la reserva a eliminar para mostrar el ID en el modal
  const reservaToDelete = reservas.find((r) => r.id_reserva === confirmId);

  // ---------------------------------
  // Componente de Fila
  // ---------------------------------
  const ReservaRow = ({ reserva }) => {
    // Lógica de clases para el estado de la reserva (Bootstrap)
    let estadoClase = "text-muted";
    if (reserva.estado === "confirmada") {
      estadoClase = "text-success fw-bold";
    } else if (reserva.estado === "cancelada") {
      estadoClase = "text-danger fw-bold";
    } else if (reserva.estado === "pendiente") {
      estadoClase = "text-warning fw-bold";
    }

    // Formateo de monto como moneda (asumiendo moneda local)
    const montoFormateado = reserva.precio_total.toLocaleString("es-AR", {
      style: "currency",
      currency: "ARS",
    });

    return (
      <tr>
        <td className="text-nowrap px-4">{reserva.id_reserva}</td>
        <td className="text-nowrap px-4">{reserva.id_cancha}</td>
        <td className="text-nowrap px-4">{reserva.turno_fecha}</td>
        <td className="text-nowrap px-4">{reserva.nombre_cliente}</td>
        <td className="text-nowrap px-4">{reserva.id_torneo || "N/A"}</td>
        <td className="text-nowrap px-4">{reserva.id_servicio || "N/A"}</td>
        <td className="text-nowrap px-4 fw-semibold text-primary">
          {montoFormateado}
        </td>
        <td className={`${estadoClase} text-nowrap px-4`}>
          {reserva.estado.toUpperCase()}
        </td>
        <td className="text-nowrap px-4">{reserva.origen}</td>

        {/* Celda de Acciones */}
        <td className="text-nowrap px-4">
          <div className="d-flex gap-1">
            <button
              onClick={() => handleEliminar(reserva.id_reserva)}
              className="btn btn-danger btn-sm"
              style={{ fontSize: "0.9rem", padding: "0.1rem 0.4rem" }}
              aria-label={`Eliminar Reserva ${reserva.id_reserva}`}
              disabled={isDeleting}
            >
              Eliminar
            </button>
          </div>
        </td>
      </tr>
    );
  };

  // ---------------------------------
  // Renderizado Principal
  // ---------------------------------

  // Visualización del error detallado (Bootstrap)
  const ErrorDisplay = () => (
    <div className="alert alert-danger text-center mx-auto mt-4" role="alert">
      <strong>Error:</strong> {error}
    </div>
  );

  // Renderizado Condicional...
  if (loading)
    return (
      <div className="alert alert-info text-center">
        Cargando datos de reservas...
      </div>
    );
  if (reservas.length === 0)
    return (
      <div className="alert alert-secondary text-center">
        No se encontraron reservas registradas.
      </div>
    );

  return (
    <div>
      {error && <ErrorDisplay />}
      <div className="card shadow-sm mt-4">
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-hover table-sm mb-0">
              <thead className="table-primary">
                <tr>
                  <th
                    scope="col"
                    className="text-center medium text-grey text-uppercase"
                  >
                    ID
                  </th>
                  <th
                    scope="col"
                    className="text-center medium text-grey text-uppercase"
                  >
                    Cancha
                  </th>
                  <th
                    scope="col"
                    className="text-center medium text-grey text-uppercase"
                  >
                    Turno
                  </th>
                  <th
                    scope="col"
                    className="text-center medium text-grey text-uppercase"
                  >
                    Cliente
                  </th>
                  <th
                    scope="col"
                    className="text-center medium text-grey text-uppercase"
                  >
                    Torneo
                  </th>
                  <th
                    scope="col"
                    className="text-center medium text-grey text-uppercase"
                  >
                    Servicio
                  </th>
                  <th
                    scope="col"
                    className="text-center medium text-grey text-uppercase"
                  >
                    Precio Total
                  </th>
                  <th
                    scope="col"
                    className="text-center medium text-grey text-uppercase"
                  >
                    Estado
                  </th>
                  <th
                    scope="col"
                    className="text-center medium text-grey text-uppercase"
                  >
                    Origen
                  </th>
                  <th
                    scope="col"
                    className="text-center medium text-grey text-uppercase"
                  >
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody>
                {reservas.map((reserva) => (
                  <ReservaRow key={reserva.id_reserva} reserva={reserva} />
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modal de Confirmación de Eliminación */}
      {confirmId && reservaToDelete && (
        // Modal overlay
        <div
          className="modal d-block"
          tabIndex="-1"
          role="dialog"
          style={{ background: "rgba(0,0,0,0.6)" }}
        >
          <div className="modal-dialog modal-dialog-centered" role="document">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title text-danger">
                  Confirmar Eliminación
                </h5>
              </div>
              <div className="modal-body">
                <p>
                  ¿Está seguro de que desea eliminar la reserva con ID:{" "}
                  <strong className="text-danger">{confirmId}</strong>? Esta
                  reserva es por{" "}
                  <strong>{reservaToDelete.precio_total.toFixed(2)}</strong>.
                  Esta acción no se puede deshacer.
                </p>
              </div>
              <div className="modal-footer">
                <button
                  onClick={cancelDeletion}
                  className="btn btn-secondary"
                  disabled={isDeleting}
                >
                  Cancelar
                </button>
                <button
                  onClick={confirmDeletion}
                  className={`btn btn-danger ${isDeleting ? "disabled" : ""}`}
                  disabled={isDeleting}
                >
                  {isDeleting ? "Eliminando..." : "Eliminar"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReservaTable;
