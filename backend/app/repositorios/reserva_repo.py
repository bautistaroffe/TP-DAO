from backend.app.dominio.reserva import Reserva
from backend.app.repositorios.base_repo import BaseRepository

class ReservaRepository(BaseRepository):
    """CRUD para la tabla Reserva."""

    def agregar(self, reserva: Reserva):
        reserva.id_reserva = self.ejecutar("""
            INSERT INTO Reserva (id_cancha, id_turno, id_cliente, id_torneo, id_servicio,
                                 precio_total, estado, origen)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        """, (reserva.id_cancha, reserva.id_turno, reserva.id_cliente, reserva.id_torneo,
              reserva.id_servicio, reserva.precio_total, reserva.estado, reserva.origen))

        return reserva

    def listar_todas(self):
        filas = self.obtener_todos("SELECT * FROM Reserva")
        return [Reserva(**f) for f in filas]

    def obtener_por_id(self, id_reserva):
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

    def obtener_por_cliente(self, id_cliente, fecha_inicio=None, fecha_fin=None):
        """
        Devuelve las reservas de un cliente, opcionalmente filtradas por un rango de fechas.
        fecha_inicio y fecha_fin deben ser strings en formato 'YYYY-MM-DD' o None.
        """
        query = "SELECT r.* FROM Reserva r JOIN Turno t ON r.id_turno = t.id_turno WHERE r.id_cliente = ?"
        params = [id_cliente]

        if fecha_inicio and fecha_fin:
            query += " AND t.fecha BETWEEN ? AND ?"
            params.extend([fecha_inicio, fecha_fin])
        elif fecha_inicio:
            query += " AND t.fecha >= ?"
            params.append(fecha_inicio)
        elif fecha_fin:
            query += " AND t.fecha <= ?"
            params.append(fecha_fin)

        filas = self.obtener_todos(query, tuple(params))
        return [Reserva(**f) for f in filas]

    def obtener_reservas_por_cancha_y_periodo(self, id_cancha, fecha_inicio, fecha_fin):
        query = """
            SELECT r.* FROM Reserva r
            JOIN Turno t ON r.id_turno = t.id_turno
            WHERE r.id_cancha = ? AND t.fecha BETWEEN ? AND ?
        """
        filas = self.obtener_todos(query, (id_cancha, fecha_inicio, fecha_fin))
        return [Reserva(**f) for f in filas]

    def obtener_utilizacion_mensual(self, año, mes=None):
        if mes:
            query = """
                    SELECT c.nombre AS cancha, COUNT(r.id_reserva) AS total_reservas
                    FROM Reserva r
                             JOIN Cancha c ON r.id_cancha = c.id_cancha
                             JOIN Turno t ON r.id_turno = t.id_turno
                    WHERE strftime('%Y', t.fecha) = ? \
                      AND strftime('%m', t.fecha) = ?
                    GROUP BY c.nombre
                    ORDER BY total_reservas DESC; \
                    """
            return self.obtener_todos(query, (str(año), f"{mes:02d}"))

        # Agrupado por mes si no se pasa parámetro
        query = """
                SELECT c.nombre AS cancha, strftime('%m', t.fecha) AS mes, COUNT(r.id_reserva) AS total_reservas
                FROM Reserva r
                         JOIN Cancha c ON r.id_cancha = c.id_cancha
                         JOIN Turno t ON r.id_turno = t.id_turno
                WHERE strftime('%Y', t.fecha) = ?
                GROUP BY c.nombre, mes
                ORDER BY c.nombre, mes; \
                """
        return self.obtener_todos(query, (str(año),))
