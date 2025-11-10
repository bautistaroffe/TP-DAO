from backend.app.dominio.reserva import Reserva
from backend.app.repositorios.reserva_repo import ReservaRepository
from backend.app.repositorios.cancha_repo import CanchaRepository
from backend.app.repositorios.adicional_repo import ServicioAdicionalRepository
from backend.app.repositorios.turno_repo import TurnoRepository

class ReservaService:
    def __init__(self):
        self.reserva_repo = ReservaRepository()
        self.cancha_repo = CanchaRepository()
        self.turno_repo = TurnoRepository()
        self.servicio_repo = ServicioAdicionalRepository()

    def crear_reserva(self, id_cancha, id_turno, id_cliente, id_torneo=None, id_servicio=None, origen="particular"):
        try:
            if not self._turno_disponible(id_cancha, id_turno):
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

    def cancelar_reserva(self, id_reserva):
        reserva = self.reserva_repo.obtener_por_id(id_reserva)
        if not reserva:
            raise ValueError("Reserva no encontrada.")
        if reserva.estado not in ("pendiente", "confirmada"):
            raise ValueError("Solo se pueden cancelar reservas pendientes o confirmadas.")

        try:
            # 1. Cambiar estado de la reserva
            reserva.estado = "cancelada"
            self.reserva_repo.actualizar(reserva)

            # 2. Liberar el turno (volverlo a disponible)
            self.turno_repo.marcar_como_disponible(reserva.id_turno)

            # 3. Confirmar transacción
            self.reserva_repo.commit()

        except Exception as e:
            self.reserva_repo.rollback()
            raise e

    def modificar_reserva(self, id_reserva, nuevo_id_turno=None, nuevo_id_servicio=None, nuevo_id_cliente=None):
        """
        Permite cambiar el turno, el servicio adicional o el cliente de una reserva existente.
        """
        reserva = self.reserva_repo.obtener_por_id(id_reserva)
        if not reserva:
            raise ValueError("La reserva no existe.")
        if reserva.estado != "pendiente":
            raise ValueError("Solo se pueden modificar reservas pendientes.")

        try:
            # 1. Si cambia el turno, liberar el anterior y reservar el nuevo
            if nuevo_id_turno and nuevo_id_turno != reserva.id_turno:
                if not self._turno_disponible(reserva.id_cancha, nuevo_id_turno):
                    raise ValueError("El nuevo turno no está disponible.")
                self.turno_repo.marcar_como_disponible(reserva.id_turno)
                self.turno_repo.marcar_como_reservado(nuevo_id_turno)
                reserva.id_turno = nuevo_id_turno

            # 2. Si cambia el servicio adicional
            if nuevo_id_servicio is not None:
                reserva.id_servicio = nuevo_id_servicio

            # 3. Si cambia el cliente
            if nuevo_id_cliente is not None:
                reserva.id_cliente = nuevo_id_cliente

            # 4. Recalcular el precio total
            cancha = self.cancha_repo.obtener_por_id(reserva.id_cancha)
            servicio = self.servicio_repo.obtener_por_id(reserva.id_servicio) if reserva.id_servicio else None
            reserva.calcular_costo_reserva(cancha, servicio)

            # 5. Guardar cambios
            self.reserva_repo.actualizar(reserva)
            self.reserva_repo.commit()

            return reserva

        except Exception as e:
            self.reserva_repo.rollback()
            raise e

    def _turno_disponible(self, id_cancha, id_turno):
        reservas = self.reserva_repo.obtener_todos("""
            SELECT * FROM Reserva WHERE id_cancha=? AND id_turno=? AND estado IN ('pendiente', 'confirmada')
        """, (id_cancha, id_turno))
        return len(reservas) == 0

