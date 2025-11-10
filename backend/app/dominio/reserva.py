

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




    def __repr__(self):
        return (
            f"<Reserva {self.id_reserva}: cliente={self.id_cliente}, "
            f"cancha={self.id_cancha}, servicio={self.id_servicio}, total=${self.precio_total}>"
        )
