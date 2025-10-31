from backend.app.dominio.reserva import Reserva
from backend.app.repositorios.reserva_repo import ReservaRepository
from backend.app.repositorios.cancha_repo import CanchaRepository
from backend.app.repositorios.adicional_repo import ServicioAdicionalRepository
from backend.app.repositorios.turno_repo import TurnoRepository
from backend.app.bd import create_db

class ReservaService:
    def __init__(self):
        self.reserva_repo = ReservaRepository()
        self.cancha_repo = CanchaRepository()
        self.turno_repo = TurnoRepository()
        self.servicio_repo = ServicioAdicionalRepository()


    def crear_reserva(self, id_cancha, id_turno, id_cliente, id_torneo=None, id_servicio=None, origen="online"):
        try:
            if not self.turno_disponible(id_cancha, id_turno):
                raise ValueError("El turno seleccionado no está disponible.")

            cancha = self.cancha_repo.obtener_por_id(id_cancha)
            servicio_adicional = self.servicio_repo.obtener_por_id(id_servicio) if id_servicio else None

            reserva = Reserva(
                id_cancha=id_cancha,
                id_turno=id_turno,
                id_cliente=id_cliente,
                id_torneo=id_torneo,
                id_servicio=id_servicio,
                estado="pendiente",
                origen=origen
            )

            # Calcular el costo total de la reserva
            reserva.calcular_costo_reserva(cancha, servicio_adicional)

            # guardar la reserva
            self.reserva_repo.agregar(reserva)

            self.turno_repo.marcar_como_reservado(id_turno)

            self.reserva_repo.commit()

            return reserva
        except Exception as e:
            self.reserva_repo.rollback()
            raise e
        finally:
            self.reserva_repo.cerrar()


