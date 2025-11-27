from backend.app.dominio.cancha import Cancha
from backend.app.dominio.cancha_futbol import CanchaFutbol
from backend.app.dominio.cancha_basquet import CanchaBasquet
from backend.app.dominio.cancha_padel import CanchaPadel
from backend.app.repositorios.base_repo import BaseRepository


class CanchaRepository(BaseRepository):
    """CRUD para la tabla Cancha."""

    def agregar(self, cancha: Cancha):
        if isinstance(cancha, CanchaBasquet):
            tipo = "basquet"
            superficie = None
            tamaño = cancha.tamaño
        elif isinstance(cancha, CanchaFutbol):
            tipo = "futbol"
            superficie = cancha.superficie
            tamaño = cancha.tamaño
        elif isinstance(cancha, CanchaPadel):
            tipo = "padel"
            superficie = cancha.superficie
            tamaño = None
        else:
            raise ValueError("Tipo de cancha no reconocido")

        cancha.id_cancha = self.ejecutar(
            """
            INSERT INTO Cancha (tipo, nombre, superficie, tamaño, techada, iluminacion, estado, precio_base)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (
                tipo,
                cancha.nombre,
                superficie,
                tamaño,
                cancha.techada,
                cancha.iluminacion,
                cancha.estado,
                cancha.precio_base,
            ),
        )

        cancha.tipo = tipo
        return cancha

    # ----------------------------------------
    #  🔹 Método central: decidir qué subclase instanciar
    # ----------------------------------------
    def _instanciar_cancha(self, fila):
        """Devuelve una instancia del tipo de cancha correcto según el campo 'tipo'."""
        if not fila:
            return None

        f = dict(fila)
        tipo = (f.get("tipo") or "").lower()

        # 🔹 Filtramos solo los campos válidos para cada subclase
        comunes = {
            "id_cancha": f.get("id_cancha"),
            "nombre": f.get("nombre"),
            "tipo": tipo,
            "estado": f.get("estado"),
            "precio_base": f.get("precio_base"),
            "techada": f.get("techada"),
            "iluminacion": f.get("iluminacion"),
        }

        if tipo == "futbol":
            return CanchaFutbol(superficie=f.get("superficie"), tamaño=f.get("tamaño"), **comunes)
        elif tipo == "basquet":
            return CanchaBasquet(tamaño=f.get("tamaño"), **comunes)
        elif tipo == "padel":
            return CanchaPadel(superficie=f.get("superficie"), **comunes)
        else:
            print(f"⚠️ Tipo de cancha desconocido: {tipo}")
            return None

    # ----------------------------------------
    #  🔹 Listar, obtener y filtrar
    # ----------------------------------------
    def listar_todas(self):
        filas = self.obtener_todos("SELECT * FROM Cancha")
        return [self._instanciar_cancha(f) for f in filas if f]

    def obtener_por_id(self, id_cancha):
        fila = super().obtener_por_id("Cancha", "id_cancha", id_cancha)
        return self._instanciar_cancha(fila)

    def obtener_por_tipo(self, tipo):
        filas = self.obtener_todos("SELECT * FROM Cancha WHERE tipo=?", (tipo,))
        return [self._instanciar_cancha(f) for f in filas if f]

    # ----------------------------------------
    #  🔹 Actualizar y eliminar
    # ----------------------------------------
    def actualizar(self, cancha: Cancha):
        if isinstance(cancha, CanchaBasquet):
            tipo = "basquet"
            superficie = None
            tamaño = cancha.tamaño
        elif isinstance(cancha, CanchaFutbol):
            tipo = "futbol"
            superficie = cancha.superficie
            tamaño = cancha.tamaño
        elif isinstance(cancha, CanchaPadel):
            tipo = "padel"
            superficie = cancha.superficie
            tamaño = None
        else:
            raise ValueError("Tipo de cancha no reconocido")

        self.ejecutar(
            """
            UPDATE Cancha
            SET tipo=?, nombre=?, superficie=?, tamaño=?, techada=?, iluminacion=?, estado=?, precio_base=?
            WHERE id_cancha=?
            """,
            (
                tipo,
                cancha.nombre,
                superficie,
                tamaño,
                cancha.techada,
                cancha.iluminacion,
                cancha.estado,
                cancha.precio_base,
                cancha.id_cancha,
            ),
        )

    def eliminar(self, id_cancha):
        self.ejecutar("DELETE FROM Cancha WHERE id_cancha=?", (id_cancha,))

    # ----------------------------------------
    #   Reportes
    # ----------------------------------------
    def obtener_mas_reservadas(self, top_n=5, fecha_inicio=None, fecha_fin=None):
        query = """
            SELECT c.id_cancha, c.nombre, COUNT(r.id_reserva) AS total_reservas
            FROM Cancha c
            LEFT JOIN Reserva r ON c.id_cancha = r.id_cancha
            LEFT JOIN Turno t ON r.id_turno = t.id_turno
        """
        params = []
        if fecha_inicio and fecha_fin:
            query += " WHERE t.fecha BETWEEN ? AND ?"
            params.extend([fecha_inicio, fecha_fin])
        query += """
            GROUP BY c.id_cancha
            ORDER BY total_reservas DESC
            LIMIT ?
        """
        params.append(top_n)
        return self.obtener_todos(query, tuple(params))
