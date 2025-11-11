from backend.app.dominio.usuario import Usuario
from backend.app.repositorios.base_repo import BaseRepository

class UsuarioRepository(BaseRepository):
    """CRUD para la tabla Usuario."""

    def agregar(self, usuario: Usuario):
        self.ejecutar("""
            INSERT INTO Usuario (dni, nombre, apellido, telefono, email, estado)
            VALUES (?, ?, ?, ?, ?, ?)
        """, (usuario.dni, usuario.nombre, usuario.apellido, usuario.telefono, usuario.email, usuario.estado))
        usuario.id_usuario = self.cursor.lastrowid
        return usuario

    def listar_todos(self):
        filas = self.obtener_todos("SELECT * FROM Usuario")
        return [Usuario(**f) for f in filas]

    def obtener_por_id(self, id_usuario):
        fila = super().obtener_por_id("Usuario", "id_usuario", id_usuario)
        return Usuario(**fila) if fila else None

    def actualizar(self, usuario: Usuario):
        self.ejecutar("""
            UPDATE Usuario
            SET nombre=?, apellido=?, telefono=?, email=?, estado=?
            WHERE id_usuario=?
        """, (usuario.nombre, usuario.apellido, usuario.telefono, usuario.email, usuario.estado, usuario.id_usuario))

    def eliminar(self, id_usuario):
        self.ejecutar("DELETE FROM Usuario WHERE id_usuario=?", (id_usuario,))
