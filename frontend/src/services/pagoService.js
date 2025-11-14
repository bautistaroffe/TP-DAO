const API_BASE_URL = "http://localhost:8000/api/pagos";

/**
 * Intenta extraer un mensaje de error detallado del cuerpo de la respuesta HTTP.
 */
const getErrorDetail = async (response) => {
    try {
        const errorData = await response.json();
        // Si el detalle de FastAPI es un objeto complejo (e.g., errores de validación 422), convertirlo a string
        if (errorData && typeof errorData === 'object') {
            return JSON.stringify(errorData);
        }
        return errorData.detail || errorData.message || response.statusText;
    } catch {
        // Si el cuerpo no es JSON (ej. error 500 simple), devuelve el texto plano
        return await response.text();
    }
};

export const pagoService = {

    async obtenerPagos() {
        console.log(`Intentando obtener pagos desde: ${API_BASE_URL}`);
        try {
            const response = await fetch(API_BASE_URL);
            if (!response.ok) {
                const errorDetail = await response.text();
                throw new Error(`Error en el servidor (${response.status} ${response.statusText}): ${errorDetail}`);
            }
            return await response.json();
        } catch (error) {
            console.error("Fallo al obtener la lista de pagos:", error);
            throw error;
        }
    },

    /**
     * Procesa un pago para una reserva. Esto finaliza la reserva y la marca como pagada/confirmada.
     * @param {Object} datosPago Datos del pago (ej: id_reserva, monto, metodo_pago, fecha_pago).
     * @returns {Promise<Object>} El objeto Pago creado.
     */
    async procesarPago(datosPago) {
        console.log(`[SERVICE] Procesando pago para reserva ${datosPago.id_reserva}...`);

        const response = await fetch(API_BASE_URL, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(datosPago),
        });

        if (!response.ok) {
            const errorDetail = await getErrorDetail(response);
            throw new Error(errorDetail || `Error al procesar el pago.`);
        }

        // Debería devolver el objeto de Pago creado
        return await response.json();
    },

    async eliminarPago(id_pago) {
        console.log(`[SERVICE] Llamando a DELETE para Pago ID: ${id_pago}`);
        const response = await fetch(`${API_BASE_URL}/${id_pago}`, { method: 'DELETE' });

        if (!response.ok) {
            const errorDetail = await response.text();
            throw new Error(`Error al eliminar el pago: ${response.status} ${response.statusText} - ${errorDetail}`);
        }
        return true;
    },
};