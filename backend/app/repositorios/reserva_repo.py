from backend.app.dominio.reserva import Reserva
from backend.app.repositorios.base_repo import BaseRepository

class ReservaRepository(BaseRepository):
    """CRUD para la tabla Reserva."""

    def agregar(self, reserva: Reserva):
        self.ejecutar("""
            INSERT INTO Reserva (id_cancha, id_turno, id_cliente, id_torneo, id_servicio,
                                 precio_total, estado, origen)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        """, (reserva.id_cancha, reserva.id_turno, reserva.id_cliente, reserva.id_torneo,
              reserva.id_servicio, reserva.precio_total, reserva.estado, reserva.origen))
        reserva.id_reserva = self.cursor.lastrowid
        return reserva

    def listar_todas(self):
        filas = self.obtener_todos("SELECT * FROM Reserva")
        return [Reserva(**f) for f in filas]

    def obtener_por_id(self, tabla, id_columna, id_reserva):
        fila = super().obtener_por_id("Reserva", "id_reserva", id_reserva)
        return Reserva(**fila) if fila else None

    def listar_por_usuario(self, id_usuario):
        filas = self.obtener_todos("SELECT * FROM Reserva WHERE id_cliente=?", (id_usuario,))
        return [Reserva(**f) for f in filas]

    def actualizar(self, reserva: Reserva):
        self.ejecutar("""
            UPDATE Reserva
            SET id_cancha=?, id_turno=?, id_cliente=?, id_torneo=?, id_servicio=?,
                precio_total=?, estado=?, origen=?
            WHERE id_reserva=?
        """, (reserva.id_cancha, reserva.id_turno, reserva.id_cliente, reserva.id_torneo,
              reserva.id_servicio, reserva.precio_total, reserva.estado, reserva.origen, reserva.id_reserva))

    def eliminar(self, id_reserva):
        self.ejecutar("DELETE FROM Reserva WHERE id_reserva=?", (id_reserva,))

    def obtener_por_cliente(self, id_cliente):
        filas = self.obtener_todos("SELECT * FROM Reserva WHERE id_cliente=?", (id_cliente,))
        return [Reserva(**f) for f in filas]

    def obtener_reservas_por_cancha_y_periodo(self, id_cancha, fecha_inicio, fecha_fin):
        query = """
            SELECT r.* FROM Reserva r
            JOIN Turno t ON r.id_turno = t.id_turno
            WHERE r.id_cancha = ? AND t.fecha BETWEEN ? AND ?
        """
        filas = self.obtener_todos(query, (id_cancha, fecha_inicio, fecha_fin))
        return [Reserva(**f) for f in filas]
