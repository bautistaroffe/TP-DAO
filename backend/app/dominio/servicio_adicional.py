from backend.app.repositorios.adicional_repo import AdicionalRepository


class ServicioAdicional:
    """Servicios adicionales contratables por las reservas."""

    def __init__(
        self,
        id_servicio=None,
        cant_personas_asado=0,
        arbitro=False,
        partido_grabado=False,
        pecheras=False,
        cant_paletas=0,
        reservas=None,  # lista de reservas asociadas a este servicio
    ):
        self.id_servicio = id_servicio
        self.cant_personas_asado = cant_personas_asado
        self.arbitro = arbitro
        self.partido_grabado = partido_grabado
        self.pecheras = pecheras
        self.cant_paletas = cant_paletas
        self.reservas = reservas if reservas else []

    def calcular_precio_agregado(self):
        """Calcula el precio total de los servicios adicionales."""
        total = 0
        if self.arbitro:
            total += 2000
        if self.partido_grabado:
            total += 1500
        if self.pecheras:
            total += 800
        total += self.cant_personas_asado * 500
        total += self.cant_paletas * 300
        return total


    # ===========================================
    # MÉTODOS ABM (Altas, Bajas, Modificaciones, Consultas)
    # ===========================================

    def guardar(self):
        """
        Guarda o actualiza el registro en la base de datos.
        Si no tiene ID, se inserta; si ya tiene ID, se actualiza.
        """
        repo = AdicionalRepository()
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
        repo = AdicionalRepository()
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
        repo = AdicionalRepository()
        objetos = repo.listar_todos()
        repo.cerrar()
        return objetos

    @staticmethod
    def obtener_por_id(id_valor):
        """
        Devuelve un registro según su ID, o None si no existe.
        """
        repo = AdicionalRepository()
        objeto = repo.obtener_por_id(id_valor)
        repo.cerrar()
        return objeto


    def __repr__(self):
        return f"<ServicioAdicional {self.id_servicio}: total=${self.calcular_precio_agregado()}>"
