from datetime import datetime
from backend.app.dominio.pago import Pago
from backend.app.repositorios.pago_repo import PagoRepository
from backend.app.repositorios.reserva_repo import ReservaRepository

class PagoService:
    def __init__(self):
        self.pago_repo = PagoRepository()
        self.reserva_repo = ReservaRepository()

    def procesar_pago(self, id_usuario, id_reserva, monto, metodo):
        try:
            reserva = self.reserva_repo.obtener_por_id(id_reserva)
            if not reserva:
                raise ValueError("Reserva no encontrada.")

            pago = Pago(
                id_usuario=id_usuario,
                id_reserva=id_reserva,
                monto=monto,
                fecha_pago=datetime.now(),
                metodo=metodo,
                estado_transaccion="pendiente"
            )
            estado = pago.procesarPago()

            self.pago_repo.agregar(pago)

            if estado == "aprobado":
                reserva.estado = "pagada"
                self.reserva_repo.actualizar(reserva)

            self.pago_repo.commit()
            self.reserva_repo.commit()

            return pago

        except Exception as e:
            self.pago_repo.rollback()
            self.reserva_repo.rollback()
            raise e

        finally:
            self.pago_repo.cerrar()
            self.reserva_repo.cerrar()