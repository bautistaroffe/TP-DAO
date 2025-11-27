import React, { useState, useEffect } from "react";

const PaymentSimulation = ({ data, onPaymentComplete }) => {
  const [status, setStatus] = useState("loading"); // 'loading' o 'confirmed'

  // Simula el tiempo que lleva procesar el pago
  useEffect(() => {
    const timer = setTimeout(() => {
      // Después de 3 segundos, simulamos la confirmación exitosa
      setStatus("confirmed");
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  const handleAceptar = () => {
    // Ejecuta el callback que cierra el formulario principal
    onPaymentComplete();
  };

  if (status === "loading") {
    return (
      <div className="d-flex flex-column align-items-center justify-content-center p-4 bg-info bg-opacity-10 min-vh-25">
        <div
          className="spinner-border text-primary mb-3"
          style={{ width: "3rem", height: "3rem" }}
          role="status"
        >
          <span className="visually-hidden">Loading...</span>
        </div>
        <h5 className="mb-2 text-primary">Simulando Pasarela de Pago</h5>
        <p className="text-muted">Conectando con Mercado Pago...</p>
        <p className="small mt-2 text-muted">Esto puede tomar unos segundos.</p>
      </div>
    );
  }

  // Pantalla de Confirmación
  return (
    <div className="p-4 bg-white rounded shadow">
      <div className="text-center">
        <img
          src="/logoMP.png"
          alt="Logo del Complejo"
          className="rounded-circle mb-3"
          style={{ width: "200px", height: "100px" }}
        />

        <h4 className="h4 fw-bold text-success mb-2">¡Pago Confirmado!</h4>
        <p className="text-muted mb-2">
          Tu reserva ha sido pagada y confirmada exitosamente.
        </p>
        {/* Mensaje de correo */}
        {data.clienteEmail && (
          <p className="small fw-semibold text-primary">
            Se ha enviado el comprobante a: <strong>{data.clienteEmail}</strong>
          </p>
        )}
      </div>

      <div className="border border-light p-3 rounded bg-light mt-3">
        <div className="d-flex justify-content-between mb-1 text-dark">
          <span>Cliente:</span>
          <span className="fw-semibold">{data.clienteNombre}</span>
        </div>
        <div className="d-flex justify-content-between mb-1 text-dark">
          <span>ID de Reserva:</span>
          <span className="font-monospace text-primary">{data.reservaId}</span>
        </div>
        <div className="d-flex justify-content-between align-items-center pt-2 border-top mt-2">
          <span className="fw-bold fs-5 text-success">Monto Pagado:</span>
          <span className="fs-5 fw-bold text-success">
            ${data.monto.toFixed(2)}
          </span>
        </div>
      </div>

      <div className="text-center mt-3">
        <button onClick={handleAceptar} className="btn btn-primary w-100">
          Aceptar y Volver
        </button>
      </div>
    </div>
  );
};

export default PaymentSimulation;
