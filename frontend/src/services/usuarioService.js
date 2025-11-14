const API_BASE_URL = "http://localhost:8000/api/usuarios";

/**
 * Intenta extraer un mensaje de error detallado del cuerpo de la respuesta HTTP.
 */
const getErrorDetail = async (response) => {
    try {
        const errorData = await response.json();
        // Intentar obtener el detalle de error del backend (FastAPI usa 'detail', otros usan 'message')
        if (typeof errorData === 'object' && errorData !== null) {
            return JSON.stringify(errorData) || errorData.detail || errorData.message || response.statusText;
        }
    } catch {
        // Si no se puede parsear como JSON, devolver el texto plano
        return await response.text();
    }
    return response.statusText;
};

export const usuarioService = {

    async obtenerUsuarios() {
        console.log(`Intentando obtener usuarios desde: ${API_BASE_URL}`);
        try {
            const response = await fetch(API_BASE_URL);
            if (!response.ok) {
                const errorDetail = await response.text();
                throw new Error(`Error en el servidor (${response.status} ${response.statusText}): ${errorDetail}`);
            }
            return await response.json();
        } catch (error) {
            console.error("Fallo al obtener la lista de usuarios:", error);
            throw error;
        }
    },

    /**
     * Busca un usuario por su número de DNI.
     * Asume que la API tiene un endpoint para buscar: GET /api/usuarios/buscar?dni={dni}
     * @param {string} dni El DNI del usuario a buscar.
     * @returns {Promise<Object | null>} El objeto usuario si se encuentra, o null si no existe.
     */
    async buscarUsuarioPorDNI(dni) {
        console.log(`[SERVICE] Buscando usuario por DNI: ${dni}`);
        try {
            // Utilizamos el endpoint de búsqueda (debe estar implementado en el backend)
            const response = await fetch(`${API_BASE_URL}/buscar?dni=${dni}`);

            if (response.status === 404) {
                // Si la API devuelve 404 para "no encontrado", devolvemos null
                return null;
            }

            if (!response.ok) {
                const errorDetail = await getErrorDetail(response);
                throw new Error(`Error al buscar usuario por DNI (${response.status}): ${errorDetail}`);
            }

            // Si es 200 y OK, devuelve el usuario
            return await response.json();

        } catch (error) {
            console.error("[SERVICE ERROR] Fallo al buscar usuario por DNI:", error);
            throw error;
        }
    },

    async crearOActualizarUsuario(id_usuario, datosPayload, method) {
        const url = id_usuario ? `${API_BASE_URL}/${id_usuario}` : API_BASE_URL;
        console.log(`[SERVICE] Llamando a ${method} en URL: ${url} con payload:`, datosPayload);

        const response = await fetch(url, {
            method: method,
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(datosPayload),
        });

        if (!response.ok) {
            const errorDetail = await getErrorDetail(response);
            throw new Error(`Error al buscar usuario por DNI (${response.status}): ${errorDetail}`);        }
        try {
            if (response.status !== 204) {
                return await response.json();
            }
            return {};
        } catch (e) {
            console.warn(`Operación ${method} exitosa pero falló la lectura del JSON de respuesta. Asumiendo éxito.`, e);
            return {};
        }
    },

    async actualizarUsuario(id_usuario, datosActualizados) {
        return this.crearOActualizarUsuario(id_usuario, datosActualizados, 'PUT');
    },

    async crearUsuario(datosNuevoUsuario) {
        return this.crearOActualizarUsuario(null, datosNuevoUsuario, 'POST');
    },

    async eliminarUsuario(id_usuario) {
        console.log(`[SERVICE] Llamando a DELETE para Usuario ID: ${id_usuario}`);
        const response = await fetch(`${API_BASE_URL}/${id_usuario}`, { method: 'DELETE' });

        if (!response.ok) {
            const errorDetail = await response.text();
            throw new Error(`Error al eliminar el usuario: ${response.status} ${response.statusText} - ${errorDetail}`);
        }
        return true;
    },
};