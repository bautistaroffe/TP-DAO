import React, { useState, useEffect } from 'react';
import { turnoService } from '../../services/turnoService.js';

const ESTADOS = ['disponible', 'reservado', 'cancelado'];

const TurnoForm = ({ idTurno, onSuccess, onCancel }) => {

    const isEditing = !!idTurno;

    const [formData, setFormData] = useState({
        id_cancha: 0,
        fecha: '', // Usaremos YYYY-MM-DD
        hora_inicio: '',
        hora_fin: '',
        estado: 'disponible',
    });

    const [loading, setLoading] = useState(false);
    const [formError, setFormError] = useState(null);
    const [validationErrors, setValidationErrors] = useState({});

    // --- LÓGICA DE HERRAMIENTAS ---

    // Función para obtener la fecha de hoy en formato YYYY-MM-DD local
    const getTodayISO = () => {
        const now = new Date();
        return now.toLocaleDateString('en-CA', { // 'en-CA' garantiza YYYY-MM-DD
            year: 'numeric', month: '2-digit', day: '2-digit'
        });
    };

    // Función para obtener la hora actual en HH:MM
    const getCurrentTime = () => {
        const now = new Date();
        return now.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit', hour12: false });
    };


    // 1. Cargar datos en modo edición
    useEffect(() => {
        if (isEditing) {
            setLoading(true);
            turnoService.obtenerTurnoPorId(idTurno)
                .then(data => {
                    // El DTO de Python ya debería devolver la fecha en YYYY-MM-DD (ISO)
                    // y la hora en HH:MM:SS. Substring(0, 5) funciona para hora.
                    setFormData({
                        ...data,
                        id_cancha: data.id_cancha || 0,
                        hora_inicio: data.hora_inicio ? data.hora_inicio.substring(0, 5) : '',
                        hora_fin: data.hora_fin ? data.hora_fin.substring(0, 5) : '',
                    });
                    setLoading(false);
                })
                .catch(err => {
                    setFormError(`No se pudo cargar el turno: ${err.message}`);
                    setLoading(false);
                });
        }
    }, [isEditing, idTurno]);

    // 2. Manejo de cambios
    const handleChange = (e) => {
        const { name, value } = e.target;

        let newValue = value;

        // 1. ID_CANCHA → convertir a entero
        if (name === 'id_cancha') {
            newValue = parseInt(value) || 0;
        }

        // 2. FECHA: Ya es YYYY-MM-DD si usamos type="date"

        // 3. HORA Inicio / Fin → HH:MM por type="time" (no requiere formateo)

        setFormData(prev => ({ ...prev, [name]: newValue }));

        // 4. LIMPIAR ERRORES SI EXISTEN
        if (validationErrors[name]) {
            setValidationErrors(prev => {
                const { [name]: removed, ...rest } = prev;
                return rest;
            });
        }
    };

    // 3. Validación del lado del cliente
    const validateForm = () => {
        const errors = {};
        const today = getTodayISO();
        const currentTime = getCurrentTime();
        const isToday = formData.fecha === today;

        // --- VALIDACIONES BÁSICAS ---
        if (!formData.id_cancha) errors.id_cancha = "Debe seleccionar una cancha.";
        if (!formData.fecha) errors.fecha = "Debe seleccionar una fecha.";
        if (!formData.hora_inicio) errors.hora_inicio = "Debe indicar hora de inicio.";
        if (!formData.hora_fin) errors.hora_fin = "Debe indicar hora de fin.";

        if (Object.keys(errors).length > 0) {
            setValidationErrors(errors);
            return false;
        }

        // --- VALIDACIONES DE LÓGICA DE TIEMPO ---

        // A. RANGO: Hora de inicio < Hora de fin
        if (formData.hora_inicio >= formData.hora_fin) {
            errors.hora_inicio = "La hora de inicio debe ser anterior a la de fin.";
            errors.hora_fin = "La hora de fin debe ser posterior a la de inicio.";
        }

        // B. FECHA PASADA
        if (formData.fecha < today && !isEditing) {
            errors.fecha = "No se pueden crear turnos en fechas pasadas.";
        }

        // C. HORA ACTUAL SOLO SI ES HOY Y MODO CREACIÓN
        if (isToday && !isEditing) {
            // Comprobación de hora de inicio contra la hora actual
            if (formData.hora_inicio <= currentTime) {
                errors.hora_inicio = `La hora de inicio debe ser posterior a la hora actual (${currentTime}).`;
            }
        }

        setValidationErrors(errors);
        return Object.keys(errors).length === 0;
    };


    // 4. Manejo del envío
    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            setFormError("Por favor, corrige los errores de validación antes de continuar.");
            return;
        }

        setLoading(true);
        setFormError(null);

        // PAYLOAD FINAL: La fecha ya es YYYY-MM-DD. Añadimos el :00 a la hora.
        const payload = {
            id_cancha: formData.id_cancha,
            fecha: formData.fecha, // YYYY-MM-DD
            hora_inicio: formData.hora_inicio + ':00', // HH:MM:00
            hora_fin: formData.hora_fin + ':00',
            estado: formData.estado,
        };

        try {
            if (isEditing) {
                // El backend debería esperar los campos a actualizar
                await turnoService.actualizarTurno(idTurno, payload);
            } else {
                await turnoService.crearTurno(payload);
            }
            onSuccess();
        } catch (err) {
            setFormError(`Error al ${isEditing ? 'actualizar' : 'crear'} el turno: ${err.message}`);
            console.error("Detalle del error de red/servidor:", err);
        } finally {
            setLoading(false);
        }
    };

    if (loading && isEditing) {
        return <div className="p-8 text-center text-indigo-500 animate-pulse">Cargando datos del turno...</div>;
    }

    return (
        <div className="max-w-xl mx-auto p-6 bg-white shadow-2xl rounded-xl mt-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 border-b pb-2">
                {isEditing ? `Modificar Turno (ID: ${idTurno})` : 'Crear Nuevo Turno'}
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

                {/* 1. ID Cancha */}
                <div className={validationErrors.id_cancha ? 'has-error' : ''}>
                    <label className="block text-sm font-medium text-gray-700">ID Cancha</label>
                    <input
                        type="number"
                        name="id_cancha"
                        value={formData.id_cancha || ''}
                        onChange={handleChange}
                        required
                        min="1"
                        step="1"
                        className={`mt-1 block w-full border ${validationErrors.id_cancha ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm p-2`}
                        disabled={loading}
                    />
                </div>

                {/* 2. Fecha */}
                <div className={validationErrors.fecha ? 'has-error' : ''}>
                    <label className="block text-sm font-medium text-gray-700">Fecha</label>
                    <input
                        type="date" // <--- ¡USAMOS TYPE="DATE" PARA FORMATO ISO SEGURO!
                        name="fecha"
                        value={formData.fecha}
                        onChange={handleChange}
                        required
                        className={`mt-1 block w-full border ${validationErrors.fecha ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm p-2 bg-white`}
                        disabled={loading}
                    />
                    {!isEditing && (
                        <p className="text-xs text-gray-500 mt-1">
                            Solo se permiten fechas futuras o la fecha de hoy al crear un turno.
                        </p>
                    )}
                </div>

                <div className="flex space-x-4">
                    {/* 3. Hora Inicio */}
                    <div className={`flex-1 ${validationErrors.hora_inicio ? 'has-error' : ''}`}>
                        <label className="block text-sm font-medium text-gray-700">Hora Inicio</label>
                        <input
                            type="time"
                            name="hora_inicio"
                            value={formData.hora_inicio}
                            onChange={handleChange}
                            required
                            step="60"
                            className={`mt-1 block w-full border ${validationErrors.hora_inicio ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm p-2 bg-white`}
                            disabled={loading}
                        />
                    </div>

                    {/* 4. Hora Fin */}
                    <div className={`flex-1 ${validationErrors.hora_fin ? 'has-error' : ''}`}>
                        <label className="block text-sm font-medium text-gray-700">Hora Fin</label>
                        <input
                            type="time"
                            name="hora_fin"
                            value={formData.hora_fin}
                            onChange={handleChange}
                            required
                            step="60"
                            className={`mt-1 block w-full border ${validationErrors.hora_fin ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm p-2 bg-white`}
                            disabled={loading}
                        />
                    </div>
                </div>


                {/* 5. Estado */}
                <div>
                    <label className="block text-sm font-medium text-gray-700">Estado</label>
                    <select
                        name="estado"
                        value={formData.estado}
                        onChange={handleChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 bg-white"
                        disabled={loading || !isEditing}
                    >
                        {ESTADOS.map(e => (
                            <option key={e} value={e}>{e.charAt(0).toUpperCase() + e.slice(1)}</option>
                        ))}
                    </select>
                    {!isEditing && <p className="text-xs text-gray-500 mt-1">El estado inicial es 'disponible' al crear.</p>}
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
                        disabled={loading}
                    >
                        {loading ? 'Guardando...' : (isEditing ? 'Guardar Cambios' : 'Crear Turno')}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default TurnoForm;