const API_BASE_URL = "http://localhost:8000/api/torneos";

const getErrorDetail = async (response) => {
  try {
    const errorData = await response.json();
    // Si viene array o objeto, lo retornamos tal cual
    return errorData.detail || errorData.message || errorData || response.statusText;
  } catch {
    return response.statusText;
  }
};

export const torneoService = {
  async obtenerTorneos() {
    try {
      const response = await fetch(API_BASE_URL);
      if (!response.ok) {
        const errorDetail = await response.text();
        throw new Error(`Error en el servidor (${response.status}): ${errorDetail}`);
      }
      return await response.json();
    } catch (error) {
      console.error("Fallo al obtener torneos:", error);
      throw error;
    }
  },

  async eliminarTorneo(id_torneo) {
    const response = await fetch(`${API_BASE_URL}/${id_torneo}`, { method: 'DELETE' });
    if (!response.ok) {
      const errorDetail = await getErrorDetail(response);
      throw new Error(
        Array.isArray(errorDetail) ? JSON.stringify(errorDetail, null, 2) : errorDetail
      );
    }
    return true;
  },

  async crearOActualizarTorneo(id_torneo, datosPayload, method) {
    const url = id_torneo ? `${API_BASE_URL}/${id_torneo}` : API_BASE_URL;
    const response = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(datosPayload),
    });

    if (!response.ok) {
      const errorDetail = await getErrorDetail(response);
      throw new Error(
        Array.isArray(errorDetail) ? JSON.stringify(errorDetail, null, 2) : errorDetail
      );
    }

    try {
      return await response.json();
    } catch (e) {
      console.warn(`Operación ${method} exitosa pero falló la lectura del JSON de respuesta.`, e);
      return {};
    }
  },

  async ActualizarTorneo(id_torneo, datosActualizados) {
    return this.crearOActualizarTorneo(id_torneo, datosActualizados, 'PUT');
  },

  async crearTorneo(datosNuevaTorneo) {
    return this.crearOActualizarTorneo(null, datosNuevaTorneo, 'POST');
  },
};
