const API_BASE_URL = "http://localhost:8000/api/correos"; // Asumiendo una nueva ruta en FastAPI

const getErrorDetail = async (response) => {
    try {
        const errorData = await response.json();
        // Si la respuesta es un objeto de error (ej. FastAPI 500/400), intentamos convertirlo a string legible.
        if (errorData && typeof errorData === 'object') {
            // Utilizamos el campo 'detail' si existe, o el objeto completo si no.
            return JSON.stringify(errorData.detail || errorData);
        }
        return errorData.message || response.statusText;
    } catch {
        // Si falla el parseo JSON, devolvemos el texto plano de la respuesta.
        return await response.text();
    }
};

export const correoService = {

    /**
     * Envía el comprobante de reserva y pago al cliente.
     * @param {object} datosComprobante Datos completos requeridos por ServicioCorreo de Python.
     * @returns {Promise<object>} Resultado de la operación de envío.
     */
    async enviarComprobante(datosComprobante) {
        console.log(`[SERVICE] Solicitando envío de correo a: ${datosComprobante.email_contacto}`);

        const response = await fetch(`${API_BASE_URL}/enviar-comprobante`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(datosComprobante),
        });

        if (!response.ok) {
            const errorDetail = await getErrorDetail(response);
            throw new Error(`Error al enviar el correo: ${errorDetail}`);
        }

        return await response.json();
    },
};