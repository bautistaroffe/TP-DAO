import React, { useState, useEffect } from "react";
import { reservaService } from "../../../services/reservaService.js";
import { canchaService } from "../../../services/canchaService.js";
import { turnoService } from "../../../services/turnoService.js";
import { usuarioService } from "../../../services/usuarioService.js";
import { adicionalService } from "../../../services/serviciosAdicionalesService.js";
import { pagoService } from "../../../services/pagoService.js";
import { correoService } from "../../../services/correoService.js"; // <-- ¡IMPORTACIÓN NECESARIA!

// Importamos los subcomponentes
import Step1CanchaTurno from "./Step1CanchaTurno";
import Step2Servicios from "./Step2Servicios";
import Step3Usuario from "./Step3Usuario";
import Step4Resumen from "./Step4Resumen";
import PaymentSimulation from "./PaymentSimulation";

const PRECIOS_ADICIONALES = {
  arbitro: 2000,
  partido_grabado: 1500,
  pecheras: 800,
  asado_por_persona: 500,
  paletas_por_unidad: 300,
};
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_REGEX = /^[\d\s\-+]+$/;

/**
 * Componente principal que gestiona el flujo de reserva en múltiples pasos.
 * @param {function} props.onSuccess - Callback al completar la reserva.
 * @param {function} props.onCancel - Callback al cancelar.
 */
