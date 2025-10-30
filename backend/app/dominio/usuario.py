from backend.app.repositorios.usuario_repo import UsuarioRepository


class Usuario:
    def __init__(
        self,
        id_usuario=None,
        dni=None,
        nombre=None,
        apellido=None,
        telefono=None,
        email=None,
        estado="activo",
        reservas=None
    ):
        self.id_usuario = id_usuario
        self.dni = dni
        self.nombre = nombre
        self.apellido = apellido
        self.telefono = telefono
        self.email = email
        self.estado = estado
        self.reservas = reservas if reservas else []  # lista de reservas del usuario

    def nombre_completo(self):
        return f"{self.nombre} {self.apellido}"

    def esta_activo(self):
        return self.estado == "activo"

        # ===========================================
        # Métodos ABM de alto nivel (delegan al repo)
        # ===========================================

    def guardar(self):
        """
        Guarda o actualiza el usuario en la base de datos.
        Si no tiene id_usuario, se inserta.
        Si ya tiene id_usuario, se actualiza.
        """
        repo = UsuarioRepository()
        if self.id_usuario:
            repo.actualizar(self)
        else:
            repo.agregar(self)
        repo.cerrar()
        return self

    def eliminar(self):
        """Elimina el usuario de la base de datos."""
        if not self.id_usuario:
            raise ValueError("El usuario no existe en la base de datos.")
        repo = UsuarioRepository()
        repo.eliminar(self.id_usuario)
        repo.cerrar()

    @staticmethod
    def listar_todos():
        """Devuelve una lista de todos los usuarios registrados."""
        repo = UsuarioRepository()
        usuarios = repo.listar_todos()
        repo.cerrar()
        return usuarios

    @staticmethod
    def obtener_por_id(id_usuario):
        """Devuelve un usuario por su ID o None si no existe."""
        repo = UsuarioRepository()
        usuario = repo.obtener_por_id(id_usuario)
        repo.cerrar()
        return usuario

    def __repr__(self):
        return f"<Usuario {self.id_usuario}: {self.nombre_completo()} ({len(self.reservas)} reservas)>"
