from backend.app.dominio.cancha import Cancha
from backend.app.repositorios.base_repo import BaseRepository

class CanchaRepository(BaseRepository):
    """CRUD para la tabla Cancha."""

    def agregar(self, cancha: Cancha):
        self.ejecutar("""
            INSERT INTO Cancha (tipo, nombre, superficie, tamaño, techada, iluminacion, estado, precio_base)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        """, (cancha.tipo, cancha.nombre, cancha.superficie, cancha.tamaño,
              cancha.techada, cancha.iluminacion, cancha.estado, cancha.precio_base))
        cancha.id_cancha = self.cursor.lastrowid
        return cancha

    def listar_todas(self):
        filas = self.obtener_todos("SELECT * FROM Cancha")
        return [Cancha(**f) for f in filas]

    def obtener_por_id(self, id_cancha):
        fila = super().obtener_por_id("Cancha", "id_cancha", id_cancha)
        return Cancha(**fila) if fila else None

    def actualizar(self, cancha: Cancha):
        self.ejecutar("""
            UPDATE Cancha
            SET tipo=?, nombre=?, superficie=?, tamaño=?, techada=?, iluminacion=?, estado=?, precio_base=?
            WHERE id_cancha=?
        """, (cancha.tipo, cancha.nombre, cancha.superficie, cancha.tamaño,
              cancha.techada, cancha.iluminacion, cancha.estado, cancha.precio_base, cancha.id_cancha))

    def eliminar(self, id_cancha):
        self.ejecutar("DELETE FROM Cancha WHERE id_cancha=?", (id_cancha,))

    def obtener_mas_reservadas(self, top_n=5):
        def obtener_mas_reservadas(self, top_n=5):
            query = """
                SELECT c.id_cancha, c.nombre, COUNT(r.id_reserva) AS total_reservas
                FROM Cancha c
                LEFT JOIN Reserva r ON c.id_cancha = r.id_cancha
                GROUP BY c.id_cancha
                ORDER BY total_reservas DESC
                LIMIT ?
            """
            return self.obtener_todos(query, (top_n,))
