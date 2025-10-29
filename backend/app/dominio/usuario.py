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
        self.reservas = reservas if reservas else []

    def nombre_completo(self):
        return f"{self.nombre} {self.apellido}"

    def esta_activo(self):
        return self.estado == "activo"

    def __repr__(self):
        return f"<Usuario {self.id_usuario}: {self.nombre_completo()}>"
