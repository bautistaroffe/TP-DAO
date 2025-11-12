const API_BASE_URL = "http://localhost:8000/api/canchas";
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
export const canchaService = {

  async obtenerCanchas() {
    console.log(`Intentando obtener canchas desde: ${API_BASE_URL}`);

    try {
      // 1. Realizar la solicitud HTTP GET
      const response = await fetch(API_BASE_URL);
      console.log("📡 Estado de respuesta:", response.status);
      console.log("✅ Canchas recibidas:");

      // 2. Verificar el estado de la respuesta
      if (!response.ok) {
        // Si el estado es 4xx o 5xx, lanzamos un error con más detalle
        const errorDetail = await getErrorDetail(response); // Intentamos obtener el cuerpo del error
        throw new Error(`Error en el servidor (${response.status} ${response.statusText}): ${errorDetail}`);
      }

      // 3. Convertir la respuesta a JSON
      const canchas = await response.json();
      console.log("datos json: ", canchas)

      // 4. Devolver los datos (los DTOs)
      return canchas;

    } catch (error) {
      console.error("Fallo al obtener la lista de canchas:", error);
      // Propagamos el error para que el componente de la UI pueda mostrar un mensaje al usuario
      throw error;
    }
  },
  async eliminarCancha(id_cancha) {
    console.log(`[SERVICE] Llamando a DELETE para Cancha ID: ${id_cancha}`);

    const response = await fetch(`${API_BASE_URL}/${id_cancha}`, { method: 'DELETE' });

    if (!response.ok) {
        const errorDetail = await getErrorDetail(response);
        throw new Error(`Error al eliminar la cancha: ${response.status} ${response.statusText} - ${errorDetail}`);
    }

    return true; // Éxito en la eliminación
  },
  async obtenerCanchaPorId(id_cancha) {
        const response = await fetch(`${API_BASE_URL}/${id_cancha}`);

        if (!response.ok) {
            const errorDetail = await getErrorDetail(response);
            throw new Error(`Error al obtener cancha ID ${id_cancha}: ${errorDetail}`);
        }
        return await response.json();
    },
  async crearOActualizarCancha(id_cancha, datosPayload, method) {
        const url = id_cancha ? `${API_BASE_URL}/${id_cancha}` : API_BASE_URL;

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

        // --- MANEJO DE RESPUESTA DE ÉXITO (HTTP 2xx) ---
        // Si el estado es 200/201, pero el backend falló al serializar el DTO de respuesta,
        // intentamos leer el JSON, pero si falla, asumimos éxito.
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

    async actualizarCancha(id_cancha, datosActualizados) {
        return this.crearOActualizarCancha(id_cancha, datosActualizados, 'PUT');
    },

    async crearCancha(datosNuevaCancha) {
        return this.crearOActualizarCancha(null, datosNuevaCancha, 'POST');
    },


  // Aquí podrías agregar más métodos como obtenerCanchaPorId, crearCancha, etc.
};