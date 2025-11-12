const API_BASE_URL = "http://localhost:8000/api/torneos";

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
  }

  // Aquí podrías agregar más métodos.
};