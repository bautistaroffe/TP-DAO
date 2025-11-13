const API_BASE_URL = "http://localhost:8000/api/torneos";
const getErrorDetail = async (response) => {
    try {
        const errorData = await response.json();
        // Devuelve el detalle, mensaje o el texto del estado HTTP
        return errorData.detail || errorData.message || response.statusText;
    } catch {
        // Si no es JSON válido, devuelve el texto del estado
        return response.statusText;
    }
};
export const torneoService = {

  async obtenerTorneos() {
    console.log(`Intentando obtener torneos desde: ${API_BASE_URL}`);

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
      const torneos = await response.json();

      // 4. Devolver los datos (los DTOs)
      return torneos;

    } catch (error) {
      console.error("Fallo al obtener la lista de torneos:", error);
      // Propagamos el error para que el componente de la UI pueda mostrar un mensaje al usuario
      throw error;
    }
  },
  async eliminarTorneo(id_torneo) {
    console.log(`[SERVICE] Llamando a DELETE para Pago ID: ${id_torneo}`);

    const response = await fetch(`${API_BASE_URL}/${id_torneo}`, { method: 'DELETE' });

    if (!response.ok) {
        const errorDetail = await response.text();
        throw new Error(`Error al eliminar el torneo: ${response.status} ${response.statusText} - ${errorDetail}`);
    }

    return true; // Éxito en la eliminación
  },
    async crearOActualizarTorneo(id_torneo, datosPayload, method) {
        const url = id_torneo ? `${API_BASE_URL}/${id_torneo}` : API_BASE_URL;

        const response = await fetch(url, {
            method: method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(datosPayload),
        });

        if (!response.ok) {
            const errorDetail = await getErrorDetail(response);
            // Error real del servidor (4xx o 5xx)
            throw new Error(errorDetail || `Error en el servidor al intentar ${method}.`);
        }

        try {
            // Devuelve el DTO de la cancha actualizada/creada
            return await response.json();
        } catch (e) {
            // Esto captura el error de serialización (ej: 'tipo' es None).
            console.warn(`Operación ${method} exitosa pero falló la lectura del JSON de respuesta. Asumiendo éxito.`, e);
            // Retorna un objeto vacío para indicar que la operación fue OK (el onSuccess del Form lo maneja).
            return {};
        }
    },
    async ActualizarTorneo(id_torneo, datosActualizados) {
        return this.crearOActualizarTorneo(id_torneo, datosActualizados, 'PUT');
    },
    async crearTorneo(datosNuevaTorneo) {
        return this.crearOActualizarTorneo(null, datosNuevaTorneo, 'POST');
    },
  // Aquí podrías agregar más métodos.
};