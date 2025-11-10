

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


    def __repr__(self):
        return f"<ServicioAdicional {self.id_servicio}: total=${self.calcular_precio_agregado()}>"
