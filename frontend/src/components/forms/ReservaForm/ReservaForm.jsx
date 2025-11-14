import React, { useState, useEffect } from 'react';
import { reservaService } from '../../../services/reservaService.js';
import { canchaService } from '../../../services/canchaService.js';
import { turnoService } from '../../../services/turnoService.js';
import { usuarioService } from '../../../services/usuarioService.js';
import { adicionalService } from "../../../services/serviciosAdicionalesService.js";
import { pagoService } from "../../../services/pagoService.js";

// Importamos los subcomponentes
import Step1CanchaTurno from './Step1CanchaTurno';
import Step2Servicios from './Step2Servicios';
import Step3Usuario from './Step3Usuario';
import Step4Resumen from './Step4Resumen';

const PRECIOS_ADICIONALES = {
    arbitro: 2000,
    partido_grabado: 1500,
    pecheras: 800,
    asado_por_persona: 500,
    paletas_por_unidad: 300,
};
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
// Regex para Teléfono (solo números, opcionalmente espacios, guiones o el signo +)
const PHONE_REGEX = /^[\d\s\-+]+$/;

/**
 * Componente principal que gestiona el flujo de reserva en múltiples pasos.
 * @param {function} props.onSuccess - Callback al completar la reserva.
 * @param {function} props.onCancel - Callback al cancelar.
 */
