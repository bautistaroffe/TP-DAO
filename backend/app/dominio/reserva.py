class Reserva:
    def __init__(
        self,
        id_reserva=None,
        id_cancha=None,
        id_turno=None,
        id_cliente=None,
        id_torneo=None,
        precio_total=0.0,
        estado="pendiente",
        origen="online"
    ):
        self.id_reserva = id_reserva
        self.id_cancha = id_cancha
        self.id_turno = id_turno
        self.id_cliente = id_cliente
        self.id_torneo = id_torneo
        self.precio_total = precio_total
        self.estado = estado
        self.origen = origen

    def calcular_costo_reserva(self, cancha, servicios=[]):
        """Calcula el costo combinando cancha + servicios adicionales."""
        total = cancha.calcular_precio_total()
        for s in servicios:
            total += s.calcular_precio_agregado()
        self.precio_total = total
        return total

    def __repr__(self):
        return f"<Reserva {self.id_reserva}: cancha={self.id_cancha}, cliente={self.id_cliente}, total=${self.precio_total}>"
