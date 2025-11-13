import React, { useState, useEffect } from 'react';
// Importaciones ajustadas a los nombres de funciones que me proporcionaste: obtenerCanchas y obtenerTurnos
import { reservaService } from '../../services/reservaService.js';
import { canchaService } from '../../services/canchaService.js';
import { turnoService } from '../../services/turnoService.js';
import { usuarioService } from '../../services/usuarioService.js';


/**
 * Formulario para la creación de una nueva Reserva.
 * Este formulario requiere cargar las listas de Canchas, Turnos y Usuarios (clientes).
 * @param {object} props - Propiedades del componente.
 * @param {function} props.onSuccess - Callback a ejecutar tras una operación exitosa.
 * @param {function} props.onCancel - Callback a ejecutar al cancelar.
 */
const ReservaForm = ({ onSuccess, onCancel }) => {

    // --- 1. ESTADOS DE DATOS ---
    const [canchas, setCanchas] = useState([]);
    const [turnos, setTurnos] = useState([]);
    const [clientes, setClientes] = useState([]);

    // --- 2. ESTADO DEL FORMULARIO (ReservaCreateRequest) ---
    const [formData, setFormData] = useState({
        id_cancha: '',
        id_turno: '',
        id_cliente: '',
        // id_torneo y id_servicio se omiten por ser opcionales y fuera del alcance inicial
    });

    // --- 3. ESTADOS DE CONTROL ---
    const [loading, setLoading] = useState(true);
    const [formError, setFormError] = useState(null);
    const [validationErrors, setValidationErrors] = useState({});

    // --- 4. DATOS DERIVADOS ---
    // Filtramos los turnos para mostrar solo los disponibles y de la cancha seleccionada
    const turnosFiltrados = turnos
        .filter(t =>
            // 1. Debe coincidir con la cancha seleccionada
            t.id_cancha === parseInt(formData.id_cancha) &&
            // 2. Debe estar disponible
            t.estado === 'disponible'
        )
        // 3. Opcional: ordenar por fecha y hora
        .sort((a, b) => {
            const dateA = new Date(`${a.fecha}T${a.hora_inicio}`);
            const dateB = new Date(`${b.fecha}T${b.hora_inicio}`);
            return dateA - dateB;
        });

    // --- 5. CARGA INICIAL DE DATOS ---
    useEffect(() => {
        const loadInitialData = async () => {
            setLoading(true);
            setFormError(null);
            try {
                // Usamos obtenerCanchas y obtenerTurnos según los archivos proporcionados
                const [canchasData, turnosData, clientesData] = await Promise.all([
                    canchaService.obtenerCanchas(),
                    turnoService.obtenerTurnos(),
                    usuarioService.obtenerUsuarios(),
                ]);

                // Filtramos clientes que no estén activos (asumiendo que solo se reservan a clientes activos)
                const clientesActivos = clientesData.filter(u => u.estado === 'activo');

                setCanchas(canchasData || []);
                setTurnos(turnosData || []);
                setClientes(clientesActivos || []);

                setLoading(false);
            } catch (err) {
                setFormError(`Error al cargar datos iniciales: ${err.message}. Asegúrese de que todos los servicios estén activos.`);
                console.error("Error cargando datos:", err);
                setLoading(false);
            }
        };

        loadInitialData();
    }, []);

    // --- 6. MANEJO DE CAMBIOS ---
    const handleChange = (e) => {
        const { name, value } = e.target;

        let newValue = value;
        // Convertir a número si es un ID, excepto si el valor es vacío
        if (['id_cancha', 'id_turno', 'id_cliente'].includes(name) && value !== '') {
            newValue = parseInt(value) || '';
        }

        setFormData(prev => ({ ...prev, [name]: newValue }));

        // Si cambia la cancha, reiniciamos el turno para forzar la selección correcta
        if (name === 'id_cancha') {
            setFormData(prev => ({ ...prev, id_turno: '' }));
        }

        // Limpiar errores de validación
        if (validationErrors[name]) {
             setValidationErrors(prev => {
                const { [name]: removed, ...rest } = prev;
                return rest;
            });
        }
    };

    // --- 7. VALIDACIÓN DEL LADO DEL CLIENTE ---
    const validateForm = () => {
        const errors = {};

        if (!formData.id_cancha || formData.id_cancha <= 0) {
            errors.id_cancha = "Debe seleccionar una cancha.";
        }
        if (!formData.id_turno || formData.id_turno <= 0) {
            errors.id_turno = "Debe seleccionar un turno disponible.";
        }
        if (!formData.id_cliente || formData.id_cliente <= 0) {
            errors.id_cliente = "Debe seleccionar un cliente.";
        }

        setValidationErrors(errors);
        return Object.keys(errors).length === 0;
    };


    // --- 8. MANEJO DEL ENVÍO ---
    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            setFormError("Por favor, corrige los errores de validación antes de continuar.");
            return;
        }

        setLoading(true);
        setFormError(null);

        // PAYLOAD (ReservaCreateRequest)
        const payload = {
            id_cancha: formData.id_cancha,
            id_turno: formData.id_turno,
            id_cliente: formData.id_cliente,
        };

        try {
            const result = await reservaService.crearReserva(payload);
            console.log(`✅ Operación crear reserva exitosa. Resultado:`, result);
            onSuccess();
        } catch (err) {
            setFormError(`Error al crear la reserva: ${err.message}`);
            console.error("Detalle del error de red/servidor:", err);
        } finally {
            setLoading(false);
        }
    };

    // --- 9. RENDERIZADO ---
    if (loading) {
        return <div className="p-8 text-center text-indigo-500 animate-pulse">Cargando datos para la reserva...</div>;
    }

    // Si no hay datos críticos para operar
    if (canchas.length === 0 || clientes.length === 0) {
        return (
            <div className="max-w-xl mx-auto p-6 bg-white shadow-2xl rounded-xl mt-6">
                <p className="text-red-600 font-semibold text-center">
                    ⚠️ No se pueden crear reservas: Faltan Canchas o Clientes Activos.
                </p>
                {formError && <p className="text-sm text-red-500 mt-2">{formError}</p>}
                <div className="text-center mt-4">
                    <button onClick={onCancel} className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300">Volver</button>
                </div>
            </div>
        );
    }

    // Función para mostrar el turno de forma legible
    const formatTurno = (turno) => {
        const horaInicio = turno.hora_inicio ? turno.hora_inicio.substring(0, 5) : 'N/A';
        const horaFin = turno.hora_fin ? turno.hora_fin.substring(0, 5) : 'N/A';
        // Asumiendo que la fecha viene como YYYY-MM-DD
        const [year, month, day] = turno.fecha.split('-');
        return `(${day}/${month}) ${horaInicio} - ${horaFin} (ID: ${turno.id_turno})`;
    };


    return (
        <div className="max-w-xl mx-auto p-6 bg-white shadow-2xl rounded-xl mt-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 border-b pb-2">
                Crear Nueva Reserva
            </h2>

            {(formError || Object.keys(validationErrors).length > 0) && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 text-sm" role="alert">
                    <p className='font-bold'>{formError || "Por favor, corrige los siguientes errores:"}</p>
                    <ul className='list-disc ml-4 mt-2'>
                        {Object.values(validationErrors).map((err, index) => <li key={index}>{err}</li>)}
                    </ul>
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">

                {/* 1. SELECCIÓN DE CANCHA */}
                <div className={validationErrors.id_cancha ? 'has-error' : ''}>
                    <label className="block text-sm font-medium text-gray-700">Cancha a Reservar</label>
                    <select
                        name="id_cancha"
                        value={formData.id_cancha}
                        onChange={handleChange}
                        required
                        className={`mt-1 block w-full border ${validationErrors.id_cancha ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm p-2 bg-white`}
                        disabled={loading}
                    >
                        <option value="">-- Seleccione una Cancha --</option>
                        {canchas.map(c => (
                            <option key={c.id_cancha} value={c.id_cancha}>
                                {c.nombre} ({c.tipo.toUpperCase()}) - ${c.precio_base}
                            </option>
                        ))}
                    </select>
                </div>

                {/* 2. SELECCIÓN DE TURNO */}
                <div className={validationErrors.id_turno ? 'has-error' : ''}>
                    <label className="block text-sm font-medium text-gray-700">Turno Disponible</label>
                    <select
                        name="id_turno"
                        value={formData.id_turno}
                        onChange={handleChange}
                        required
                        className={`mt-1 block w-full border ${validationErrors.id_turno ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm p-2 bg-white`}
                        disabled={loading || !formData.id_cancha}
                    >
                        <option value="">
                            {formData.id_cancha ? (turnosFiltrados.length > 0 ? '-- Seleccione un Turno --' : 'No hay turnos disponibles para esta cancha') : '-- Primero seleccione una Cancha --'}
                        </option>
                        {turnosFiltrados.map(t => (
                            <option key={t.id_turno} value={t.id_turno}>
                                {formatTurno(t)}
                            </option>
                        ))}
                    </select>
                    {!formData.id_cancha && <p className="text-xs text-gray-500 mt-1">Seleccione una cancha para ver los turnos disponibles.</p>}
                    {formData.id_cancha && turnosFiltrados.length === 0 && <p className="text-xs text-orange-500 mt-1">No se encontraron turnos disponibles para la cancha seleccionada. Cree un turno o elija otra cancha.</p>}
                </div>

                {/* 3. SELECCIÓN DE CLIENTE */}
                <div className={validationErrors.id_cliente ? 'has-error' : ''}>
                    <label className="block text-sm font-medium text-gray-700">Cliente</label>
                    <select
                        name="id_cliente"
                        value={formData.id_cliente}
                        onChange={handleChange}
                        required
                        className={`mt-1 block w-full border ${validationErrors.id_cliente ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm p-2 bg-white`}
                        disabled={loading}
                    >
                        <option value="">-- Seleccione un Cliente --</option>
                        {clientes.map(u => (
                            <option key={u.id_usuario} value={u.id_usuario}>
                                {u.nombre} {u.apellido} (DNI: {u.dni})
                            </option>
                        ))}
                    </select>
                    {clientes.length === 0 && <p className="text-xs text-orange-500 mt-1">No hay clientes activos para reservar.</p>}
                </div>

                {/* Botones de Acción */}
                <div className="flex justify-between pt-6">
                    <button
                        type="button"
                        onClick={onCancel}
                        className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition duration-150 disabled:opacity-50"
                        disabled={loading}
                    >
                        Cancelar
                    </button>

                    <button
                        type="submit"
                        className="px-4 py-2 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition duration-150 disabled:bg-indigo-400"
                        disabled={loading || !formData.id_turno}
                    >
                        {loading ? 'Reservando...' : 'Confirmar Reserva'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default ReservaForm;