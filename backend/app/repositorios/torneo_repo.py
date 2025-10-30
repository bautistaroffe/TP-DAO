from backend.app.dominio.torneo import Torneo
from backend.app.repositorios.base_repo import BaseRepository

class TorneoRepository(BaseRepository):
    """CRUD para la tabla Torneo."""

    def agregar(self, torneo: Torneo):
        self.ejecutar("""
            INSERT INTO Torneo (nombre, categoria, fecha_inicio, fecha_fin, estado)
            VALUES (?, ?, ?, ?, ?)
        """, (torneo.nombre, torneo.categoria, torneo.fecha_inicio, torneo.fecha_fin, torneo.estado))
        torneo.id_torneo = self.cursor.lastrowid
        return torneo

    def listar_todos(self):
        filas = self.obtener_todos("SELECT * FROM Torneo")
        return [Torneo(**f) for f in filas]

    def obtener_por_id(self, id_torneo):
        fila = super().obtener_por_id("Torneo", "id_torneo", id_torneo)
        return Torneo(**fila) if fila else None

    def actualizar(self, torneo: Torneo):
        self.ejecutar("""
            UPDATE Torneo
            SET nombre=?, categoria=?, fecha_inicio=?, fecha_fin=?, estado=?
            WHERE id_torneo=?
        """, (torneo.nombre, torneo.categoria, torneo.fecha_inicio, torneo.fecha_fin, torneo.estado, torneo.id_torneo))

    def eliminar(self, id_torneo):
        self.ejecutar("DELETE FROM Torneo WHERE id_torneo=?", (id_torneo,))
