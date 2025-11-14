import React, { useState, useEffect } from 'react';
import { usuarioService } from '../../services/usuarioService.js'; // Asumiendo que el servicio está en esta ruta

// Estados posibles para un usuario según el backend
const ESTADOS_USUARIO = ['activo', 'inactivo'];

/**
 * Formulario unificado para la creación y edición de entidades Usuario.
 * @param {object} props - Propiedades del componente.
 * @param {number|null} props.idUsuario - ID del usuario a editar. Si es null o undefined, el formulario es para crear.
 * @param {function} props.onSuccess - Callback a ejecutar tras una operación exitosa.
 * @param {function} props.onCancel - Callback a ejecutar al cancelar.
 */
const UsuarioForm = ({ idUsuario, onSuccess, onCancel }) => {

    // Modo Edición si idUsuario es un valor válido
    const isEditing = !!idUsuario;

    // Estado inicial (adaptado al UsuarioDTO)
    const [formData, setFormData] = useState({
        dni: '',
        nombre: '',
        apellido: '',
        telefono: '',
        email: '',
        estado: 'activo',
    });

    const [loading, setLoading] = useState(false);
    const [formError, setFormError] = useState(null);
    const [validationErrors, setValidationErrors] = useState({});

    // 1. Cargar datos en modo edición
    useEffect(() => {
        if (isEditing) {
            setLoading(true);
            // El servicio obtenerUsuarios() devuelve una lista, necesitamos obtener el usuario específico.
            // Para simplificar, asumiremos que existe un obtenerUsuarioPorId en el service.
            // Si el servicio solo tiene obtenerUsuarios, el cliente tendría que filtrar la lista.

            // Nota: Si el servicio no tiene obtenerUsuarioPorId, este es un patrón común:
            // usuarioService.obtenerUsuarioPorId(idUsuario)

            // Usaremos el método que obtendrá todos y luego buscaremos el específico.
            usuarioService.obtenerUsuarios()
                .then(usuarios => {
                    const data = usuarios.find(u => u.id_usuario === idUsuario);
                    if (!data) {
                        throw new Error("Usuario no encontrado en la lista.");
                    }

                    // Aseguramos que los valores sean cadenas vacías si son nulos del backend
                    const formattedData = {
                        dni: data.dni || '',
                        nombre: data.nombre || '',
                        apellido: data.apellido || '',
                        telefono: data.telefono || '',
                        email: data.email || '',
                        estado: data.estado || 'activo',
                    };

                    setFormData(formattedData);
                    setLoading(false);
                })
                .catch(err => {
                    setFormError(`No se pudo cargar el usuario: ${err.message}`);
                    setLoading(false);
                });
        }
    }, [isEditing, idUsuario]);

    // 2. Manejo de cambios
    const handleChange = (e) => {
        const { name, value } = e.target;

        setFormData(prev => ({ ...prev, [name]: value }));

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

        // DNI (requerido)
        if (!formData.dni || String(formData.dni).trim().length === 0) {
            errors.dni = "El DNI es obligatorio.";
        } else if (!/^\d+$/.test(formData.dni.trim())) {
             errors.dni = "El DNI debe contener solo números.";
        }

        // Nombre (requerido)
        if (!formData.nombre || formData.nombre.trim().length === 0) {
            errors.nombre = "El nombre es obligatorio.";
        }

        // Apellido (requerido)
        if (!formData.apellido || formData.apellido.trim().length === 0) {
            errors.apellido = "El apellido es obligatorio.";
        }

        // Email (opcional, pero si existe debe ser válido)
        if (formData.email && formData.email.trim().length > 0) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(formData.email.trim())) {
                errors.email = "El correo electrónico no es válido.";
            }
        }

        // Teléfono (opcional, pero si existe debe ser válido)
        if (formData.telefono && formData.telefono.trim().length > 0) {
            // Permite números, espacios, +, -
            const phoneRegex = /^[0-9\s\-\+]+$/;
            if (!phoneRegex.test(formData.telefono.trim())) {
                errors.telefono = "El número de teléfono contiene caracteres no válidos.";
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

        // PAYLOAD: Limpiar opcionales a null si están vacíos
        const payload = {
            dni: formData.dni.trim(),
            nombre: formData.nombre.trim(),
            apellido: formData.apellido.trim(),
            // Los campos opcionales deben ser null si están vacíos
            telefono: formData.telefono ? formData.telefono.trim() : null,
            email: formData.email ? formData.email.trim() : null,
            // El estado solo se envía si se está editando
            ...(isEditing && { estado: formData.estado }),
        };

        try {
            if (isEditing) {
                await usuarioService.actualizarUsuario(idUsuario, payload);
                console.log(`✅ Operación actualizar exitosa. Usuario ID: ${idUsuario}`);
            } else {
                const result = await usuarioService.crearUsuario(payload);
                console.log(`✅ Operación crear exitosa. Resultado:`, result);
            }
            onSuccess();
        } catch (err) {
            // El servicio devuelve el mensaje de error del backend (ej: DNI duplicado)
            setFormError(`Error al ${isEditing ? 'actualizar' : 'crear'} el usuario: ${err.message}`);
            console.error("Detalle del error de red/servidor:", err);
        } finally {
            setLoading(false);
        }
    };

    if (loading && isEditing) {
        return <div className="p-8 text-center text-indigo-500 animate-pulse">Cargando datos del usuario...</div>;
    }

    return (
        <div className="max-w-xl mx-auto p-6 bg-white shadow-2xl rounded-xl mt-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 border-b pb-2">
                {isEditing ? `Modificar Usuario (ID: ${idUsuario})` : 'Crear Nuevo Usuario'}
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

                {/* 1. DNI */}
                <div className={validationErrors.dni ? 'has-error' : ''}>
                    <label className="block text-sm font-medium text-gray-700">DNI</label>
                    <input
                        type="text"
                        name="dni"
                        value={formData.dni}
                        onChange={handleChange}
                        required
                        className={`mt-1 block w-full border ${validationErrors.dni ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm p-2`}
                        disabled={loading}
                        placeholder="Documento Nacional de Identidad"
                    />
                </div>

                <div className="flex space-x-4">
                    {/* 2. Nombre */}
                    <div className={`flex-1 ${validationErrors.nombre ? 'has-error' : ''}`}>
                        <label className="block text-sm font-medium text-gray-700">Nombre</label>
                        <input
                            type="text"
                            name="nombre"
                            value={formData.nombre}
                            onChange={handleChange}
                            required
                            className={`mt-1 block w-full border ${validationErrors.nombre ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm p-2`}
                            disabled={loading}
                        />
                    </div>

                    {/* 3. Apellido */}
                    <div className={`flex-1 ${validationErrors.apellido ? 'has-error' : ''}`}>
                         <label className="block text-sm font-medium text-gray-700">Apellido</label>
                        <input
                            type="text"
                            name="apellido"
                            value={formData.apellido}
                            onChange={handleChange}
                            required
                            className={`mt-1 block w-full border ${validationErrors.apellido ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm p-2`}
                            disabled={loading}
                        />
                    </div>
                </div>

                {/* 4. Email */}
                <div className={validationErrors.email ? 'has-error' : ''}>
                    <label className="block text-sm font-medium text-gray-700">Email (Opcional)</label>
                    <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        className={`mt-1 block w-full border ${validationErrors.email ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm p-2`}
                        disabled={loading}
                        placeholder="correo@ejemplo.com"
                    />
                </div>

                {/* 5. Teléfono */}
                <div className={validationErrors.telefono ? 'has-error' : ''}>
                    <label className="block text-sm font-medium text-gray-700">Teléfono (Opcional)</label>
                    <input
                        type="tel"
                        name="telefono"
                        value={formData.telefono}
                        onChange={handleChange}
                        className={`mt-1 block w-full border ${validationErrors.telefono ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm p-2`}
                        disabled={loading}
                        placeholder="+54 9 11 XXXX-XXXX"
                    />
                </div>


                {/* 6. Estado (solo visible y editable en modo edición) */}
                {isEditing && (
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Estado</label>
                        <select
                            name="estado"
                            value={formData.estado}
                            onChange={handleChange}
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 bg-white"
                            disabled={loading}
                        >
                            {ESTADOS_USUARIO.map(e => (
                                <option key={e} value={e}>{e.charAt(0).toUpperCase() + e.slice(1)}</option>
                            ))}
                        </select>
                    </div>
                )}


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
                        {loading ? 'Guardando...' : (isEditing ? 'Guardar Cambios' : 'Crear Usuario')}
                    </button>
                </div>
            </form>
        </div>
    );
};

// Exportar el componente para su uso
export default UsuarioForm;