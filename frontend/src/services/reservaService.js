// src/services/reservaService.js
const API_URL = "http://localhost:8000/api/reservas"; // ajustá si tu backend usa otro puerto

export async function crearReserva(datos) {
  const response = await fetch(`${API_URL}/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(datos),
  });
  if (!response.ok) throw new Error("Error al crear la reserva");
  return response.json();
}

export async function listarReservas() {
  const response = await fetch(`${API_URL}/`);
  return response.json();
}
