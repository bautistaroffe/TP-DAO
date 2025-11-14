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

        reserva = repo_reserva.obtener_por_id(id_reserva)
        if not reserva:
            raise ValueError("Reserva no encontrada.")
        if reserva.estado in ("cancelada", "expirada", "pagada", "confirmada"):
            raise ValueError(f"No se puede procesar un pago para una reserva en estado '{reserva.estado}'.")

        if repo_pago.obtener_por_reserva(id_reserva):
            raise ValueError("Ya existe un pago asociado a esta reserva.")

        # ---------------------------------------
        # NUEVA LÓGICA SEGÚN EL MÉTODO DE PAGO
        # ---------------------------------------
        metodo = metodo.strip().lower()
        if metodo == "efectivo":
            estado_pago = "pendiente"
            estado_reserva = "pendiente"

        elif metodo == "mercado_pago":
            estado_pago = "aprobado"
            estado_reserva = "confirmada"

        else:
            raise ValueError("El método de pago debe ser 'efectivo' o 'mercado_pago'.")

        # Crear el pago con el estado ya decidido
        pago = Pago(
            id_usuario=id_usuario,
            id_reserva=id_reserva,
            monto=monto,
            fecha_pago=datetime.now(),
            metodo=metodo,
            estado_transaccion=estado_pago
        )

        # ---------------------------------------
        # TRANSACCIÓN ÚNICA (EVITA LOCKS)
        # ---------------------------------------
        repo_reserva.iniciar_transaccion()
        try:
            # Forzar repo_pago a usar la misma conexión
            repo_pago._conn = repo_reserva._conn
            repo_pago._cursor = repo_reserva._cursor

            # Guardar el pago
            repo_pago.agregar(pago)

            # Actualizar reserva
            reserva.estado = estado_reserva
            repo_reserva.actualizar(reserva)

            # Confirmar todo
            repo_reserva.confirmar_transaccion()

            return {
                "mensaje": f"Pago registrado correctamente ({estado_pago}).",
                "pago": self._mapear_a_dto(pago),
                "reserva": reserva.__dict__
            }

        except Exception as e:
            repo_reserva.revertir_transaccion()
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