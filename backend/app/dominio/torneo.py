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

    def __repr__(self):
        return f"<Torneo {self.id_torneo}: {self.nombre} ({self.categoria})>"
