from backend.app.dominio.reserva import Reserva
from backend.app.repositorios.reserva_repo import ReservaRepository
from backend.app.repositorios.cancha_repo import CanchaRepository
from backend.app.repositorios.adicional_repo import ServicioAdicionalRepository
from backend.app.repositorios.turno_repo import TurnoRepository
from backend.app.repositorios.pago_repo import PagoRepository


class ReservaService:
    def __init__(self):
        self.reserva_repo = ReservaRepository()
        self.cancha_repo = CanchaRepository()
        self.turno_repo = TurnoRepository()
        self.servicio_repo = ServicioAdicionalRepository()
        self.pago_repo = PagoRepository()

    # ============================
    # VALIDACIONES
    # ============================
    def _validar_campos(self, id_cancha, id_turno, id_cliente):
        if not id_cancha or id_cancha <= 0:
            raise ValueError("El ID de la cancha es obligatorio y debe ser válido.")
        if not id_turno or id_turno <= 0:
            raise ValueError("El ID del turno es obligatorio y debe ser válido.")
        if not id_cliente or id_cliente <= 0:
            raise ValueError("El ID del cliente es obligatorio y debe ser válido.")

    def _turno_disponible(self, id_cancha, id_turno):
        filas = self.reserva_repo.obtener_todos("""
            SELECT * FROM Reserva
            WHERE id_cancha=? AND id_turno=? AND estado IN ('pendiente', 'confirmada')
        """, (id_cancha, id_turno))
        return len(filas) == 0

    # ============================
    # CREAR RESERVA
    # ============================
    def crear_reserva(self, id_cancha, id_turno, id_cliente,
                      id_torneo=None, id_servicio=None, origen="particular"):
        self._validar_campos(id_cancha, id_turno, id_cliente)

        try:
            # Verificar disponibilidad del turno
            if not self._turno_disponible(id_cancha, id_turno):
                raise ValueError("El turno seleccionado no está disponible.")

            cancha = self.cancha_repo.obtener_por_id(id_cancha)
            if not cancha:
                raise ValueError("Cancha no encontrada.")

            servicio_adicional = None
            if id_servicio:
                servicio_adicional = self.servicio_repo.obtener_por_id(id_servicio)
                if not servicio_adicional:
                    raise ValueError("Servicio adicional no encontrado.")

            reserva = Reserva(
                id_cancha=id_cancha,
                id_turno=id_turno,
                id_cliente=id_cliente,
                id_torneo=id_torneo,
                id_servicio=id_servicio,
                estado="pendiente",
                origen=origen
            )

            # Calcular costo total
            reserva.calcular_costo_reserva(cancha, servicio_adicional)

            # Guardar reserva
            self.reserva_repo.agregar(reserva)
            self.turno_repo.marcar_como_reservado(id_turno)
            self.reserva_repo.commit()

            return {
                "mensaje": "Reserva creada correctamente.",
                "reserva": reserva.__dict__
            }

        except Exception as e:
            self.reserva_repo.rollback()
            raise e
        finally:
            self.reserva_repo.cerrar()
            self.cancha_repo.cerrar()
            self.servicio_repo.cerrar()
            self.turno_repo.cerrar()

    # ============================
    # CANCELAR RESERVA
    # ============================
    def cancelar_reserva(self, id_reserva):
        try:
            reserva = self.reserva_repo.obtener_por_id(id_reserva)
            if not reserva:
                raise ValueError("Reserva no encontrada.")

            if reserva.estado not in ("pendiente", "confirmada"):
                raise ValueError("Solo se pueden cancelar reservas pendientes o confirmadas.")

            # No permitir cancelar si ya está pagada
            pago = self.pago_repo.obtener_por_reserva(id_reserva)
            if pago:
                raise ValueError("No se puede cancelar una reserva que ya fue pagada.")

            # Cancelar reserva y liberar turno
            reserva.estado = "cancelada"
            self.reserva_repo.actualizar(reserva)
            self.turno_repo.marcar_como_disponible(reserva.id_turno)
            self.reserva_repo.commit()

            return {"mensaje": f"Reserva {id_reserva} cancelada correctamente."}

        except Exception as e:
            self.reserva_repo.rollback()
            raise e
        finally:
            self.reserva_repo.cerrar()
            self.turno_repo.cerrar()
            self.pago_repo.cerrar()

    # ============================
    # MODIFICAR RESERVA
    # ============================
    def modificar_reserva(self, id_reserva, nuevo_id_turno=None,
                          nuevo_id_servicio=None, nuevo_id_cliente=None):
        try:
            reserva = self.reserva_repo.obtener_por_id(id_reserva)
            if not reserva:
                raise ValueError("Reserva no encontrada.")
            if reserva.estado != "pendiente":
                raise ValueError("Solo se pueden modificar reservas pendientes.")

            # 1. Cambiar turno
            if nuevo_id_turno and nuevo_id_turno != reserva.id_turno:
                if not self._turno_disponible(reserva.id_cancha, nuevo_id_turno):
                    raise ValueError("El nuevo turno no está disponible.")
                self.turno_repo.marcar_como_disponible(reserva.id_turno)
                self.turno_repo.marcar_como_reservado(nuevo_id_turno)
                reserva.id_turno = nuevo_id_turno

            # 2. Cambiar servicio adicional
            if nuevo_id_servicio is not None:
                servicio = self.servicio_repo.obtener_por_id(nuevo_id_servicio)
                if not servicio:
                    raise ValueError("Servicio adicional no encontrado.")
                reserva.id_servicio = nuevo_id_servicio

            # 3. Cambiar cliente
            if nuevo_id_cliente is not None:
                pago = self.pago_repo.obtener_por_reserva(reserva.id_reserva)
                if pago:
                    raise ValueError("No se puede cambiar el cliente de una reserva ya pagada.")

                reserva.id_cliente = nuevo_id_cliente

            # 4. Recalcular precio
            cancha = self.cancha_repo.obtener_por_id(reserva.id_cancha)
            servicio = self.servicio_repo.obtener_por_id(reserva.id_servicio) if reserva.id_servicio else None
            reserva.calcular_costo_reserva(cancha, servicio)

            # 5. Guardar cambios
            self.reserva_repo.actualizar(reserva)
            self.reserva_repo.commit()

            return {
                "mensaje": f"Reserva {id_reserva} modificada correctamente.",
                "reserva": reserva.__dict__
            }

        except Exception as e:
            self.reserva_repo.rollback()
            raise e
        finally:
            self.reserva_repo.cerrar()
            self.turno_repo.cerrar()
            self.cancha_repo.cerrar()
            self.servicio_repo.cerrar()
