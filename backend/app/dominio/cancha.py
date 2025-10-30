from abc import ABC, abstractmethod
from backend.app.repositorios.cancha_repo import CanchaRepository
class Cancha(ABC):
    """Clase base abstracta para las distintas canchas deportivas."""

    def __init__(
        self,
        id_cancha=None,
        nombre=None,
        estado="disponible",
        precio_base=0.0,
        techada=False,
        iluminacion=False,
        reservas=None
    ):
        self.id_cancha = id_cancha
        self.nombre = nombre
        self.estado = estado
        self.precio_base = precio_base
        self.techada = techada
        self.iluminacion = iluminacion
        self.reservas = reservas if reservas is not None else []

    # --------------------------------
    # Métodos de negocio comunes
    # --------------------------------
    def agregar_reserva(self, reserva):
        """Agrega una reserva asociada a esta cancha."""
        self.reservas.append(reserva)

    def tiene_iluminacion(self):
        return bool(self.iluminacion)

    def esta_techada(self):
        return bool(self.techada)

    # --------------------------------
    # Método abstracto (polimórfico)
    # --------------------------------
    @abstractmethod
    def calcular_precio_total(self):
        """Cada tipo de cancha implementa su propio cálculo."""
        pass

    # ===========================================
    # MÉTODOS ABM (Altas, Bajas, Modificaciones, Consultas)
    # ===========================================

    def guardar(self):
        """
        Guarda o actualiza el registro en la base de datos.
        Si no tiene ID, se inserta; si ya tiene ID, se actualiza.
        """
        repo = CanchaRepository()
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
        repo = CanchaRepository()
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
        repo = CanchaRepository()
        objetos = repo.listar_todos()
        repo.cerrar()
        return objetos

    @staticmethod
    def obtener_por_id(id_valor):
        """
        Devuelve un registro según su ID, o None si no existe.
        """
        repo = CanchaRepository()
        objeto = repo.obtener_por_id(id_valor)
        repo.cerrar()
        return objeto


    def __repr__(self):
        return f"<Cancha {self.id_cancha}: {self.nombre} ({self.__class__.__name__})>"
