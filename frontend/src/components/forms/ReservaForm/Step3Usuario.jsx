import React, { useState } from "react"; // Importamos useState para manejar errores locales de formato
import { usuarioService } from "../../../services/usuarioService.js"; // Importamos el service que enviaste

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
  validationErrors,
}) => {
  // Estado local para mostrar errores de formato inmediato en los campos editables
  const [localFormatErrors, setLocalFormatErrors] = useState({});

  // --- Lógica de Búsqueda de Usuario (Integra el servicio) ---
  const handleDniSearch = async () => {
    if (!dniBusqueda || dniBusqueda.trim() === "") {
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
      const existingUser = await usuarioService.buscarUsuarioPorDNI(
        dniBusqueda.trim()
      );

      if (existingUser) {
        // Caso 1: Usuario Encontrado
        setUserData(existingUser);
        setIsNewUser(false);
        setFormError(
          `✅ Cliente ${existingUser.nombre} ${existingUser.apellido} (DNI: ${existingUser.dni}) encontrado.`
        );
      } else {
        // Caso 2: Usuario NO Encontrado -> Preparamos los datos para creación
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
      // Si hay un error de red/servidor, aún ofrecemos crear el usuario
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
        `⛔ Error al buscar (Intentaremos crear): ${err.message}. Complete los campos.`
      );
    } finally {
      setLoading(false);
    }
  };

  // --- Lógica de Cambio con Validación de Formato Inmediata ---
  const handleUserChangeWithFormatValidation = (e) => {
    const { name, value } = e.target;
    let error = "";

    if (name === "email" && value && !EMAIL_REGEX.test(value)) {
      error = "El formato del email es inválido.";
    }
    if (name === "telefono" && value && !PHONE_REGEX.test(value)) {
      error =
        "El teléfono solo puede contener números, espacios, guiones o el signo '+'.";
    }

    // Actualizar error local
    setLocalFormatErrors((prev) => ({ ...prev, [name]: error }));

    // Notificar al padre (ReservaForm.jsx) sobre el cambio de valor
    handleUserChange(e);
  };

  // -------------------------------------------------------------

  return (
    <div className="mb-4">
      <h5 className="text-primary fw-bold">Datos del Usuario</h5>
      <p className="small text-muted">
        Busque el cliente por <strong>DNI</strong>. Si no existe, complete los
        campos para registrarlo.
      </p>

      {/* Búsqueda por DNI */}
      <div className="d-flex gap-2">
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
          className={`form-control ${
            validationErrors.user ? "is-invalid" : ""
          }`}
          disabled={loading}
        />
        <button
          type="button"
          onClick={handleDniSearch}
          disabled={loading || !dniBusqueda || (userData && !isNewUser)}
          className="btn btn-primary"
        >
          {loading ? "Buscando..." : "Buscar DNI"}
        </button>
      </div>

      {validationErrors.user && (
        <p className="small text-danger mt-1">{validationErrors.user}</p>
      )}

      {/* Formulario de Datos (solo visible si se buscó DNI) */}
      {userData && (
        <div className="card p-3 bg-light mb-2">
          <div className="mb-2">
            <p
              className={`fw-bold ${
                isNewUser ? "text-warning" : "text-success"
              } mb-0`}
            >
              {isNewUser
                ? "CREACIÓN de Nuevo Usuario (Requerido: Nombre, Apellido, Email)"
                : "Usuario Existente (Datos de Lectura)"}
            </p>
          </div>

          {/* DNI (Siempre visible y de solo lectura después de la búsqueda) */}
          <div className="mb-2">
            <input
              type="text"
              name="dni"
              value={userData.dni}
              readOnly
              className="form-control-plaintext bg-light"
            />
          </div>

          {/* Nombre y Apellido */}
          <div className="mb-2">
            <input
              type="text"
              name="nombre"
              value={userData.nombre}
              onChange={handleUserChange}
              placeholder="Nombre *"
              required={isNewUser}
              readOnly={!isNewUser}
              className={`form-control ${!isNewUser ? "bg-light" : ""}`}
            />
          </div>
          <div className="mb-2">
            <input
              type="text"
              name="apellido"
              value={userData.apellido}
              onChange={handleUserChange}
              placeholder="Apellido *"
              required={isNewUser}
              readOnly={!isNewUser}
              className={`form-control ${!isNewUser ? "bg-light" : ""}`}
            />
          </div>

          {/* Email (Validación de Formato) */}
          <div className="mb-2">
            <input
              type="email"
              name="email"
              value={userData.email}
              onChange={handleUserChangeWithFormatValidation}
              placeholder="Email *"
              required={isNewUser}
              readOnly={!isNewUser}
              className={`form-control ${!isNewUser ? "bg-light" : ""} ${
                localFormatErrors.email || validationErrors.email
                  ? "is-invalid"
                  : ""
              }`}
            />
            {(localFormatErrors.email || validationErrors.email) && (
              <div className="invalid-feedback">
                {localFormatErrors.email || validationErrors.email}
              </div>
            )}
          </div>

          {/* Teléfono (Validación de Formato) */}
          <div className="mb-2">
            <input
              type="text"
              name="telefono"
              value={userData.telefono}
              onChange={handleUserChangeWithFormatValidation}
              placeholder="Teléfono (Opcional)"
              readOnly={!isNewUser}
              className={`form-control ${!isNewUser ? "bg-light" : ""} ${
                localFormatErrors.telefono || validationErrors.telefono
                  ? "is-invalid"
                  : ""
              }`}
            />
            {(localFormatErrors.telefono || validationErrors.telefono) && (
              <div className="invalid-feedback">
                {localFormatErrors.telefono || validationErrors.telefono}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Mensaje de guía si el usuario existe y se puede avanzar */}
      {userData && !isNewUser && (
        <p className="small text-success fw-semibold">
          Datos listos. Puede avanzar al resumen.
        </p>
      )}
    </div>
  );
};

export default Step3Usuario;
