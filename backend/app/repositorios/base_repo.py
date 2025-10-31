from backend.app.config.db_connection import get_connection

class BaseRepository:
    """
    Repositorio base con operaciones genéricas para interactuar con SQLite.
    Todas las clases repositorio heredan de esta.
    """

    def __init__(self):
        # Se conecta usando la función centralizada
        self.conn = get_connection()
        self.cursor = self.conn.cursor()

    # -----------------------------
    # MÉTODOS GENÉRICOS
    # -----------------------------

    def ejecutar(self, query, params=()):
        """Ejecuta una consulta SQL (INSERT, UPDATE, DELETE) y confirma cambios."""
        self.cursor.execute(query, params)

    def obtener_uno(self, query, params=()):
        """Ejecuta una consulta y devuelve una sola fila como dict o None."""
        self.cursor.execute(query, params)
        fila = self.cursor.fetchone()
        return dict(fila) if fila else None

    def obtener_todos(self, query, params=()):
        """Ejecuta una consulta y devuelve todas las filas como lista de dicts."""
        self.cursor.execute(query, params)
        filas = self.cursor.fetchall()
        return [dict(f) for f in filas]

    def obtener_por_id(self, tabla, id_columna, valor):
        """
        Devuelve una fila según su ID de cualquier tabla.
        Ejemplo: obtener_por_id("Usuario", "id_usuario", 1)
        """
        query = f"SELECT * FROM {tabla} WHERE {id_columna} = ?"
        self.cursor.execute(query, (valor,))
        fila = self.cursor.fetchone()
        return dict(fila) if fila else None

    def cerrar(self):
        """Cierra la conexión con la base de datos."""
        self.conn.close()

    def commit(self):
        """Confirma los cambios pendientes en la base de datos."""
        self.conn.commit()

    def rollback(self):
        """Revierte los cambios pendientes (si hubo algún error)."""
        self.conn.rollback()
