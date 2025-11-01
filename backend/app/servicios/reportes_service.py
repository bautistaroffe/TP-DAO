from backend.app.dominio.reserva import Reserva
from backend.app.repositorios.reserva_repo import ReservaRepository
from backend.app.repositorios.cancha_repo import CanchaRepository
from backend.app.repositorios.adicional_repo import ServicioAdicionalRepository
from backend.app.repositorios.turno_repo import TurnoRepository

class ReportesService:
    def __init__(self):
        self.reserva_repo = ReservaRepository()
        self.cancha_repo = CanchaRepository()
        self.turno_repo = TurnoRepository()
        self.servicio_repo = ServicioAdicionalRepository()

    def generar_reporte_reservas_por_cliente(self, id_cliente):
        """Genera un reporte de todas las reservas realizadas por un cliente específico."""
        reservas = self.reserva_repo.obtener_por_cliente(id_cliente)
        reporte = []
        for reserva in reservas:
            cancha = self.cancha_repo.obtener_por_id(reserva.id_cancha)
            turno = self.turno_repo.obtener_por_id(reserva.id_turno)
            servicio_adicional = self.servicio_repo.obtener_por_id(reserva.id_servicio) if reserva.id_servicio else None

            reporte.append({
                "id_reserva": reserva.id_reserva,
                "cancha": cancha.nombre if cancha else "Desconocida",
                "fecha_turno": turno.fecha if turno else "Desconocida",
                "turno": f"{turno.hora_inicio} - {turno.hora_fin}" if turno else "Desconocido",
                "servicio_adicional": servicio_adicional.nombre if servicio_adicional else "Ninguno",
                "costo_total": reserva.precio_total,
                "estado": reserva.estado,
                "origen": reserva.origen
            })
        return reporte

    def generar_reporte_reservas_por_cancha_en_periodo(self, id_cancha, fecha_inicio, fecha_fin):
        reservas = self.reserva_repo.obtener_reservas_por_cancha_y_periodo( id_cancha, fecha_inicio, fecha_fin)
        reporte = []
        for reserva in reservas:
            turno = self.turno_repo.obtener_por_id(reserva.id_turno)
            servicio_adicional = self.servicio_repo.obtener_por_id(reserva.id_servicio) if reserva.id_servicio else None

            reporte.append({
                "id_reserva": reserva.id_reserva,
                "fecha_turno": turno.fecha if turno else "Desconocida",
                "turno": f"{turno.hora_inicio} - {turno.hora_fin}" if turno else "Desconocido",
                "servicio_adicional": servicio_adicional.nombre if servicio_adicional else "Ninguno",
                "costo_total": reserva.precio_total,
                "estado": reserva.estado,
                "origen": reserva.origen
            })
        return reporte
