const API_BASE_URL = "http://localhost:8000/api/pagos";

export const pagoService = {

  async obtenerPagos() {
    console.log(`Intentando obtener pagos desde: ${API_BASE_URL}`);

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
      const pagos = await response.json();

      // 4. Devolver los datos (los DTOs)
      return pagos;

    } catch (error) {
      console.error("Fallo al obtener la lista de pagos:", error);
      // Propagamos el error para que el componente de la UI pueda mostrar un mensaje al usuario
      throw error;
    }
  },
  async eliminarPago(id_pago) {
    console.log(`[SERVICE] Llamando a DELETE para Pago ID: ${id_pago}`);

    const response = await fetch(`${API_BASE_URL}/${id_pago}`, { method: 'DELETE' });

    if (!response.ok) {
        const errorDetail = await response.text();
        throw new Error(`Error al eliminar el pago: ${response.status} ${response.statusText} - ${errorDetail}`);
    }

    return true; // Éxito en la eliminación
  }

  // Aquí podrías agregar más métodos.
};