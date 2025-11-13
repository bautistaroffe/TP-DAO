const API_BASE_URL = "http://localhost:8000/api/turnos";

/**
 * Intenta extraer un mensaje de error detallado del cuerpo de la respuesta HTTP.
 * @param {Response} response Objeto Response fallido.
 * @returns {Promise<string>} Mensaje de error detallado.
 */
const getErrorDetail = async (response) => {
    try {
        const errorData = await response.json();
        // Devuelve el detalle, mensaje o el texto del estado HTTP (típico de FastAPI)
        return errorData.detail || errorData.message || response.statusText;
    } catch {
        // Si no es JSON válido, devuelve el texto del estado
        return response.statusText;
    }
};

export const turnoService = {

  // ============================
  // OBTENER / LISTAR
  // ============================

  async obtenerTurnos() {
    console.log(`[SERVICE] Intentando obtener turnos desde: ${API_BASE_URL}`);

    try {
      const response = await fetch(API_BASE_URL);

      if (!response.ok) {
        const errorDetail = await response.text();
        throw new Error(`Error en el servidor (${response.status}): ${errorDetail}`);
      }

      const turnos = await response.json();
      return turnos;

    } catch (error) {
      console.error("[SERVICE ERROR] Fallo al obtener la lista de turnos:", error);
      throw error;
    }
  },

  async obtenerTurnoPorId(id_turno) {
    console.log(`[SERVICE] Llamando a GET para Turno ID: ${id_turno}`);

    const response = await fetch(`${API_BASE_URL}/${id_turno}`);

    if (!response.ok) {
        const errorDetail = await getErrorDetail(response);
        throw new Error(errorDetail || `Error al obtener el turno ID ${id_turno}.`);
    }

    return await response.json();
  },

  // ============================
  // CREAR O ACTUALIZAR (PUT/POST)
  // ============================

  async crearOActualizarTurno(id_turno, datosPayload, method) {
    const url = id_turno ? `${API_BASE_URL}/${id_turno}` : API_BASE_URL;
    console.log(`[SERVICE] Llamando a ${method} en URL: ${url} con payload:`, datosPayload);


    const response = await fetch(url, {
      method: method,
      headers: {'Content-Type': 'application/json'},
      // Convertir fechas y horas a strings si Pydantic no lo hace automáticamente
      body: JSON.stringify(datosPayload),
    });

    if (!response.ok) {
      // Capturamos el mensaje de error para mostrar validaciones de superposición/unicidad
      const errorDetail = await getErrorDetail(response);
      throw new Error(errorDetail || `Error en el servidor al intentar ${method}.`);

    }
    try {
      // Intenta devolver el objeto creado/actualizado si la respuesta no es 204
      if (response.status !== 204) {
          return await response.json();
      }
      return {}; // Respuesta 204 (No Content)
    } catch (e) {
      console.warn(`Operación ${method} exitosa pero falló la lectura del JSON de respuesta. Asumiendo éxito.`, e);
      return {};
    }
  },

  async actualizarTurno(id_turno, datosActualizados) {
    return this.crearOActualizarTurno(id_turno, datosActualizados, 'PUT');
  },

  async crearTurno(datosNuevaTurno) {
    return this.crearOActualizarTurno(null, datosNuevaTurno, 'POST');
  },

  // ============================
  // ELIMINAR
  // ============================

  async eliminarTurno(id_turno) {
    console.log(`[SERVICE] Llamando a DELETE para Turno ID: ${id_turno}`);

    const response = await fetch(`${API_BASE_URL}/${id_turno}`, { method: 'DELETE' });

    if (!response.ok) {
        const errorDetail = await getErrorDetail(response);
        throw new Error(errorDetail || `Error al eliminar el turno ID ${id_turno}.`);
    }

    // La respuesta DELETE puede ser 204 No Content
    return true;
  },
};