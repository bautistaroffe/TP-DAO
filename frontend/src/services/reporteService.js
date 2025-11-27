// src/services/reporteService.js
const API_URL = "http://127.0.0.1:8000/api/reportes";

export async function getReservasPorCliente(idCliente, fechaInicio, fechaFin) {
  const url = `${API_URL}/reservas-cliente?id_cliente=${idCliente}&fecha_inicio=${fechaInicio}&fecha_fin=${fechaFin}`;
  const res = await fetch(url);
  const data = await res.json();
  return data; // Devuelve { cliente, reservas }
}



export async function getReservasPorCancha(idCancha, fechaInicio, fechaFin) {
  const url = `http://127.0.0.1:8000/api/reportes/reservas-cancha?id_cancha=${idCancha}&fecha_inicio=${fechaInicio}&fecha_fin=${fechaFin}`;

  console.log("📡 GET:", url); //  Te muestra la URL completa

  const res = await fetch(url);

  if (!res.ok) {
    const errorText = await res.text();
    console.error("⚠️ Respuesta del servidor:", errorText);
    throw new Error("Error al obtener reservas por cancha");
  }

  return await res.json();
}


export async function getCanchasMasUsadas(top = 5) {
  const res = await fetch(`${API_URL}/canchas-mas-usadas?top_n=${top}`);
  if (!res.ok) throw new Error("Error al obtener canchas más usadas");
  return await res.json();
}

export async function getUtilizacionMensual(anio, mes = null) {
  const url = mes
    ? `${API_URL}/utilizacion-mensual?anio=${anio}&mes=${mes}`
    : `${API_URL}/utilizacion-mensual?anio=${anio}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error("Error al obtener utilización mensual");
  return await res.json();
}

