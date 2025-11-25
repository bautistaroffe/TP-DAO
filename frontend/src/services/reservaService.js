const API_BASE_URL = "http://localhost:8000/api/reservas";

/**
 * Intenta extraer un mensaje de error detallado del cuerpo de la respuesta HTTP.
 */
const getErrorDetail = async (response) => {
    try {
        const errorData = await response.json();
        return errorData.detail || errorData.message || response.statusText;
    } catch {
        return response.statusText;
    }
};

export const reservaService = {

  async obtenerReservas() {
    console.log(`Intentando obtener reservas desde: ${API_BASE_URL}`);

    try {
      // 1. Realizar la solicitud HTTP GET
      const response = await fetch(API_BASE_URL);

      // 2. Verificar el estado de la respuesta
      if (!response.ok) {
        // Si el estado es 4xx o 5xx, lanzamos un error con más detalle
        const errorDetail = await response.text(); // Intentamos obtener el cuerpo del error
        throw new Error(`Error en el servidor (${response.status} ${response.statusText}): ${errorDetail}`);
      }

      // 3. Convertir la respuesta a JSON
      const reservas = await response.json();

      // 4. Devolver los datos (los DTOs)
      return reservas;

    } catch (error) {
      console.error("Fallo al obtener la lista de reservas:", error);
      // Propagamos el error para que el componente de la UI pueda mostrar un mensaje al usuario
      throw error;
    }
  },

  async eliminarReserva(id_reserva) {
    console.log(`[SERVICE] Llamando a DELETE para Reserva ID: ${id_reserva}`);

    const response = await fetch(`${API_BASE_URL}/${id_reserva}`, { method: 'DELETE' });

    if (!response.ok) {
        const errorDetail = await response.text();
        throw new Error(`Error al eliminar la reserva: ${response.status} ${response.statusText} - ${errorDetail}`);
    }

    return true; // Éxito en la eliminación
  },

  /**
   * Crea una nueva reserva. Este método es requerido por ReservaForm.jsx.
   * @param {object} datosNuevaReserva Payload con id_cancha, id_turno, id_cliente.
   * @returns {Promise<object>} Objeto de reserva creada.
   */
  async crearReserva(datosNuevaReserva) {
    console.log(`[SERVICE] Llamando a POST en ${API_BASE_URL} con payload:`, datosNuevaReserva);

    const response = await fetch(API_BASE_URL, {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify(datosNuevaReserva),
    });

    if (!response.ok) {
      const errorDetail = await getErrorDetail(response);
      throw new Error(errorDetail || `Error en el servidor al intentar crear la reserva.`);
    }

    try {
      return await response.json();
    } catch (e) {
      console.warn(`Operación POST exitosa pero falló la lectura del JSON de respuesta. Asumiendo éxito.`, e);
      return {};
    }
  },

  async modificarReserva(id_reserva, datosReservaActualizada) {
    console.log(`[SERVICE] Llamando a PUT en ${API_BASE_URL}/${id_reserva} con payload:`, datosReservaActualizada);

    const response = await fetch(`${API_BASE_URL}/${id_reserva}`, {
      method: 'PUT',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify(datosReservaActualizada),
    });

    if (!response.ok) {
      const errorDetail = await getErrorDetail(response);
      throw new Error(errorDetail || `Error en el servidor al intentar modificar la reserva.`);
    }

    try {
      return await response.json();
    } catch (e) {
      console.warn(`Operación PUT exitosa pero falló la lectura del JSON de respuesta. Asumiendo éxito.`, e);
      return {};
    }
  }
};