from backend.app.repositorios.turno_repo import TurnoRepository

class Turno:
    def __init__(
        self,
        id_turno=None,
        id_cancha=None,
        fecha=None,
        hora_inicio=None,
        hora_fin=None,
        estado="disponible"
    ):
        self.id_turno = id_turno
        self.id_cancha = id_cancha
        self.fecha = fecha
        self.hora_inicio = hora_inicio
        self.hora_fin = hora_fin
        self.estado = estado

    def duracion_horas(self):
        """Calcula duración (si las horas son objetos datetime.time)."""
        if not (self.hora_inicio and self.hora_fin):
            return 0
        hi = int(str(self.hora_inicio).split(":")[0])
        hf = int(str(self.hora_fin).split(":")[0])
        return max(0, hf - hi)

    def guardar(self):
        """
        Guarda o actualiza el registro en la base de datos.
        Si no tiene ID, se inserta; si ya tiene ID, se actualiza.
        """
        repo = TurnoRepository()
        if getattr(self, 'id_' + self.__class__.__name__.lower()):
            repo.actualizar(self)
        else:
            repo.agregar(self)
        repo.cerrar()
        return self

    def eliminar(self):
        """
        Elimina el registro actual de la base de datos.
        """
        repo = TurnoRepository()
        id_attr = 'id_' + self.__class__.__name__.lower()
        id_valor = getattr(self, id_attr, None)
        if not id_valor:
            raise ValueError(f"{self.__class__.__name__} no existe en la base de datos.")
        repo.eliminar(id_valor)
        repo.cerrar()

    @staticmethod
    def listar_todos():
        """
        Devuelve una lista de todos los registros de esta entidad.
        """
        repo = TurnoRepository()
        objetos = repo.listar_todos()
        repo.cerrar()
        return objetos

    @staticmethod
    def obtener_por_id(id_valor):
        """
        Devuelve un registro según su ID, o None si no existe.
        """
        repo = TurnoRepository()
        objeto = repo.obtener_por_id(id_valor)
        repo.cerrar()
        return objeto

    def __repr__(self):
        return f"<Turno {self.id_turno}: {self.fecha} {self.hora_inicio}-{self.hora_fin}>"
