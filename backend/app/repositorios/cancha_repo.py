from backend.app.dominio.cancha import Cancha
from backend.app.dominio.cancha_basquet import CanchaBasquet
from backend.app.dominio.cancha_futbol import CanchaFutbol
from backend.app.dominio.cancha_padel import CanchaPadel
from backend.app.repositorios.base_repo import BaseRepository

class CanchaRepository(BaseRepository):
    """CRUD para la tabla Cancha."""

    def agregar(self, cancha: Cancha):
        if isinstance(cancha, CanchaBasquet):
            tipo = 'basquet'
            superficie = None
            tamaño = cancha.tamaño
        elif isinstance(cancha, CanchaFutbol):
            tipo = 'futbol'
            superficie = cancha.superficie
            tamaño = cancha.tamaño
        elif isinstance(cancha, CanchaPadel):
            tipo = 'padel'
            superficie = cancha.superficie
            tamaño = None
        self.ejecutar("""
            INSERT INTO Cancha (tipo, nombre, superficie, tamaño, techada, iluminacion, estado, precio_base)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        """, (tipo, cancha.nombre, superficie, tamaño,
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
        if isinstance(cancha, CanchaBasquet):
            tipo = 'basquet'
            superficie = None
            tamaño = cancha.tamaño
        elif isinstance(cancha, CanchaFutbol):
            tipo = 'futbol'
            superficie = cancha.superficie
            tamaño = cancha.tamaño
        elif isinstance(cancha, CanchaPadel):
            tipo = 'padel'
            superficie = cancha.superficie
            tamaño = None
        self.ejecutar("""
            UPDATE Cancha
            SET tipo=?, nombre=?, superficie=?, tamaño=?, techada=?, iluminacion=?, estado=?, precio_base=?
            WHERE id_cancha=?
        """, (tipo, cancha.nombre, superficie, tamaño, cancha.techada, cancha.iluminacion, cancha.estado, cancha.precio_base, cancha.id_cancha))

    def eliminar(self, id_cancha):
        self.ejecutar("DELETE FROM Cancha WHERE id_cancha=?", (id_cancha,))
    
    def obtener_por_tipo(self, tipo):
        filas = self.obtener_todos("SELECT * FROM Cancha WHERE tipo=?", (tipo,))
        return [Cancha(**f) for f in filas]
