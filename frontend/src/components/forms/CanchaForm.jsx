import React, { useState, useEffect } from 'react';
import { canchaService } from '../../services/canchaService.js';

// --- Definiciones de Reglas de Negocio ---
const CONDICIONES = {
    futbol: {
        superficies: ['Sintético', 'Cemento'],
        tamaños: ['7', '5'],
    },
    padel: {
        superficies: ['Sintético', 'Cemento'],
        tamaños: [], // No tiene tamaños
    },
    basquet: {
        superficies: [],
        tamaños: ['5', '3'], // Tiene tamaños
    }
};

const ESTADOS = ['activa', 'inactiva'];
const TIPOS_CANCHA_LIST = ['futbol', 'padel', 'basquet'];

const CanchaForm = ({ idCancha, onSuccess, onCancel }) => {

    const isEditing = !!idCancha;
    const [formData, setFormData] = useState({
        nombre: '',
        tipo: '',
        superficie: '',
        tamaño: '',
        techada: false,
        iluminacion: false,
        estado: 'activa',
        precio_base: 0,
    });

    const [loading, setLoading] = useState(false);
    const [formError, setFormError] = useState(null);
    const [validationErrors, setValidationErrors] = useState({});

    // 1. Cargar datos en modo edición (sin cambios)
    useEffect(() => {
        if (isEditing) {
            setLoading(true);
            canchaService.obtenerCanchaPorId(idCancha)
                .then(data => {
                    setFormData({
                        ...data,
                        precio_base: data.precio_base || 0,
                    });
                    setLoading(false);
                })
                .catch(err => {
                    setFormError(`No se pudo cargar la cancha: ${err.message}`);
                    setLoading(false);
                });
        }
    }, [isEditing, idCancha]);

    // 2. Manejo de cambios (sin cambios)
    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;

        let newValue;
        if (type === 'checkbox') {
            newValue = checked;
        } else if (name === 'precio_base') {
            newValue = parseInt(value) || 0;
        } else if (name === 'estado') {
            newValue = value.toLowerCase();
        } else if (name === 'techada' || name === 'iluminacion') {
            newValue = value === 'true';
        } else {
            newValue = value;
        }

        // Si el tipo cambia, reseteamos las opciones condicionales
        if (name === 'tipo') {
            setFormData(prev => ({
                ...prev,
                [name]: newValue,
                superficie: '', // Reset
                tamaño: '',    // Reset
            }));
        } else {
            setFormData(prev => ({ ...prev, [name]: newValue }));
        }

        // Limpiar errores de validación
        if (validationErrors[name]) {
             setValidationErrors(prev => {
                const { [name]: removed, ...rest } = prev;
                return rest;
            });
        }
    };

    // 3. Validación del lado del cliente (sin cambios)
    const validateForm = () => {
        const errors = {};

        if (!formData.tipo || formData.tipo.trim().length === 0) {
            errors.tipo = "Debe seleccionar un tipo de cancha.";
        }
        if (formData.nombre.trim().length === 0 || formData.nombre.length > 25) {
            errors.nombre = "El nombre es obligatorio y debe tener menos de 25 caracteres.";
        }
        if (formData.precio_base === null || formData.precio_base < 0 || !Number.isInteger(formData.precio_base)) {
            errors.precio_base = "El precio base debe ser un número entero positivo.";
        }

        const condiciones = CONDICIONES[formData.tipo] || {};

        if (condiciones.superficies && condiciones.superficies.length > 0 && !formData.superficie) {
            errors.superficie = "Debe seleccionar la superficie de la cancha.";
        }
        if (condiciones.tamaños && condiciones.tamaños.length > 0 && !formData.tamaño) {
             errors.tamaño = "Debe seleccionar el tamaño de la cancha.";
        }

        setValidationErrors(errors);
        return Object.keys(errors).length === 0;
    };


    // 4. Manejo del envío (AJUSTADO: Lógica de limpieza de Payload)
    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            setFormError("Por favor, corrige los errores de validación antes de continuar.");
            return;
        }

        setLoading(true);
        setFormError(null);

        // PAYLOAD BASE
        const payload = {
            nombre: formData.nombre,
            tipo: formData.tipo,
            precio_base: formData.precio_base,
            techada: formData.techada,
            iluminacion: formData.iluminacion,
            estado: formData.estado,
            superficie: formData.superficie || null,
            tamaño: formData.tamaño || null,
        };

        if (formData.tipo === 'padel') {
             // Pádel: No usa tamaño
             delete payload.tamaño;
        }

        if (formData.tipo === 'basquet') {
             delete payload.superficie;
        }


        try {
            if (isEditing) {
                await canchaService.actualizarCancha(idCancha, payload);
            } else {
                await canchaService.crearCancha(payload);
            }
            onSuccess();
        } catch (err) {
            setFormError(`Error al ${isEditing ? 'actualizar' : 'crear'} la cancha: ${err.message}`);
            setLoading(false);
        }
    };

    if (loading && isEditing) {
        return <div className="p-8 text-center text-indigo-500 animate-pulse">Cargando datos de la cancha...</div>;
    }

    const condicionesActuales = CONDICIONES[formData.tipo] || {};
    const superficiesDisponibles = condicionesActuales.superficies || [];
    const tamañosDisponibles = condicionesActuales.tamaños || [];

    return (
        <div className="max-w-xl mx-auto p-6 bg-white shadow-2xl rounded-xl mt-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 border-b pb-2">
                {isEditing ? `Modificar Cancha (ID: ${idCancha})` : 'Crear Nueva Cancha'}
            </h2>

            {(formError || Object.keys(validationErrors).length > 0) && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 text-sm" role="alert">
                    <p className='font-bold'>{formError || "Por favor, corrige los siguientes errores:"}</p>
                    {Object.values(validationErrors).map((err, index) => <li key={index} className='list-disc ml-4'>{err}</li>)}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">

                {/* 1. Nombre */}
                <div className={validationErrors.nombre ? 'has-error' : ''}>
                    <label className="block text-sm font-medium text-gray-700">Nombre (máx. 25 chars)</label>
                    <input
                        type="text"
                        name="nombre"
                        value={formData.nombre}
                        onChange={handleChange}
                        required
                        maxLength={25}
                        className={`mt-1 block w-full border ${validationErrors.nombre ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm p-2`}
                        disabled={loading}
                    />
                </div>

                {/* 2. Precio Base */}
                <div className={validationErrors.precio_base ? 'has-error' : ''}>
                    <label className="block text-sm font-medium text-gray-700">Precio Base ($ entero)</label>
                    <input
                        type="number"
                        name="precio_base"
                        value={formData.precio_base}
                        onChange={handleChange}
                        required
                        min="0"
                        step="1"
                        className={`mt-1 block w-full border ${validationErrors.precio_base ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm p-2`}
                        disabled={loading}
                    />
                </div>

                {/* 3. Tipo de Cancha (Selector Inmutable en Edición) */}
                <div className={validationErrors.tipo ? 'has-error' : ''}>
                    <label className="block text-sm font-medium text-gray-700">Tipo de Cancha</label>
                    <select
                        name="tipo"
                        value={formData.tipo}
                        onChange={handleChange}
                        required
                        className={`mt-1 block w-full border ${validationErrors.tipo ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm p-2 bg-white font-semibold`}
                        disabled={loading || isEditing} // Inmutable en modo Edición
                    >
                        <option value="">-- Seleccionar Tipo --</option>
                        {TIPOS_CANCHA_LIST.map(t => (
                            <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>
                        ))}
                    </select>
                    {isEditing && <p className="text-xs text-gray-500 mt-1">El tipo de cancha no se puede modificar.</p>}
                </div>

                {/* 4. Superficie (Condicional y Dinámica) */}
                {superficiesDisponibles.length > 0 && (
                    <div className={validationErrors.superficie ? 'has-error' : ''}>
                        <label className="block text-sm font-medium text-gray-700">Superficie</label>
                        <select
                            name="superficie"
                            value={formData.superficie || ''}
                            onChange={handleChange}
                            required={superficiesDisponibles.length > 0}
                            className={`mt-1 block w-full border ${validationErrors.superficie ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm p-2 bg-white`}
                            disabled={loading}
                        >
                            <option value="">-- Seleccionar --</option>
                            {superficiesDisponibles.map(s => (
                                <option key={s} value={s}>{s}</option>
                            ))}
                        </select>
                    </div>
                )}

                {/* 5. Tamaño (Condicional y Dinámica) */}
                {tamañosDisponibles.length > 0 && (
                    <div className={validationErrors.tamaño ? 'has-error' : ''}>
                        <label className="block text-sm font-medium text-gray-700">Tamaño</label>
                        <select
                            name="tamaño"
                            value={formData.tamaño || ''}
                            onChange={handleChange}
                            required={tamañosDisponibles.length > 0}
                            className={`mt-1 block w-full border ${validationErrors.tamaño ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm p-2 bg-white`}
                            disabled={loading}
                        >
                            <option value="">-- Seleccionar --</option>
                            {tamañosDisponibles.map(t => (
                                <option key={t} value={t}>{t}</option>
                            ))}
                        </select>
                    </div>
                )}

                {/* 6. Estado (Activa/Inactiva) */}
                <div>
                    <label className="block text-sm font-medium text-gray-700">Estado</label>
                    <select
                        name="estado"
                        value={formData.estado}
                        onChange={handleChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 bg-white"
                        disabled={loading}
                    >
                        {ESTADOS.map(e => (
                            <option key={e} value={e}>{e.charAt(0).toUpperCase() + e.slice(1)}</option>
                        ))}
                    </select>
                </div>

                {/* 7. Checkboxes: Techada e Iluminacion (usamos selects para SI/NO) */}
                <div className="flex items-center space-x-6 pt-2">
                    {/* Techada */}
                    <div className="flex-1">
                        <label className="block text-sm font-medium text-gray-700">Techada</label>
                        <select
                            name="techada"
                            value={formData.techada ? 'true' : 'false'}
                            onChange={handleChange}
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 bg-white"
                            disabled={loading}
                        >
                            <option value="true">Sí</option>
                            <option value="false">No</option>
                        </select>
                    </div>

                    {/* Iluminación */}
                    <div className="flex-1">
                         <label className="block text-sm font-medium text-gray-700">Iluminación</label>
                        <select
                            name="iluminacion"
                            value={formData.iluminacion ? 'true' : 'false'}
                            onChange={handleChange}
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 bg-white"
                            disabled={loading}
                        >
                            <option value="true">Sí</option>
                            <option value="false">No</option>
                        </select>
                    </div>
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
                        {loading ? 'Guardando...' : (isEditing ? 'Guardar Cambios' : 'Crear Cancha')}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default CanchaForm;