const ReservaForm = ({ onSuccess, onCancel }) => {

    // --- 1. ESTADOS DE DATOS ---
    const [canchas, setCanchas] = useState([]);
    const [turnos, setTurnos] = useState([]); // <-- CORRECCIÓN: Se mantiene aquí.

    // --- 2. ESTADO DEL FORMULARIO (Datos de la Reserva) ---
    const [formData, setFormData] = useState({
        id_cancha: '',
        id_turno: '',
        // [NUEVO CAMPO] Requerido para la carga dinámica de turnos:
        fecha_reserva: new Date().toISOString().slice(0, 10),
        servicios_adicionales: {
            cant_personas_asado: 0,
            arbitro: false,
            partido_grabado: false,
            pecheras: false,
            cant_paletas: 0,
        },
        metodo_pago: 'efectivo',
    });

    // --- 3. ESTADOS DE USUARIO (Paso 3) ---
    const [dniBusqueda, setDniBusqueda] = useState('');
    const [userData, setUserData] = useState(null);
    const [isNewUser, setIsNewUser] = useState(false);

    // --- 4. ESTADOS DE CONTROL Y FLUJO ---
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(true);
    const [formError, setFormError] = useState(null);
    const [validationErrors, setValidationErrors] = useState({});

    // ------------------------------------------------------------------
    // 5. LÓGICA DE CÁLCULO DE COSTOS (Derivados)
    // ------------------------------------------------------------------

    const calcularCostoAdicionales = () => { /* ... (Mantener lógica) ... */
        const s = formData.servicios_adicionales;
        let total = 0;
        if (s.arbitro) total += PRECIOS_ADICIONALES.arbitro;
        if (s.partido_grabado) total += PRECIOS_ADICIONALES.partido_grabado;
        if (s.pecheras) total += PRECIOS_ADICIONALES.pecheras;
        total += s.cant_personas_asado * PRECIOS_ADICIONALES.asado_por_persona;
        total += s.cant_paletas * PRECIOS_ADICIONALES.paletas_por_unidad;
        return total;
    };

    const canchaSeleccionada = canchas.find(c => c.id_cancha === formData.id_cancha);
    const turnoSeleccionado = turnos.find(t => t.id_turno === formData.id_turno);
    const costoBaseCancha = canchaSeleccionada ? canchaSeleccionada.precio_base : 0;
    const costoServicios = calcularCostoAdicionales();
    const costoTotal = costoBaseCancha + costoServicios;


    // ------------------------------------------------------------------
    // 6. CARGA INICIAL DE DATOS
    // ------------------------------------------------------------------

    // CORRECCIÓN: Separamos la carga de canchas (estática) y la carga de turnos (dinámica).
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

    // 🟢 NUEVO EFECTO: Carga dinámica de turnos disponibles al cambiar cancha/fecha
    useEffect(() => {
        const idCancha = formData.id_cancha;

        if (idCancha) {
            const loadTurnos = async () => {
                setLoading(true);
                try {
                    // 🚨 CRÍTICO: Usar un servicio que filtre por disponibilidad
                    // Asumimos que turnoService.listarTurnosDisponibles(idCancha, fecha) existe en tu backend.
                    const turnosData = await turnoService.listarTurnosDisponibles(idCancha);
                    setTurnos(turnosData || []);
                } catch (err) {
                    console.error("Fallo al cargar turnos disponibles:", err);
                    setTurnos([]);
                } finally {
                    setLoading(false);
                }
            };
            loadTurnos();
        } else {
            setTurnos([]);
        }
    }, [formData.id_cancha]);


    // ------------------------------------------------------------------
    // 7. MANEJO DE CAMBIOS (Cancha, Turno, Servicios, Pago)
    // ------------------------------------------------------------------

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;

        // Limpiar errores
        if (validationErrors[name]) {
             setValidationErrors(prev => {
                const { [name]: removed, ...rest } = prev;
                return rest;
            });
        }

        // 1. Lógica para IDs de Cancha/Turno/Fecha
        if (['id_cancha', 'id_turno'].includes(name)) {
            const newValue = value !== '' ? parseInt(value) : '';
            setFormData(prev => ({ ...prev, [name]: newValue }));
            if (name === 'id_cancha') {
                setFormData(prev => ({ ...prev, id_turno: '' })); // Resetear turno al cambiar cancha
            }
        } else if (name === 'fecha_reserva') {
             setFormData(prev => ({ ...prev, fecha_reserva: value, id_turno: '' })); // Resetear turno al cambiar fecha

        // 2. Lógica para Servicios Adicionales
        } else if (name.startsWith('servicio_')) { /* ... (Lógica de servicios) ... */
            const serviceKey = name.replace('servicio_', '');
            let newValue = type === 'checkbox' ? checked : parseInt(value) || 0;
            if (type !== 'checkbox' && newValue < 0) newValue = 0;

            setFormData(prev => ({
                ...prev,
                servicios_adicionales: {
                    ...prev.servicios_adicionales,
                    [serviceKey]: newValue
                }
            }));
        // 3. Lógica para Método de Pago
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    // --- Función para Cliente Nuevo --- (Mantener)
    const handleUserChange = (e) => {
        const { name, value } = e.target;
        setUserData(prev => ({ ...prev, [name]: value }));
    };


    // ------------------------------------------------------------------
    // 8. LÓGICA DE USUARIO (Paso 3) - Mantener
    // ------------------------------------------------------------------

    const handleDniSearch = async () => { /* ... (Mantener lógica de DNI) ... */
    if (!dniBusqueda || dniBusqueda.trim() === '') {
        setFormError("Ingrese el DNI del cliente.");
        return;
    }

    setUserData(null);
    setIsNewUser(false);
    setLoading(true);
    setFormError(null);

    try {
        const existingUser = await usuarioService.buscarUsuarioPorDNI(dniBusqueda.trim());

        if (existingUser) {
            setUserData(existingUser);
            setIsNewUser(false);
            setFormError(`✅ Cliente ${existingUser.nombre} ${existingUser.apellido} (DNI: ${existingUser.dni}) encontrado.`);
        } else {
            const newUserInitialData = { dni: dniBusqueda.trim(), nombre: '', apellido: '', telefono: '', email: '' };
            setUserData(newUserInitialData);
            setIsNewUser(true);
            setFormError("⚠️ Usuario no encontrado. Por favor, complete los datos obligatorios para crearlo.");
        }
    } catch (err) {
        console.error("Error buscando DNI:", err);
        const newUserInitialData = { dni: dniBusqueda.trim(), nombre: '', apellido: '', telefono: '', email: '' };
        setUserData(newUserInitialData);
        setIsNewUser(true);
        setFormError(`⛔ Error al buscar. Complete los campos.`);
    } finally {
        setLoading(false);
    }
};


    // ------------------------------------------------------------------
    // 9. VALIDACIÓN Y NAVEGACIÓN - Mantener
    // ------------------------------------------------------------------

    const validateStep = (currentStep) => { /* ... (Mantener lógica de validación) ... */
        const errors = {};

        if (currentStep === 1) { // Cancha y Turno
            if (!formData.id_cancha) errors.id_cancha = "Debe seleccionar una cancha.";
            if (!formData.id_turno) errors.id_turno = "Debe seleccionar un turno disponible.";
        }
        if (currentStep === 3) { // Datos del Usuario
        if (!userData) {
            errors.user = "Debe buscar el cliente por DNI.";
        } else if (isNewUser) {
            // Requeridos para nuevo usuario
            if (!userData.nombre) errors.nombre = "El nombre es obligatorio.";
            if (!userData.apellido) errors.apellido = "El apellido es obligatorio.";
            if (!userData.email) errors.email = "El email es obligatorio.";

            // Validación de Formato para campos de nuevo usuario
            if (userData.email && !EMAIL_REGEX.test(userData.email)) {
                 errors.email = "El email no tiene un formato válido.";
            }
            if (userData.telefono && !PHONE_REGEX.test(userData.telefono)) {
                 errors.telefono = "El teléfono contiene caracteres no válidos (solo números, +, -).";
            }
        }
    }
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
};

    const handleNext = () => { /* ... (Mantener lógica de next) ... */
        if (validateStep(step)) {
            setStep(prev => prev + 1);
            setFormError(null);
        } else {
            setFormError("Por favor, complete los campos requeridos antes de avanzar.");
        }
    };

    const handleBack = () => { /* ... (Mantener lógica de back) ... */
        setStep(prev => prev - 1);
        setFormError(null);
    };


    // ------------------------------------------------------------------
    // 10. MANEJO DEL ENVÍO FINAL (Paso 5: Confirmar) - Mantener lógica de pago
    // ------------------------------------------------------------------

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateStep(4) || !userData) {
             setFormError("Error en la validación final. Revise los pasos anteriores.");
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
                const newServicio = await adicionalService.crearServicioAdicional(formData.servicios_adicionales);
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
            const idReservaCreada = reservaCreada.reserva?.id_reserva

            if (!idReservaCreada) {
                throw new Error("No se pudo obtener el ID de la reserva recién creada. Revise la respuesta del servicio.");
            }

            // D. REGISTRAR PAGO EN BASE DE DATOS (Lógica Condicional por Estado)
            let estadoPago;
            let fechaPago = null;
            let mensajeUsuario;

            if (formData.metodo_pago === 'mercado_pago') {
                estadoPago = 'completado';
                fechaPago = new Date().toISOString().slice(0, 10);
                mensajeUsuario = `Reserva ${idReservaCreada} creada. Pago registrado como COMPLETADO.`;

            } else if (formData.metodo_pago === 'efectivo') {
                estadoPago = 'pendiente';
                mensajeUsuario = `Reserva ${idReservaCreada} creada. Pago registrado como PENDIENTE (Efectivo).`;

            } else {
                 estadoPago = null;
            }

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
                const pagoCreado = await pagoService.procesarPago(datosPago);

                alert(`${mensajeUsuario} ID Pago: ${pagoCreado.id_pago}`);
            } else {
                 alert(`Reserva ${idReservaCreada} creada. Sin registro de pago inicial (Método: ${formData.metodo_pago}).`);
            }

            onSuccess();
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

    // ... (El return del componente)
    return (
        <div className="max-w-xl mx-auto p-6 bg-white shadow-2xl rounded-xl mt-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 border-b pb-2">
                Paso {step} de 4 - Crear Nueva Reserva
            </h2>

            {/* Renderizado de Errores */}
            {(formError || Object.keys(validationErrors).length > 0) && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 text-sm" role="alert">
                    <p className='font-bold'>{formError || "Por favor, corrige los errores de validación:"}</p>
                    <ul className='list-disc ml-4 mt-2'>
                        {Object.values(validationErrors).map((err, index) => <li key={index}>{err}</li>)}
                    </ul>
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">

                {StepDisplay()}

                {/* Controles de Navegación */}
                <div className="flex justify-between pt-6">
                    <button
                        type="button"
                        onClick={step === 1 ? onCancel : handleBack}
                        className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition duration-150 disabled:opacity-50"
                        disabled={loading || step === 4}
                    >
                        {step === 1 ? 'Cancelar' : 'Anterior'}
                    </button>

                    {step < 4 && (
                        <button
                            type="button"
                            onClick={handleNext}
                            className="px-4 py-2 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition duration-150 disabled:bg-indigo-400"
                            disabled={loading || (step === 3 && !userData)}
                        >
                            Siguiente
                        </button>
                    )}

                    {step === 4 && (
                        <button
                            type="submit"
                            className="px-4 py-2 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition duration-150 disabled:bg-green-400"
                            disabled={loading}
                        >
                            {loading ? 'Procesando...' : 'CONFIRMAR Y PAGAR'}
                        </button>
                    )}
                </div>
            </form>
        </div>
    );
};

export default ReservaForm;