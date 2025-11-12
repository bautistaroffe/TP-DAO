from datetime import datetime
from backend.app.dominio.pago import Pago
from backend.app.dto.pago_dto import PagoDTO
from backend.app.repositorios.pago_repo import PagoRepository
from backend.app.repositorios.reserva_repo import ReservaRepository



class PagoService:
    # ============================
    # VALIDACIONES
    # ============================
    def _validar_campos(self, id_usuario, id_reserva, monto, metodo):
        if not id_usuario or id_usuario <= 0:
            raise ValueError("El ID de usuario es obligatorio y debe ser válido.")
        if not id_reserva or id_reserva <= 0:
            raise ValueError("El ID de reserva es obligatorio y debe ser válido.")
        if monto is None or monto <= 0:
            raise ValueError("El monto del pago debe ser positivo.")
        if not metodo or not metodo.strip():
            raise ValueError("Debe especificarse un método de pago (ej. tarjeta, efectivo, transferencia).")

    # ============================
    # PROCESAR PAGO
    # ============================
    def procesar_pago(self, id_usuario, id_reserva, monto, metodo):
        self._validar_campos(id_usuario, id_reserva, monto, metodo)

        repo_pago = PagoRepository()
        repo_reserva = ReservaRepository()

        try:
            reserva = repo_reserva.obtener_por_id(id_reserva)
            if not reserva:
                raise ValueError("Reserva no encontrada.")
            if reserva.estado in ("cancelada", "expirada"):
                raise ValueError("No se puede procesar un pago para una reserva cancelada o expirada.")

            pago_existente = repo_pago.obtener_por_reserva(id_reserva)
            if pago_existente:
                raise ValueError("Ya existe un pago asociado a esta reserva.")

            pago = Pago(
                id_usuario=id_usuario,
                id_reserva=id_reserva,
                monto=monto,
                fecha_pago=datetime.now(),
                metodo=metodo.strip(),
                estado_transaccion="pendiente"
            )

            estado = pago.procesarPago()

            repo_pago.agregar(pago)

            if estado == "aprobado":
                reserva.estado = "pagada"
                repo_reserva.actualizar(reserva)

            repo_pago.commit()
            repo_reserva.commit()

            return {
                "mensaje": f"Pago procesado correctamente ({estado}).",
                "pago": pago.__dict__,
                "reserva": reserva.__dict__
            }

        except Exception as e:
            repo_pago.rollback()
            repo_reserva.rollback()
            raise e
        finally:
            repo_pago.cerrar()
            repo_reserva.cerrar()

    # ============================
    # LISTAR / OBTENER
    # ============================
    def listar_pagos(self) -> list[PagoDTO]:
        repo = PagoRepository()
        try:
            pagos: list[Pago] = repo.listar_todos()
            pagos_dto: list[PagoDTO] = [
                self._mapear_a_dto(pago)
                for pago in pagos if pago
            ]
            return pagos_dto
        finally:
            repo.cerrar()

    def obtener_pago_por_id(self, id_pago):
        repo = PagoRepository()
        try:
            pago = repo.obtener_por_id(id_pago)
            if not pago:
                raise ValueError("Pago no encontrado.")
            return pago
        finally:
            repo.cerrar()

    def obtener_pago_por_reserva(self, id_reserva):
        repo = PagoRepository()
        try:
            pago = repo.obtener_por_reserva(id_reserva)
            if not pago:
                raise ValueError("No se encontró pago asociado a la reserva.")
            return pago
        finally:
            repo.cerrar()
    # ============================
    # ELIMINAR
    # ============================
    def eliminar_pago(self, id_pago):
        """
        Elimina un pago solo si no está confirmado o aprobado.
        """
        repo = PagoRepository()
        try:
            pago = repo.obtener_por_id(id_pago)
            if not pago:
                raise ValueError("Pago no encontrado.")

            if pago.estado_transaccion in ("completado", "aprobado"):
                raise ValueError("No se puede eliminar un pago completado o aprobado.")

            repo.eliminar(id_pago)
            repo.commit()
            return {"mensaje": f"Pago {id_pago} eliminado correctamente."}
        except Exception:
            repo.rollback()
            raise
        finally:
            repo.cerrar()

    def _mapear_a_dto(self, pago: Pago) -> PagoDTO:
        data = {
            "id_pago": pago.id_pago,
            "id_usuario": pago.id_usuario,
            "id_reserva": pago.id_reserva,
            "monto": pago.monto,
            "fecha_pago": pago.fecha_pago,
            "metodo": pago.metodo,
            "estado_transaccion": pago.estado_transaccion
        }
        return PagoDTO(**data)

