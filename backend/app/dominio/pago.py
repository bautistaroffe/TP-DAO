from backend.app.repositorios.pago_repo import PagoRepository


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
        """Simula procesamiento de pago."""
        if self.monto <= 0:
            self.estado_transaccion = "rechazado"
        else:
            self.estado_transaccion = "aprobado"
        return self.estado_transaccion

    # ===========================================
    # MÉTODOS ABM (Altas, Bajas, Modificaciones, Consultas)
    # ===========================================

    def guardar(self):
        """
        Guarda o actualiza el registro en la base de datos.
        Si no tiene ID, se inserta; si ya tiene ID, se actualiza.
        """
        repo = PagoRepository()
        if getattr(self, 'id_' + self.__class__.__name__.lower()):
            repo.actualizar(self)
        else:
            repo.agregar(self)
        repo.cerrar()
        return self

    def eliminar(self):
        """
        Elimina el registro actual de la base de datos.
        """
        repo = PagoRepository()
        id_attr = 'id_' + self.__class__.__name__.lower()
        id_valor = getattr(self, id_attr, None)
        if not id_valor:
            raise ValueError(f"{self.__class__.__name__} no existe en la base de datos.")
        repo.eliminar(id_valor)
        repo.cerrar()

    @staticmethod
    def listar_todos():
        """
        Devuelve una lista de todos los registros de esta entidad.
        """
        repo = PagoRepository()
        objetos = repo.listar_todos()
        repo.cerrar()
        return objetos

    @staticmethod
    def obtener_por_id(id_valor):
        """
        Devuelve un registro según su ID, o None si no existe.
        """
        repo = PagoRepository()
        objeto = repo.obtener_por_id(id_valor)
        repo.cerrar()
        return objeto


    def enviarComprobante(self):
        """Simula envío de comprobante."""
        return f"Comprobante enviado al usuario {self.id_usuario} por ${self.monto}"

    def __repr__(self):
        return f"<Pago {self.id_pago}: reserva={self.id_reserva}, monto=${self.monto}, estado={self.estado_transaccion}>"
