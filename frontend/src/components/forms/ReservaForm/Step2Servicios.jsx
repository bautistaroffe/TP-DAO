import React from "react";

/**
 * Componente para el Paso 2: Selección de Servicios Adicionales.
 * @param {object} props - Propiedades recibidas desde ReservaForm.jsx
 * @param {object} props.formData - Datos del formulario (incluye servicios_adicionales).
 * @param {function} props.handleChange - Función para manejar cambios en los campos.
 * @param {object} props.PRECIOS_ADICIONALES - Constantes de costos.
 * @param {object|null} props.canchaSeleccionada - El DTO de la cancha seleccionada en el Step 1.
 */
const Step2Servicios = ({
  formData,
  handleChange,
  PRECIOS_ADICIONALES,
  canchaSeleccionada,
}) => {
  const servicios = formData.servicios_adicionales;
  const tipoCancha = canchaSeleccionada?.tipo
    ? canchaSeleccionada.tipo.toLowerCase()
    : "";

  // --- Lógica de Visibilidad de Servicios ---

  // Función de ayuda para determinar la visibilidad de un servicio
  const isVisible = (servicio) => {
    if (!tipoCancha) return false; // Si no hay cancha seleccionada, no muestra nada.

    switch (tipoCancha) {
      case "futbol":
        return servicio !== "cant_paletas";
      case "basquet":
        return servicio !== "cant_paletas" && servicio !== "arbitro";
      case "padel":
        return servicio !== "pecheras" && servicio !== "arbitro";
      default:
        // Por defecto, se pueden mostrar todos si el tipo no está mapeado
        return true;
    }
  };

  // Función para manejar el cambio en los servicios (limpia el valor si se oculta)
  const handleServiceChange = (e) => {
    const { name } = e.target;

    // Si el servicio se está desmarcando/quitando, la función principal `handleChange`
    // ya se encargará de actualizar el estado.
    handleChange(e);

    // Lógica de limpieza: Si un campo que estaba activo ahora está oculto
    // (Aunque esto debería manejarse en el `handleNext` del Step 1 o al seleccionar la cancha)
    // Por ahora, confiamos en que el usuario sólo selecciona lo que ve.
  };

  if (!canchaSeleccionada) {
    return (
      <div className="text-center p-3 border border-warning rounded bg-light text-warning">
        <p className="mb-0">
          ⚠️{" "}
          <strong>
            Primero debes seleccionar una cancha y un turno en el paso anterior.
          </strong>
        </p>
      </div>
    );
  }

  const serviciosVisibles = [
    {
      key: "arbitro",
      label: "Incluir Árbitro Profesional",
      cost: PRECIOS_ADICIONALES.arbitro,
      type: "checkbox",
    },
    {
      key: "partido_grabado",
      label: "Grabación del Partido (Video)",
      cost: PRECIOS_ADICIONALES.partido_grabado,
      type: "checkbox",
    },
    {
      key: "pecheras",
      label: "Alquiler de Pecheras",
      cost: PRECIOS_ADICIONALES.pecheras,
      type: "checkbox",
    },
    {
      key: "cant_personas_asado",
      label: "Servicio de Asado / Parrilla (Personas)",
      cost: PRECIOS_ADICIONALES.asado_por_persona,
      type: "number",
    },
    {
      key: "cant_paletas",
      label: "Alquiler de Paletas (Para Pádel/Tenis)",
      cost: PRECIOS_ADICIONALES.paletas_por_unidad,
      type: "number",
    },
  ];

  return (
    <div className="mb-4">
      <h5 className="text-primary fw-bold">
        Servicios Adicionales ({canchaSeleccionada.tipo})
      </h5>
      <p className="small text-muted">
        Seleccione las opciones disponibles para el tipo de cancha:{" "}
        <strong>{canchaSeleccionada.tipo.toUpperCase()}</strong>.
      </p>

      {serviciosVisibles.map((servicio) => {
        if (!isVisible(servicio.key)) return null;

        const name = `servicio_${servicio.key}`;
        const isChecked = servicios[servicio.key];

        if (servicio.type === "checkbox") {
          return (
            <div
              key={servicio.key}
              className="d-flex align-items-center justify-content-between p-3 border rounded bg-white mb-2"
            >
              <label
                htmlFor={name}
                className="mb-0 fw-semibold text-dark cursor-pointer"
              >
                {servicio.label}
              </label>
              <div className="d-flex align-items-center gap-3">
                <span className="small text-muted">(+ ${servicio.cost})</span>
                <div className="form-check">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    id={name}
                    name={name}
                    checked={isChecked}
                    onChange={handleServiceChange}
                  />
                </div>
              </div>
            </div>
          );
        }

        if (servicio.type === "number") {
          return (
            <div
              key={servicio.key}
              className="p-3 border rounded bg-white mb-2"
            >
              <label
                htmlFor={name}
                className="form-label fw-semibold mb-1 d-block"
              >
                {servicio.label}
              </label>
              <p className="small text-muted mb-2">
                Costo: <strong>${servicio.cost}</strong> por{" "}
                {servicio.key.includes("asado") ? "persona" : "unidad"}.
              </p>
              <input
                type="number"
                id={name}
                name={name}
                value={servicios[servicio.key]}
                onChange={handleServiceChange}
                min="0"
                className="form-control w-25 text-center"
                placeholder="0"
              />
            </div>
          );
        }
        return null;
      })}

      {tipoCancha &&
        serviciosVisibles.filter((s) => isVisible(s.key)).length === 0 && (
          <p className="text-gray-500 italic text-center">
            No hay servicios adicionales disponibles para este tipo de cancha.
          </p>
        )}
    </div>
  );
};

export default Step2Servicios;
