// src/services/reservaService.js
const API_URL = "http://localhost:8000/api/reservas";

export async function crearReserva(datos) {
  const response = await fetch(`${API_URL}/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(datos),
  });

  // 👇 CLAVE: Si la respuesta no es OK, intentamos leer el mensaje de error del cuerpo
  if (!response.ok) {
    let errorMessage = "Error desconocido al crear la reserva.";
    try {
      // Intentamos parsear el JSON para ver si el backend envió un cuerpo de error
      const errorBody = await response.json();
      // Asumiendo que tu API devuelve el mensaje de error en un campo 'detalle' o 'mensaje'
      // Ajusta 'detail' o 'mensaje' según cómo tu backend formatea el error
      errorMessage = errorBody.detail || errorBody.mensaje || errorBody.error || `Error del servidor (${response.status}).`;
    } catch (e) {
      // Si falla la lectura del cuerpo, usamos el estado HTTP
      errorMessage = `Error ${response.status}: ${response.statusText}`;
    }

    // Lanzamos el error con el mensaje detallado para que el formulario lo muestre
    throw new Error(errorMessage);
  }

  return response.json();
}

export async function listarReservas() {
  const response = await fetch(`${API_URL}/`);
  return response.json();
}
