import { useState } from "react";
import { crearUsuario } from "../../services/usuarioService";

export default function UsuarioForm({ onGuardar }) {
  const [form, setForm] = useState({
    dni: "",
    nombre: "",
    apellido: "",
    telefono: "",
    email: "",
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await crearUsuario(form);
    onGuardar();
    setForm({ dni: "", nombre: "", apellido: "", telefono: "", email: "" });
  };

  return (
    <form className="formulario" onSubmit={handleSubmit}>
      <input name="dni" placeholder="DNI" value={form.dni} onChange={handleChange} required />
      <input name="nombre" placeholder="Nombre" value={form.nombre} onChange={handleChange} required />
      <input name="apellido" placeholder="Apellido" value={form.apellido} onChange={handleChange} required />
      <input name="telefono" placeholder="Teléfono" value={form.telefono} onChange={handleChange} />
      <input name="email" placeholder="Email" value={form.email} onChange={handleChange} />
      <button type="submit">Guardar</button>
    </form>
  );
}
