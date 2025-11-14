const API_BASE_URL = "http://localhost:8000/api/servicios-adicionales";

/**
 * Función auxiliar para manejar errores HTTP.
 */
const getErrorDetail = async (response) => {
    try {
        const errorData = await response.json();
        return errorData.detail || errorData.message || response.statusText;
    } catch {
        return response.statusText;
    }
};

export const adicionalService = {

    /**
     * Crea un nuevo registro de servicios adicionales en el backend.
     * Esto es necesario para obtener el id_servicio antes de crear la reserva.
     * * @param {Object} datosServicio Payload con la selección de servicios (ej: {arbitro: true, cant_personas_asado: 2}).
     * @returns {Promise<Object>} El objeto ServicioAdicional creado con su ID.
     */
    async crearServicioAdicional(datosServicio) {
        console.log(`[SERVICE] Creando servicios adicionales en: ${API_BASE_URL}`);

        // El DTO de backend (ServicioAdicionalDTO) acepta los campos sin necesidad de procesarlos,
        // pero limpiamos los valores para que no envíe claves con valores nulos o 0 si no son necesarias.

        const response = await fetch(API_BASE_URL, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(datosServicio),
        });

        if (!response.ok) {
            const errorDetail = await getErrorDetail(response);
            throw new Error(`Error al crear servicios adicionales (${response.status}): ${errorDetail}`);
        }

        // Asumimos que el backend retorna el objeto ServicioAdicionalDTO con el id_servicio.
        return await response.json();
    },

    // Puedes agregar otras funciones (obtener, actualizar) si fueran necesarias en el futuro
    // ...
};