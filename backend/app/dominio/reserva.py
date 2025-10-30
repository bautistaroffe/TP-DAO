from backend.app.repositorios.reserva_repo import ReservaRepository


class Reserva:
    def __init__(
        self,
        id_reserva=None,
        id_cancha=None,
        id_turno=None,
        id_cliente=None,
        id_torneo=None,
        id_servicio=None,
        precio_total=0.0,
        estado="pendiente",
        origen="online"
    ):
        self.id_reserva = id_reserva
        self.id_cancha = id_cancha
        self.id_turno = id_turno
        self.id_cliente = id_cliente
        self.id_torneo = id_torneo
        self.id_servicio = id_servicio  # ← nueva relación 1–1 con ServicioAdicional
        self.precio_total = precio_total
        self.estado = estado
        self.origen = origen

    def calcular_costo_reserva(self, cancha, servicio=None):
        """Calcula el costo combinando cancha + servicio adicional."""
        total = cancha.calcular_precio_total()
        if servicio:
            total += servicio.calcular_precio_agregado()
        self.precio_total = total
        return total


    # ===========================================
    # MÉTODOS ABM (Altas, Bajas, Modificaciones, Consultas)
    # ===========================================

    def guardar(self):
        """
        Guarda o actualiza el registro en la base de datos.
        Si no tiene ID, se inserta; si ya tiene ID, se actualiza.
        """
        repo = ReservaRepository()
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
        repo = ReservaRepository()
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
        repo = ReservaRepository()
        objetos = repo.listar_todos()
        repo.cerrar()
        return objetos

    @staticmethod
    def obtener_por_id(id_valor):
        """
        Devuelve un registro según su ID, o None si no existe.
        """
        repo = ReservaRepository()
        objeto = repo.obtener_por_id(id_valor)
        repo.cerrar()
        return objeto


    def __repr__(self):
        return (
            f"<Reserva {self.id_reserva}: cliente={self.id_cliente}, "
            f"cancha={self.id_cancha}, servicio={self.id_servicio}, total=${self.precio_total}>"
        )
