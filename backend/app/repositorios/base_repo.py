from backend.app.config.db_connection import get_connection

class BaseRepository:
    """
    Repositorio base con manejo seguro de conexiones SQLite.
    Cada operación abre y cierra su propia conexión,
    evitando errores de cursores recursivos.
    """

    # -----------------------------
    # MÉTODOS GENÉRICOS
    # -----------------------------
    def ejecutar(self, query, params=()):
        """Ejecuta una consulta SQL (INSERT, UPDATE o DELETE)."""
        conn = get_connection()
        cursor = conn.cursor()
        cursor.execute(query, params)
        conn.commit()
        lastrowid = cursor.lastrowid
        conn.close()
        return lastrowid  # 🔹 Para INSERT devuelve el ID generado

    def obtener_uno(self, query, params=()):
        """Ejecuta una consulta y devuelve una sola fila como dict o None."""
        conn = get_connection()
        cursor = conn.cursor()
        cursor.execute(query, params)
        fila = cursor.fetchone()
        conn.close()
        return dict(fila) if fila else None

    def obtener_todos(self, query, params=()):
        """Ejecuta una consulta y devuelve todas las filas como lista de dicts."""
        conn = get_connection()
        cursor = conn.cursor()
        cursor.execute(query, params)
        filas = cursor.fetchall()
        conn.close()
        return [dict(f) for f in filas]

    def obtener_por_id(self, tabla, id_columna, valor):
        """Devuelve una fila según su ID de cualquier tabla."""
        query = f"SELECT * FROM {tabla} WHERE {id_columna} = ?"
        return self.obtener_uno(query, (valor,))
