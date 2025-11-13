from backend.app.dominio.servicio_adicional import ServicioAdicional
from backend.app.repositorios.base_repo import BaseRepository

class ServicioAdicionalRepository(BaseRepository):
    """CRUD para la tabla ServicioAdicional."""

    def agregar(self, servicio: ServicioAdicional):
        servicio.id_servicio = self.ejecutar("""
            INSERT INTO ServicioAdicional (cant_personas_asado, arbitro, partido_grabado, pecheras, cant_paletas)
            VALUES (?, ?, ?, ?, ?)
        """, (servicio.cant_personas_asado, servicio.arbitro, servicio.partido_grabado,
              servicio.pecheras, servicio.cant_paletas))
        return servicio

    def listar_todos(self):
        filas = self.obtener_todos("SELECT * FROM ServicioAdicional")
        return [ServicioAdicional(**f) for f in filas]

    def obtener_por_id(self, id_servicio):
        fila = super().obtener_por_id("ServicioAdicional", "id_servicio", id_servicio)
        return ServicioAdicional(**fila) if fila else None

    def actualizar(self, servicio: ServicioAdicional):
        self.ejecutar("""
            UPDATE ServicioAdicional
            SET cant_personas_asado=?, arbitro=?, partido_grabado=?, pecheras=?, cant_paletas=?
            WHERE id_servicio=?
        """, (servicio.cant_personas_asado, servicio.arbitro, servicio.partido_grabado,
              servicio.pecheras, servicio.cant_paletas, servicio.id_servicio))

    def eliminar(self, id_servicio):
        self.ejecutar("DELETE FROM ServicioAdicional WHERE id_servicio=?", (id_servicio,))
