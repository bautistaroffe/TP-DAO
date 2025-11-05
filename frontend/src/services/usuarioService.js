import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

export async function obtenerUsuarios() {
  const res = await axios.get(`${API_URL}/usuarios`);
  return res.data;
}

export async function crearUsuario(usuario) {
  const res = await axios.post(`${API_URL}/usuarios`, usuario);
  return res.data;
}

export async function eliminarUsuario(id_usuario) {
  const res = await axios.delete(`${API_URL}/usuarios/${id_usuario}`);
  return res.data;
}
