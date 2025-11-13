from datetime import datetime
from backend.app.dominio.pago import Pago
from backend.app.dto.pago_dto import PagoDTO
from backend.app.repositorios.pago_repo import PagoRepository
from backend.app.repositorios.reserva_repo import ReservaRepository


class PagoService:
    # ============================
    # MAPEO Y VALIDACIONES
    # ============================
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
    # PROCESAR PAGO (Transacción)
    # ============================
    def procesar_pago(self, id_usuario, id_reserva, monto, metodo):
        self._validar_campos(id_usuario, id_reserva, monto, metodo)

        repo_pago = PagoRepository()
        repo_reserva = ReservaRepository()

        # 1. Validaciones previas (Lecturas atómicas)
        reserva = repo_reserva.obtener_por_id(id_reserva)
        if not reserva:
            raise ValueError("Reserva no encontrada.")
        if reserva.estado in ("cancelada", "expirada", "pagada"):
            raise ValueError(f"No se puede procesar un pago para una reserva en estado '{reserva.estado}'.")

        pago_existente = repo_pago.obtener_por_reserva(id_reserva)
        if pago_existente:
            raise ValueError("Ya existe un pago asociado a esta reserva.")

        # 2. Creación y simulación de pago
        pago = Pago(
            id_usuario=id_usuario,
            id_reserva=id_reserva,
            monto=monto,
            fecha_pago=datetime.now(),
            metodo=metodo.strip(),
            estado_transaccion="pendiente"
        )
        estado = pago.procesarPago() # Simula el intento de pago (ej: "aprobado", "rechazado")
        pago.estado_transaccion = estado # Actualiza el estado del objeto Pago

        # 3. Iniciar transacción
        repo_pago.iniciar_transaccion()
        try:
            # Escrituras dentro de la transacción
            repo_pago.agregar(pago)

            if estado == "aprobado":
                reserva.estado = "pagada"
                repo_reserva.actualizar(reserva)

            # 4. Confirmar
            repo_pago.confirmar_transaccion()

            return {
                "mensaje": f"Pago procesado correctamente ({estado}).",
                "pago": self._mapear_a_dto(pago),
                "reserva": reserva.__dict__ # Devolvemos el dict de reserva para mostrar su estado actualizado
            }

        except Exception as e:
            # 5. Revertir
            repo_pago.revertir_transaccion()
            raise e

    # ============================
    # LISTAR / OBTENER (Atómicas)
    # ============================
    def listar_pagos(self) -> list[PagoDTO]:
        repo = PagoRepository()
        pagos: list[Pago] = repo.listar_todos()
        pagos_dto: list[PagoDTO] = [
            self._mapear_a_dto(pago)
            for pago in pagos if pago
        ]
        return pagos_dto

    def obtener_pago_por_id(self, id_pago) -> PagoDTO:
        repo = PagoRepository()
        pago = repo.obtener_por_id(id_pago)
        if not pago:
            raise ValueError("Pago no encontrado.")
        return self._mapear_a_dto(pago)

    def obtener_pago_por_reserva(self, id_reserva) -> PagoDTO:
        repo = PagoRepository()
        pago = repo.obtener_por_reserva(id_reserva)
        if not pago:
            raise ValueError("No se encontró pago asociado a la reserva.")
        return self._mapear_a_dto(pago)

    # ============================
    # ELIMINAR (Atómica)
    # ============================
    def eliminar_pago(self, id_pago):
        """
        Elimina un pago solo si no está confirmado o aprobado.
        Es atómico porque solo afecta a la tabla Pago.
        """
        repo = PagoRepository()
        pago = repo.obtener_por_id(id_pago)
        if not pago:
            raise ValueError("Pago no encontrado.")

        if pago.estado_transaccion in ("completado", "aprobado"):
            raise ValueError("No se puede eliminar un pago completado o aprobado.")

        repo.eliminar(id_pago)
        return {"mensaje": f"Pago {id_pago} eliminado correctamente."}