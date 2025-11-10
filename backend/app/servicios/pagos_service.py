from datetime import datetime
from backend.app.dominio.pago import Pago
from backend.app.repositorios.pago_repo import PagoRepository
from backend.app.repositorios.reserva_repo import ReservaRepository


class PagoService:
    def __init__(self):
        self.pago_repo = PagoRepository()
        self.reserva_repo = ReservaRepository()

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
        """
        Crea y procesa un pago, asociándolo a una reserva.
        Si el pago es aprobado, cambia el estado de la reserva a 'pagada'.
        Si ya existe un pago asociado a la reserva, lo bloquea.
        """
        self._validar_campos(id_usuario, id_reserva, monto, metodo)

        try:
            # Verificar reserva
            reserva = self.reserva_repo.obtener_por_id(id_reserva)
            if not reserva:
                raise ValueError("Reserva no encontrada.")
            if reserva.estado in ("cancelada", "expirada"):
                raise ValueError("No se puede procesar un pago para una reserva cancelada o expirada.")

            # Evitar pagos duplicados
            pago_existente = self.pago_repo.obtener_por_reserva(id_reserva)
            if pago_existente:
                raise ValueError("Ya existe un pago asociado a esta reserva.")

            # Crear pago
            pago = Pago(
                id_usuario=id_usuario,
                id_reserva=id_reserva,
                monto=monto,
                fecha_pago=datetime.now(),
                metodo=metodo.strip(),
                estado_transaccion="pendiente"
            )

            # Procesamiento del pago (simulado o real según Pago.procesarPago)
            estado = pago.procesarPago()

            # Guardar en la base
            self.pago_repo.agregar(pago)

            if estado == "aprobado":
                reserva.estado = "pagada"
                self.reserva_repo.actualizar(reserva)

            # Commit transaccional
            self.pago_repo.commit()
            self.reserva_repo.commit()

            return {
                "mensaje": f"Pago procesado correctamente ({estado}).",
                "pago": pago.__dict__,
                "reserva": reserva.__dict__
            }

        except Exception as e:
            self.pago_repo.rollback()
            self.reserva_repo.rollback()
            raise e
        finally:
            self.pago_repo.cerrar()
            self.reserva_repo.cerrar()

    # ============================
    # LISTAR PAGOS
    # ============================
    def listar_pagos(self):
        try:
            return self.pago_repo.listar_todos()
        finally:
            self.pago_repo.cerrar()

    # ============================
    # OBTENER PAGO POR ID
    # ============================
    def obtener_pago_por_id(self, id_pago):
        try:
            pago = self.pago_repo.obtener_por_id(id_pago)
            if not pago:
                raise ValueError("Pago no encontrado.")
            return pago
        finally:
            self.pago_repo.cerrar()

    # ============================
    # OBTENER PAGO POR RESERVA
    # ============================
    def obtener_pago_por_reserva(self, id_reserva):
        try:
            pago = self.pago_repo.obtener_por_reserva(id_reserva)
            if not pago:
                raise ValueError("No se encontró pago asociado a la reserva.")
            return pago
        finally:
            self.pago_repo.cerrar()
