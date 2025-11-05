import { useEffect, useState } from "react";
import { obtenerUsuarios, eliminarUsuario } from "../../services/usuarioService";
import UsuarioForm from "../forms/UsuarioForm";
import "./tables.css";

export default function UsuariosTable() {
  const [usuarios, setUsuarios] = useState([]);
  const [mostrarForm, setMostrarForm] = useState(false);

  const cargarUsuarios = async () => {
    const data = await obtenerUsuarios();
    setUsuarios(data);
  };

  const handleEliminar = async (id_usuario) => {
    if (confirm("¿Eliminar usuario? (Baja lógica)")) {
      await eliminarUsuario(id_usuario);
      cargarUsuarios();
    }
  };

  useEffect(() => {
    cargarUsuarios();
  }, []);

  return (
    <section className="tabla-seccion">
      <div className="tabla-header">
        <h3>Usuarios</h3>
        <button onClick={() => setMostrarForm(!mostrarForm)}>
          {mostrarForm ? "Cerrar" : "Nuevo Usuario"}
        </button>
      </div>

      {mostrarForm && <UsuarioForm onGuardar={cargarUsuarios} />}

      <table className="tabla">
        <thead>
          <tr>
            <th>ID</th>
            <th>DNI</th>
            <th>Nombre</th>
            <th>Apellido</th>
            <th>Email</th>
            <th>Teléfono</th>
            <th>Estado</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {usuarios.map((u) => (
            <tr key={u.id_usuario}>
              <td>{u.id_usuario}</td>
              <td>{u.dni}</td>
              <td>{u.nombre}</td>
              <td>{u.apellido}</td>
              <td>{u.email}</td>
              <td>{u.telefono}</td>
              <td>{u.estado}</td>
              <td>
                <button onClick={() => handleEliminar(u.id_usuario)}>🗑️</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}
