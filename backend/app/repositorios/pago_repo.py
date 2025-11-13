from backend.app.dominio.pago import Pago
from backend.app.repositorios.base_repo import BaseRepository

class PagoRepository(BaseRepository):
    """CRUD para la tabla Pago."""

    def agregar(self, pago: Pago):
        pago.id_pago = self.ejecutar("""
            INSERT INTO Pago (id_usuario, id_reserva, monto, fecha_pago, metodo, estado_transaccion)
            VALUES (?, ?, ?, ?, ?, ?)
        """, (pago.id_usuario, pago.id_reserva, pago.monto, pago.fecha_pago,
              pago.metodo, pago.estado_transaccion))

        return pago

    def listar_todos(self):
        filas = self.obtener_todos("SELECT * FROM Pago")
        return [Pago(**f) for f in filas]

    def obtener_por_id(self, id_pago):
        fila = super().obtener_por_id("Pago", "id_pago", id_pago)
        return Pago(**fila) if fila else None

    def obtener_por_reserva(self, id_reserva):
        fila = self.obtener_uno("SELECT * FROM Pago WHERE id_reserva=?", (id_reserva,))
        return Pago(**fila) if fila else None

    def actualizar(self, pago: Pago):
        self.ejecutar("""
            UPDATE Pago
            SET id_usuario=?, id_reserva=?, monto=?, fecha_pago=?, metodo=?, estado_transaccion=?
            WHERE id_pago=?
        """, (pago.id_usuario, pago.id_reserva, pago.monto, pago.fecha_pago,
              pago.metodo, pago.estado_transaccion, pago.id_pago))

    def eliminar(self, id_pago):
        self.ejecutar("DELETE FROM Pago WHERE id_pago=?", (id_pago,))
