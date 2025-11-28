from backend.app.dominio.turno import Turno
from backend.app.repositorios.base_repo import BaseRepository
from datetime import date
class TurnoRepository(BaseRepository):
    """CRUD para la tabla Turno."""

    def agregar(self, turno: Turno):
        turno.id_turno = self.ejecutar("""
            INSERT INTO Turno (id_cancha, fecha, hora_inicio, hora_fin, estado)
            VALUES (?, ?, ?, ?, ?)
        """, (turno.id_cancha, str(turno.fecha), str(turno.hora_inicio), str(turno.hora_fin), turno.estado))
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

    def obtener_disponibles_por_cancha(self, id_cancha):
        """Obtiene solo los turnos con estado 'disponible' para una cancha,
           desde la fecha actual, ordenados por fecha y hora."""

        fecha_actual = date.today()

        query = f"""
            SELECT * FROM Turno
            WHERE 
                id_cancha = ? 
                AND estado = 'disponible'
                -- CRÍTICO: SOLO turnos desde la fecha actual en adelante
                AND fecha >= '{fecha_actual}'
            ORDER BY fecha ASC, hora_inicio ASC
        """
        # Solo se pasa id_cancha
        filas = self.obtener_todos(query, (id_cancha,))
        return [Turno(**dict(f)) for f in filas]

    def obtener_turnos_por_cancha_y_fecha(self, id_cancha, fecha):
        """Obtiene todos los turnos NO CANCELADOS para una cancha y fecha específica."""
        query = """
            SELECT * FROM Turno
            WHERE 
                id_cancha = ? 
                AND fecha = ?
                AND estado != 'cancelado' 
        """
        # Aseguramos que la fecha se pase como string si es necesario para el driver SQLite
        filas = self.obtener_todos(query, (id_cancha, str(fecha)))
        return [Turno(**dict(f)) for f in filas]

    def obtener_disponibles_en_rango_completo(self, fecha_inicio, fecha_fin, hora_inicio, hora_fin, ids_canchas=None):
        """
        Obtiene turnos disponibles entre fechas, respetando rango horario y filtrando por canchas.
        """
        query = """
            SELECT * FROM Turno
            WHERE estado = 'disponible'
              AND fecha BETWEEN ? AND ?
              AND hora_inicio >= ?
              AND hora_fin <= ?
        """

        params = [
            str(fecha_inicio),
            str(fecha_fin),
            str(hora_inicio),
            str(hora_fin)
        ]

        # Agrego filtro por canchas si corresponde
        if ids_canchas:
            placeholders = ",".join("?" * len(ids_canchas))
            query += f" AND id_cancha IN ({placeholders})"
            params.extend(ids_canchas)

        query += " ORDER BY fecha ASC, hora_inicio ASC"

        filas = self.obtener_todos(query, params)
        return [Turno(**dict(f)) for f in filas]


