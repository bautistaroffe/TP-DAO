
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


    def __repr__(self):
        return f"<Turno {self.id_turno}: {self.fecha} {self.hora_inicio}-{self.hora_fin}>"