const ReservaForm = ({ onSuccess, onCancel }) => {
  // --- 1. ESTADOS DE DATOS ---
  const [canchas, setCanchas] = useState([]);
  const [turnos, setTurnos] = useState([]);

  // --- 2. ESTADO DEL FORMULARIO (Datos de la Reserva) ---
  const [formData, setFormData] = useState({
    id_cancha: "",
    id_turno: "",
    fecha_reserva: new Date().toISOString().slice(0, 10),
    servicios_adicionales: {
      cant_personas_asado: 0,
      arbitro: false,
      partido_grabado: false,
      pecheras: false,
      cant_paletas: 0,
    },
    metodo_pago: "efectivo",
  });

  // --- 3. ESTADOS DE USUARIO (Paso 3) ---
  const [dniBusqueda, setDniBusqueda] = useState("");
  const [userData, setUserData] = useState(null);
  const [isNewUser, setIsNewUser] = useState(false);

  // --- 4. ESTADOS DE CONTROL Y FLUJO ---
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(true);
  const [formError, setFormError] = useState(null);
  const [validationErrors, setValidationErrors] = useState({});

  // --- ESTADOS DE PAGO/FLUJO ---
  const [isSimulatingPayment, setIsSimulatingPayment] = useState(false);
  const [paymentData, setPaymentData] = useState(null);

  // ------------------------------------------------------------------
  // 5. LÓGICA DE CÁLCULO DE COSTOS (Derivados)
  // ------------------------------------------------------------------

  const calcularCostoAdicionales = () => {
    const s = formData.servicios_adicionales;
    let total = 0;
    if (s.arbitro) total += PRECIOS_ADICIONALES.arbitro;
    if (s.partido_grabado) total += PRECIOS_ADICIONALES.partido_grabado;
    if (s.pecheras) total += PRECIOS_ADICIONALES.pecheras;
    total += s.cant_personas_asado * PRECIOS_ADICIONALES.asado_por_persona;
    total += s.cant_paletas * PRECIOS_ADICIONALES.paletas_por_unidad;
    return total;
  };

  const canchaSeleccionada = canchas.find(
    (c) => c.id_cancha === formData.id_cancha
  );
  const turnoSeleccionado = turnos.find(
    (t) => t.id_turno === formData.id_turno
  );
  const costoBaseCancha = canchaSeleccionada
    ? canchaSeleccionada.precio_base
    : 0;
  const costoServicios = calcularCostoAdicionales();
  const costoTotal = costoBaseCancha + costoServicios;

  // ------------------------------------------------------------------
  // 6. CARGA INICIAL DE DATOS
  // ------------------------------------------------------------------

  useEffect(() => {
    const loadCanchas = async () => {
      setLoading(true);
      try {
        const canchasData = await canchaService.obtenerCanchas();
        setCanchas(canchasData || []);
      } catch (err) {
        setFormError(`Error al cargar canchas: ${err.message}.`);
      } finally {
        setLoading(false);
      }
    };
    loadCanchas();
  }, []);

  // Carga dinámica de turnos disponibles al cambiar cancha/fecha (asumiendo que el servicio filtra)
  useEffect(() => {
    const idCancha = formData.id_cancha;
    const fecha = formData.fecha_reserva;

    if (idCancha && fecha) {
      const loadTurnos = async () => {
        setLoading(true);
        try {
          const turnosData = await turnoService.listarTurnosDisponibles(
            idCancha
          );
          setTurnos(turnosData || []);
        } catch (err) {
          console.error("Fallo al cargar turnos disponibles:", err);
          setFormError(`Error al cargar turnos disponibles: ${err.message}.`);
          setTurnos([]);
        } finally {
          setLoading(false);
        }
      };
      loadTurnos();
    } else {
      setTurnos([]);
    }
  }, [formData.id_cancha, formData.fecha_reserva]);

  // ------------------------------------------------------------------
  // 7. MANEJO DE CAMBIOS (Cancha, Turno, Servicios, Pago)
  // ------------------------------------------------------------------

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (validationErrors[name]) {
      setValidationErrors((prev) => {
        const { [name]: removed, ...rest } = prev;
        return rest;
      });
    }

    if (["id_cancha", "id_turno"].includes(name)) {
      const newValue = value !== "" ? parseInt(value) : "";
      setFormData((prev) => ({ ...prev, [name]: newValue }));
      if (name === "id_cancha") {
        setFormData((prev) => ({ ...prev, id_turno: "" }));
      }
    } else if (name === "fecha_reserva") {
      setFormData((prev) => ({ ...prev, fecha_reserva: value, id_turno: "" }));
    } else if (name.startsWith("servicio_")) {
      const serviceKey = name.replace("servicio_", "");
      let newValue = type === "checkbox" ? checked : parseInt(value) || 0;
      if (type !== "checkbox" && newValue < 0) newValue = 0;

      setFormData((prev) => ({
        ...prev,
        servicios_adicionales: {
          ...prev.servicios_adicionales,
          [serviceKey]: newValue,
        },
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleUserChange = (e) => {
    const { name, value } = e.target;
    setUserData((prev) => ({ ...prev, [name]: value }));
  };

  // ------------------------------------------------------------------
  // 8. LÓGICA DE USUARIO (Paso 3)
  // ------------------------------------------------------------------

  const handleDniSearch = async () => {
    if (!dniBusqueda || dniBusqueda.trim() === "") {
      setFormError("Ingrese el DNI del cliente.");
      return;
    }

    setUserData(null);
    setIsNewUser(false);
    setLoading(true);
    setFormError(null);

    try {
      const existingUser = await usuarioService.buscarUsuarioPorDNI(
        dniBusqueda.trim()
      );

      if (existingUser) {
        setUserData(existingUser);
        setIsNewUser(false);
        setFormError(
          `✅ Cliente ${existingUser.nombre} ${existingUser.apellido} (DNI: ${existingUser.dni}) encontrado.`
        );
      } else {
        const newUserInitialData = {
          dni: dniBusqueda.trim(),
          nombre: "",
          apellido: "",
          telefono: "",
          email: "",
        };
        setUserData(newUserInitialData);
        setIsNewUser(true);
        setFormError(
          "⚠️ Usuario no encontrado. Por favor, complete los datos obligatorios para crearlo."
        );
      }
    } catch (err) {
      console.error("Error buscando DNI:", err);
      const newUserInitialData = {
        dni: dniBusqueda.trim(),
        nombre: "",
        apellido: "",
        telefono: "",
        email: "",
      };
      setUserData(newUserInitialData);
      setIsNewUser(true);
      setFormError(`⛔ Error al buscar. Complete los campos.`);
    } finally {
      setLoading(false);
    }
  };

  // ------------------------------------------------------------------
  // 9. VALIDACIÓN Y NAVEGACIÓN
  // ------------------------------------------------------------------

  const validateStep = (currentStep) => {
    const errors = {};

    if (currentStep === 1) {
      // Cancha y Turno
      if (!formData.id_cancha)
        errors.id_cancha = "Debe seleccionar una cancha.";
      if (!formData.id_turno)
        errors.id_turno = "Debe seleccionar un turno disponible.";
    }
    if (currentStep === 3) {
      // Datos del Usuario
      if (!userData) {
        errors.user = "Debe buscar el cliente por DNI.";
      } else if (isNewUser) {
        if (!userData.nombre) errors.nombre = "El nombre es obligatorio.";
        if (!userData.apellido) errors.apellido = "El apellido es obligatorio.";
        if (!userData.email) errors.email = "El email es obligatorio.";

        if (userData.email && !EMAIL_REGEX.test(userData.email)) {
          errors.email = "El email no tiene un formato válido.";
        }
        if (userData.telefono && !PHONE_REGEX.test(userData.telefono)) {
          errors.telefono =
            "El teléfono contiene caracteres no válidos (solo números, +, -).";
        }
      }
    }
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(step)) {
      setStep((prev) => prev + 1);
      setFormError(null);
    } else {
      setFormError(
        "Por favor, complete los campos requeridos antes de avanzar."
      );
    }
  };

  const handleBack = () => {
    setStep((prev) => prev - 1);
    setFormError(null);
  };

  // ------------------------------------------------------------------
  // 10. MANEJO DEL ENVÍO FINAL (handleSubmit)
  // ------------------------------------------------------------------

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateStep(4) || !userData) {
      setFormError(
        "Error en la validación final. Revise los pasos anteriores."
      );
      return;
    }

    setLoading(true);
    setFormError(null);

    try {
      let idClienteFinal = userData.id_usuario;
      let idServicioFinal = null;

      // A. CREAR OBTENER USUARIO (Si es nuevo)
      if (isNewUser) {
        const newUser = await usuarioService.crearUsuario(userData);
        idClienteFinal = newUser.id_usuario;
      }

      // B. CREAR SERVICIO ADICIONAL (Si hay costo)
      if (costoServicios > 0) {
        const newServicio = await adicionalService.crearServicioAdicional(
          formData.servicios_adicionales
        );
        idServicioFinal = newServicio.id_servicio;
      }

      // C. CREAR RESERVA
      const payload = {
        id_cancha: formData.id_cancha,
        id_turno: formData.id_turno,
        id_cliente: idClienteFinal,
        id_servicio: idServicioFinal,
        precio_total: costoTotal,
        metodo_pago: formData.metodo_pago,
      };

      const reservaCreada = await reservaService.crearReserva(payload);
      const idReservaCreada = reservaCreada.reserva?.id_reserva;

      if (!idReservaCreada) {
        throw new Error(
          "No se pudo obtener el ID de la reserva recién creada. Revise la respuesta del servicio."
        );
      }

      // D. REGISTRAR PAGO EN BASE DE DATOS (Lógica Condicional por Estado)
      let estadoPago;
      let fechaPago = null;
      let mensajeUsuario;

      if (formData.metodo_pago === "mercado_pago") {
        estadoPago = "completado";
        fechaPago = new Date().toISOString().slice(0, 10);
        mensajeUsuario = `Reserva ${idReservaCreada} creada. Pago registrado como COMPLETADO.`;
      } else if (formData.metodo_pago === "efectivo") {
        estadoPago = "pendiente";
        mensajeUsuario = `Reserva ${idReservaCreada} creada. Pago registrado como PENDIENTE (Efectivo).`;
      } else {
        estadoPago = null;
      }

      let pagoCreado = null;
      if (estadoPago) {
        const datosPago = {
          id_usuario: idClienteFinal,
          id_reserva: idReservaCreada,
          monto: costoTotal,
          metodo: formData.metodo_pago,
          estado_transaccion: estadoPago,
        };
        if (fechaPago) {
          datosPago.fecha_pago = fechaPago;
        }
        pagoCreado = await pagoService.procesarPago(datosPago);

        // Actualizar mensaje para incluir el ID del pago
        mensajeUsuario += ` ID Pago: ${pagoCreado.id_pago}`;
      } else {
        alert(
          `Reserva ${idReservaCreada} creada. Sin registro de pago inicial (Método: ${formData.metodo_pago}).`
        );
      }

      // 🚨 E. ENVÍO DE CORREO (Solo si el pago fue COMPLETADO, asumiendo que pagoCreado no es null)
      if (estadoPago === "completado" && pagoCreado) {
        // Obtenemos los datos necesarios para el comprobante
        const datosComprobante = {
          email_contacto: userData.email,
          id_reserva: idReservaCreada,
          // Aseguramos que turnoSeleccionado/canchaSeleccionada no sean null
          dia_reserva: turnoSeleccionado?.fecha || "N/A",
          hora_turno: turnoSeleccionado
            ? `${turnoSeleccionado.hora_inicio.substring(
                0,
                5
              )} - ${turnoSeleccionado.hora_fin.substring(0, 5)}`
            : "N/A",
          nombre_cancha: canchaSeleccionada?.nombre || "N/A",
          monto_reserva: costoTotal,

          metodo_pago:
            formData.metodo_pago === "mercado_pago"
              ? "Mercado Pago"
              : "Efectivo (Pagado)",
          nombre_usuario: `${userData.nombre} ${userData.apellido}`,
        };

        // Llamada al servicio de correo
        await correoService.enviarComprobante(datosComprobante);
      }

      // F. LÓGICA DE SIMULACIÓN DE PAGO (Si es completado por Mercado Pago)
      if (
        formData.metodo_pago === "mercado_pago" &&
        estadoPago === "completado"
      ) {
        setPaymentData({
          reservaId: idReservaCreada,
          monto: costoTotal,
          clienteNombre: `${userData.nombre} ${userData.apellido}`,
          clienteEmail: userData.email, // <-- ¡Email para la simulación!
          pagoId: pagoCreado.id_pago,
        });
        setIsSimulatingPayment(true); // Activa la simulación de pantalla
        return; // Detenemos la ejecución aquí
      }

      alert(mensajeUsuario);
      onSuccess(); // Finaliza si no hubo simulación de MP
    } catch (err) {
      setFormError(`Error en el proceso de reserva/pago: ${err.message}`);
      console.error("Detalle del error:", err);
    } finally {
      setLoading(false);
    }
  };

  // ------------------------------------------------------------------
  // 11. RENDERIZADO
  // ------------------------------------------------------------------

  if (isSimulatingPayment) {
    return (
      <div className="max-w-xl mx-auto p-6 bg-white shadow-2xl rounded-xl mt-6">
        {/* Renderiza el componente de simulación */}
        <PaymentSimulation
          data={paymentData}
          onPaymentComplete={onSuccess} // Llama al onSuccess del padre (cierra el modal)
        />
      </div>
    );
  }

  const StepDisplay = () => {
    switch (step) {
      case 1:
        return (
          <Step1CanchaTurno
            formData={formData}
            handleChange={handleChange}
            canchas={canchas}
            turnos={turnos}
            validationErrors={validationErrors}
            loading={loading}
          />
        );
      case 2:
        return (
          <Step2Servicios
            formData={formData}
            handleChange={handleChange}
            PRECIOS_ADICIONALES={PRECIOS_ADICIONALES}
            canchaSeleccionada={canchaSeleccionada}
          />
        );
      case 3:
        return (
          <Step3Usuario
            dniBusqueda={dniBusqueda}
            setDniBusqueda={setDniBusqueda}
            userData={userData}
            isNewUser={isNewUser}
            loading={loading}
            setLoading={setLoading}
            setUserData={setUserData}
            setIsNewUser={setIsNewUser}
            setFormError={setFormError}
            handleUserChange={handleUserChange}
            validationErrors={validationErrors}
            handleDniSearch={handleDniSearch}
          />
        );
      case 4:
        return (
          <Step4Resumen
            canchaSeleccionada={canchaSeleccionada}
            turnoSeleccionado={turnoSeleccionado}
            userData={userData}
            formData={formData}
            handleChange={handleChange}
            costoBaseCancha={costoBaseCancha}
            costoServicios={costoServicios}
            costoTotal={costoTotal}
            turnos={turnos}
          />
        );
      default:
        return (
          <Step4Resumen
            canchaSeleccionada={canchaSeleccionada}
            turnoSeleccionado={turnoSeleccionado}
            userData={userData}
            formData={formData}
            handleChange={handleChange}
            costoBaseCancha={costoBaseCancha}
            costoServicios={costoServicios}
            costoTotal={costoTotal}
            turnos={turnos}
          />
        );
    }
  };

  return (
    <div className="container mt-4">
      <div className="card shadow p-3">
        <h2 className="h5 fw-bold text-dark mb-3 border-bottom pb-2">
          Paso {step} de 4 - Crear Nueva Reserva
        </h2>

        {/* Renderizado de Errores */}
        {(formError || Object.keys(validationErrors).length > 0) && (
          <div className="alert alert-danger mb-3" role="alert">
            <p className="fw-bold mb-1">
              {formError || "Por favor, corrige los errores de validación:"}
            </p>
            <ul className="mb-0">
              {Object.values(validationErrors).map((err, index) => (
                <li key={index}>{err}</li>
              ))}
            </ul>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {StepDisplay()}

          {/* Controles de Navegación */}
          <div className="d-flex justify-content-between pt-3">
            <button
              type="button"
              onClick={step === 1 ? onCancel : handleBack}
              className="btn btn-outline-secondary"
              disabled={loading || step === 4}
            >
              {step === 1 ? "Cancelar" : "Anterior"}
            </button>

            {step < 4 && (
              <button
                type="button"
                onClick={handleNext}
                className="btn btn-primary"
                disabled={loading || (step === 3 && !userData)}
              >
                Siguiente
              </button>
            )}

            {step === 4 && (
              <button
                type="submit"
                className="btn btn-success"
                disabled={loading}
              >
                {loading ? "Procesando..." : "CONFIRMAR Y PAGAR"}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default ReservaForm;
