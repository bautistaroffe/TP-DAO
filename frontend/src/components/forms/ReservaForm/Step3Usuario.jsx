import React, { useState } from 'react'; // Importamos useState para manejar errores locales de formato
import { usuarioService } from '../../../services/usuarioService.js'; // Importamos el service que enviaste

// Regex para validar formato de email
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
// Regex para DNI (6 a 9 dígitos, solo números)
const DNI_REGEX = /^\d{6,9}$/;
// Regex para Teléfono (solo números, opcionalmente espacios, guiones o el signo +)
const PHONE_REGEX = /^[\d\s\-+]+$/;

const Step3Usuario = ({
    dniBusqueda,
    setDniBusqueda,
    userData,
    isNewUser,
    loading,
    setLoading,
    setUserData,
    setIsNewUser,
    setFormError,
    handleUserChange,
    validationErrors
}) => {

    // Estado local para mostrar errores de formato inmediato en los campos editables
    const [localFormatErrors, setLocalFormatErrors] = useState({});

    // --- Lógica de Búsqueda de Usuario (Integra el servicio) ---
    const handleDniSearch = async () => {
        if (!dniBusqueda || dniBusqueda.trim() === '') {
            setFormError("Ingrese el DNI del cliente.");
            return;
        }

        // Validación de formato de DNI antes de llamar a la API
        if (!DNI_REGEX.test(dniBusqueda.trim())) {
             setFormError("El DNI debe ser un número positivo de 6 a 9 dígitos.");
             return;
        }

        // Limpiar estados previos de usuario para la nueva búsqueda
        setUserData(null);
        setIsNewUser(false);
        setLoading(true);
        setFormError(null);
        setLocalFormatErrors({});

        try {
            const existingUser = await usuarioService.buscarUsuarioPorDNI(dniBusqueda.trim());

            if (existingUser) {
                // Caso 1: Usuario Encontrado
                setUserData(existingUser);
                setIsNewUser(false);
                setFormError(`✅ Cliente ${existingUser.nombre} ${existingUser.apellido} (DNI: ${existingUser.dni}) encontrado.`);
            } else {
                // Caso 2: Usuario NO Encontrado -> Preparamos los datos para creación
                const newUserInitialData = {
                    dni: dniBusqueda.trim(),
                    nombre: '',
                    apellido: '',
                    telefono: '',
                    email: ''
                };
                setUserData(newUserInitialData);
                setIsNewUser(true);
                setFormError("⚠️ Usuario no encontrado. Por favor, complete los datos obligatorios para crearlo.");
            }
        } catch (err) {
            console.error("Error buscando DNI:", err);
            // Si hay un error de red/servidor, aún ofrecemos crear el usuario
            const newUserInitialData = { dni: dniBusqueda.trim(), nombre: '', apellido: '', telefono: '', email: '' };
            setUserData(newUserInitialData);
            setIsNewUser(true);
            setFormError(`⛔ Error al buscar (Intentaremos crear): ${err.message}. Complete los campos.`);
        } finally {
            setLoading(false);
        }
    };

    // --- Lógica de Cambio con Validación de Formato Inmediata ---
    const handleUserChangeWithFormatValidation = (e) => {
        const { name, value } = e.target;
        let error = '';

        if (name === 'email' && value && !EMAIL_REGEX.test(value)) {
            error = "El formato del email es inválido.";
        }
        if (name === 'telefono' && value && !PHONE_REGEX.test(value)) {
            error = "El teléfono solo puede contener números, espacios, guiones o el signo '+'.";
        }

        // Actualizar error local
        setLocalFormatErrors(prev => ({ ...prev, [name]: error }));

        // Notificar al padre (ReservaForm.jsx) sobre el cambio de valor
        handleUserChange(e);
    };

    // -------------------------------------------------------------

    return (
        <div className="space-y-6">
            <h3 className="text-xl font-semibold text-indigo-700">3. Datos del Usuario</h3>
            <p className="text-sm text-gray-600">Busque el cliente por **DNI**. Si no existe, complete los campos para registrarlo.</p>

            {/* Búsqueda por DNI */}
            <div className="flex space-x-2">
                <input
                    type="text"
                    value={dniBusqueda}
                    onChange={(e) => {
                        setDniBusqueda(e.target.value);
                        setUserData(null);
                        setIsNewUser(false);
                        setFormError(null);
                    }}
                    placeholder="Ingrese DNI del Cliente (6-9 dígitos)"
                    className={`flex-grow border ${validationErrors.user ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm p-2`}
                    disabled={loading}
                />
                <button
                    type="button"
                    onClick={handleDniSearch}
                    disabled={loading || !dniBusqueda || (userData && !isNewUser)}
                    className="px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 disabled:opacity-50 transition"
                >
                    {loading ? 'Buscando...' : 'Buscar DNI'}
                </button>
            </div>

            {validationErrors.user && <p className="text-xs text-red-500 mt-1">{validationErrors.user}</p>}

            {/* Formulario de Datos (solo visible si se buscó DNI) */}
            {userData && (
                <div className="p-4 border rounded-md bg-gray-50 space-y-3">
                    <p className={`font-bold ${isNewUser ? 'text-orange-600' : 'text-green-600'}`}>
                        {isNewUser ? 'CREACIÓN de Nuevo Usuario (Requerido: Nombre, Apellido, Email)' : 'Usuario Existente (Datos de Lectura)'}
                    </p>

                    {/* DNI (Siempre visible y de solo lectura después de la búsqueda) */}
                    <input type="text" name="dni" value={userData.dni} readOnly className="w-full border rounded-md p-2 bg-gray-200" />

                    {/* Nombre y Apellido */}
                    <input
                        type="text" name="nombre" value={userData.nombre} onChange={handleUserChange}
                        placeholder="Nombre *" required={isNewUser} readOnly={!isNewUser}
                        className={`w-full border rounded-md p-2 ${!isNewUser ? 'bg-gray-200' : ''}`}
                    />
                    <input
                        type="text" name="apellido" value={userData.apellido} onChange={handleUserChange}
                        placeholder="Apellido *" required={isNewUser} readOnly={!isNewUser}
                        className={`w-full border rounded-md p-2 ${!isNewUser ? 'bg-gray-200' : ''}`}
                    />

                    {/* Email (Validación de Formato) */}
                    <input
                        type="email" name="email" value={userData.email} onChange={handleUserChangeWithFormatValidation}
                        placeholder="Email *" required={isNewUser} readOnly={!isNewUser}
                        className={`w-full border rounded-md p-2 ${!isNewUser ? 'bg-gray-200' : ''} ${localFormatErrors.email || validationErrors.email ? 'border-red-500' : ''}`}
                    />
                    {(localFormatErrors.email || validationErrors.email) && <p className="text-xs text-red-500 mt-1">{localFormatErrors.email || validationErrors.email}</p>}

                    {/* Teléfono (Validación de Formato) */}
                    <input
                        type="text" name="telefono" value={userData.telefono} onChange={handleUserChangeWithFormatValidation}
                        placeholder="Teléfono (Opcional)" readOnly={!isNewUser}
                        className={`w-full border rounded-md p-2 ${!isNewUser ? 'bg-gray-200' : ''} ${localFormatErrors.telefono || validationErrors.telefono ? 'border-red-500' : ''}`}
                    />
                    {(localFormatErrors.telefono || validationErrors.telefono) && <p className="text-xs text-red-500 mt-1">{localFormatErrors.telefono || validationErrors.telefono}</p>}

                </div>
            )}

            {/* Mensaje de guía si el usuario existe y se puede avanzar */}
            {userData && !isNewUser && (
                <p className="text-sm text-green-700 font-semibold">
                    Datos listos. Puede avanzar al resumen.
                </p>
            )}
        </div>
    );
};

export default Step3Usuario;