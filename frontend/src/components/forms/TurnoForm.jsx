import React, { useState, useEffect } from 'react';
import { turnoService } from '../../services/turnoService.js';

const ESTADOS = ['disponible', 'reservado', 'cancelado'];

const TurnoForm = ({ idTurno, onSuccess, onCancel }) => {

    // Modo Edición si idTurno es un valor válido (no null, no undefined)
    const isEditing = !!idTurno;

    // Estado inicial (adaptado al TurnoDTO)
    const [formData, setFormData] = useState({
        id_cancha: 0,
        fecha: '', // Formato YYYY-MM-DD
        hora_inicio: '', // Formato HH:MM
        hora_fin: '', // Formato HH:MM
        estado: 'disponible',
    });

    const [loading, setLoading] = useState(false);
    const [formError, setFormError] = useState(null);
    const [validationErrors, setValidationErrors] = useState({});

    // 1. Cargar datos en modo edición
    useEffect(() => {
        if (isEditing) {
            setLoading(true);
            turnoService.obtenerTurnoPorId(idTurno)
                .then(data => {
                    // Formatear la fecha y horas para inputs HTML
                    const formattedData = {
                        ...data,
                        id_cancha: data.id_cancha || 0,
                        // El backend ya debería devolver la fecha en formato YYYY-MM-DD
                        fecha: data.fecha || '',
                        // El backend devuelve hora_inicio/fin como HH:MM:SS. El input type="time" requiere HH:MM.
                        hora_inicio: data.hora_inicio ? data.hora_inicio.substring(0, 5) : '',
                        hora_fin: data.hora_fin ? data.hora_fin.substring(0, 5) : '',
                    };
                    setFormData(formattedData);
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
        const { name, value, type } = e.target;

        let newValue = value;

        if (name === 'id_cancha') {
            newValue = parseInt(value) || 0; // Aseguramos que sea número entero
        }

        setFormData(prev => ({ ...prev, [name]: newValue }));

        // Limpiar errores de validación
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
        const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD de hoy

        // Campo requerido: ID Cancha
        if (!formData.id_cancha || formData.id_cancha <= 0) {
            errors.id_cancha = "El ID de la cancha es obligatorio y debe ser un número positivo.";
        }

        // Campo requerido: Fecha
        if (!formData.fecha) {
            errors.fecha = "Debe seleccionar una fecha.";
        } else {
             // VALIDACIÓN DE FECHA PASADA
             // Solo se aplica en modo CREACIÓN
            if (!isEditing && formData.fecha < today) {
                errors.fecha = "No se pueden crear turnos con fechas pasadas.";
            }
        }

        // Campo requerido: Hora
        if (!formData.hora_inicio) {
            errors.hora_inicio = "Debe indicar la hora de inicio.";
        }
        if (!formData.hora_fin) {
            errors.hora_fin = "Debe indicar la hora de fin.";
        }

        // Validación lógica de horas: hora_inicio < hora_fin
        if (formData.hora_inicio && formData.hora_fin) {
            if (formData.hora_inicio >= formData.hora_fin) {
                errors.hora_fin = "La hora de fin debe ser posterior a la hora de inicio.";
                errors.hora_inicio = errors.hora_inicio || "La hora de inicio debe ser anterior a la hora de fin.";
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

        // PAYLOAD: Asegurar que las horas tengan el formato HH:MM:SS para el DTO de Python
        const payload = {
            id_cancha: formData.id_cancha,
            fecha: formData.fecha,
            hora_inicio: formData.hora_inicio + ':00',
            hora_fin: formData.hora_fin + ':00',
            estado: formData.estado,
        };

        try {
            if (isEditing) {
                await turnoService.actualizarTurno(idTurno, payload);
                console.log(`✅ Operación actualizar exitosa. Turno ID: ${idTurno}`);
            } else {
                const result = await turnoService.crearTurno(payload);
                console.log(`✅ Operación crear exitosa. Resultado:`, result);
            }
            // Si tiene éxito, llama al callback del componente padre
            onSuccess();
        } catch (err) {
            // El servicio devuelve el mensaje de error del backend (ej: duplicado)
            setFormError(`Error al ${isEditing ? 'actualizar' : 'crear'} el turno: ${err.message}`);
            console.error("Detalle del error de red/servidor:", err);
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
                        type="date"
                        name="fecha"
                        value={formData.fecha}
                        onChange={handleChange}
                        required
                        className={`mt-1 block w-full border ${validationErrors.fecha ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm p-2 bg-white`}
                        disabled={loading}
                    />
                    {!isEditing && <p className="text-xs text-gray-500 mt-1">Solo se permiten fechas futuras al crear un turno.</p>}
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
                        disabled={loading || !isEditing} // Estado solo editable si estamos modificando
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