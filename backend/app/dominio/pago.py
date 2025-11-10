

class Pago:
    def __init__(
        self,
        id_pago=None,
        id_usuario=None,
        id_reserva=None,
        monto=0.0,
        fecha_pago=None,
        metodo=None,
        estado_transaccion="pendiente"
    ):
        self.id_pago = id_pago
        self.id_usuario = id_usuario
        self.id_reserva = id_reserva
        self.monto = monto
        self.fecha_pago = fecha_pago
        self.metodo = metodo
        self.estado_transaccion = estado_transaccion

    def procesarPago(self):
        from backend.app.repositorios.pago_repo import PagoRepository

        """Simula procesamiento de pago."""
        if self.monto <= 0:
            self.estado_transaccion = "rechazado"
        else:
            self.estado_transaccion = "aprobado"
        return self.estado_transaccion



    def __repr__(self):
        return f"<Pago {self.id_pago}: reserva={self.id_reserva}, monto=${self.monto}, estado={self.estado_transaccion}>"
