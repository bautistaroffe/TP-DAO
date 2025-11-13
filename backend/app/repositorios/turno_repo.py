from backend.app.dominio.turno import Turno
from backend.app.repositorios.base_repo import BaseRepository

class TurnoRepository(BaseRepository):
    """CRUD para la tabla Turno."""

    def agregar(self, turno: Turno):
        self.ejecutar("""
            INSERT INTO Turno (id_cancha, fecha, hora_inicio, hora_fin, estado)
            VALUES (?, ?, ?, ?, ?)
        """, (turno.id_cancha, str(turno.fecha), str(turno.hora_inicio), str(turno.hora_fin), turno.estado))
        turno.id_turno = self.cursor.lastrowid
        return turno

    def listar_todos(self):
        filas = self.obtener_todos("SELECT * FROM Turno")
        return [Turno(**f) for f in filas]

    def obtener_por_id(self, id_turno):
        fila = super().obtener_por_id("Turno", "id_turno", id_turno)
        return Turno(**dict(fila)) if fila else None

    def actualizar(self, turno: Turno):
        self.ejecutar("""
            UPDATE Turno
            SET fecha=?, hora_inicio=?, hora_fin=?, estado=?
            WHERE id_turno=?
        """, (str(turno.fecha), str(turno.hora_inicio), str(turno.hora_fin), turno.estado, turno.id_turno))

    def eliminar(self, id_turno):
        self.ejecutar("DELETE FROM Turno WHERE id_turno=?", (id_turno,))

    def marcar_como_reservado(self, id_turno):
        """Marca el turno como reservado (no disponible)."""
        self.ejecutar("""
            UPDATE Turno
            SET estado = 'reservado'
            WHERE id_turno = ?
        """, (id_turno,))

    def marcar_como_disponible(self, id_turno):
        """Marca el turno como disponible nuevamente."""
        self.ejecutar("""
            UPDATE Turno
            SET estado = 'disponible'
            WHERE id_turno = ?
        """, (id_turno,))


