from abc import ABC, abstractmethod
class Cancha(ABC):
    """Clase base abstracta para las distintas canchas deportivas."""

    def __init__(
        self,
        id_cancha=None,
        nombre=None,
        tipo=None,
        estado="disponible",
        precio_base=0.0,
        techada=False,
        iluminacion=False,
        reservas=None,
        tamaño=None,
        superficie=None
    ):
        self.id_cancha = id_cancha
        self.nombre = nombre
        self.tipo = tipo
        self.estado = estado
        self.precio_base = precio_base
        self.techada = techada
        self.iluminacion = iluminacion
        self.tamaño = tamaño
        self.superficie = superficie
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


    def __repr__(self):
        return f"<Cancha {self.id_cancha}: {self.tipo} ({self.__class__.__name__})>"
