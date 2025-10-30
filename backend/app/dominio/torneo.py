from backend.app.repositorios.torneo_repo import TorneoRepository


class Torneo:
    def __init__(
        self,
        id_torneo=None,
        nombre=None,
        categoria=None,
        fecha_inicio=None,
        fecha_fin=None,
        estado="programado"
    ):
        self.id_torneo = id_torneo
        self.nombre = nombre
        self.categoria = categoria
        self.fecha_inicio = fecha_inicio
        self.fecha_fin = fecha_fin
        self.estado = estado

    # ===========================================
    # MÉTODOS ABM (Altas, Bajas, Modificaciones, Consultas)
    # ===========================================

    def guardar(self):
        """
        Guarda o actualiza el registro en la base de datos.
        Si no tiene ID, se inserta; si ya tiene ID, se actualiza.
        """
        repo = TorneoRepository()
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
        repo = TorneoRepository()
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
        repo = TorneoRepository()
        objetos = repo.listar_todos()
        repo.cerrar()
        return objetos

    @staticmethod
    def obtener_por_id(id_valor):
        """
        Devuelve un registro según su ID, o None si no existe.
        """
        repo = TorneoRepository()
        objeto = repo.obtener_por_id(id_valor)
        repo.cerrar()
        return objeto


    def __repr__(self):
        return f"<Torneo {self.id_torneo}: {self.nombre} ({self.categoria})>"
