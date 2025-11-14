from backend.app.config.db_connection import get_connection
import sqlite3


class BaseRepository:
    """
    Repositorio base con manejo seguro de conexiones SQLite y soporte para transacciones explícitas.
    Permite operaciones atómicas individuales o múltiples operaciones dentro de una transacción.
    """

    def __init__(self):
        # Conexión y cursor para transacciones explícitas.
        # Si son None, las operaciones actúan de forma atómica (abrir/ejecutar/cerrar).
        self._conn = None
        self._cursor = None

    # -----------------------------
    # GESTIÓN DE TRANSACCIONES
    # -----------------------------
    def iniciar_transaccion(self):
        """Abre una conexión y cursor para iniciar una transacción."""
        if self._conn:
            raise sqlite3.Error("Ya existe una transacción en curso. Confirme o revierta antes de iniciar otra.")
        self._conn = get_connection()
        self._cursor = self._conn.cursor()

    def confirmar_transaccion(self):
        """Confirma los cambios de la transacción y cierra la conexión."""
        if not self._conn:
            raise sqlite3.Error("No hay transacción activa para confirmar.")
        try:
            self._conn.commit()
        finally:
            self._conn.close()
            self._conn = None
            self._cursor = None

    def revertir_transaccion(self):
        """Revierte los cambios de la transacción y cierra la conexión."""
        if not self._conn:
            raise sqlite3.Error("No hay transacción activa para revertir.")
        try:
            self._conn.rollback()
        finally:
            self._conn.close()
            self._conn = None
            self._cursor = None

    # -----------------------------
    # MÉTODOS INTERNOS Y GENÉRICOS
    # -----------------------------
    def _obtener_contexto(self, lectura=True):
        """
        Devuelve (conn, cursor, es_atomica).
        Si hay una transacción activa, usa el contexto interno.
        Si no, crea una conexión nueva (operación atómica).
        """
        if self._conn:
            # Transacción activa
            return self._conn, self._cursor, False
        else:
            # Operación atómica
            conn = get_connection()
            return conn, conn.cursor(), True

    def ejecutar(self, query, params=()):
        """
        Ejecuta una consulta SQL (INSERT, UPDATE o DELETE).
        Devuelve el lastrowid para INSERT.
        """
        conn, cursor, es_atomica = self._obtener_contexto(lectura=False)
        lastrowid = None
        try:
            cursor.execute(query, params)
            lastrowid = cursor.lastrowid
            if es_atomica:
                conn.commit()
        finally:
            if es_atomica:
                cursor.close()
                conn.close()

        return lastrowid

    def obtener_uno(self, query, params=()):
        """Ejecuta una consulta y devuelve una sola fila como dict o None."""
        conn, cursor, es_atomica = self._obtener_contexto(lectura=True)
        fila = None
        try:
            cursor.execute(query, params)
            fila = cursor.fetchone()
        finally:
            if es_atomica:
                cursor.close()
                conn.close()

        return dict(fila) if fila else None

    def obtener_todos(self, query, params=()):
        """Ejecuta una consulta y devuelve todas las filas como lista de dicts."""
        conn, cursor, es_atomica = self._obtener_contexto(lectura=True)
        filas = []
        try:
            cursor.execute(query, params)
            filas = cursor.fetchall()
        finally:
            if es_atomica:
                cursor.close()
                conn.close()

        return [dict(f) for f in filas]

    def obtener_por_id(self, tabla, id_columna, valor):
        """Devuelve una fila según su ID de cualquier tabla."""
        query = f"SELECT * FROM {tabla} WHERE {id_columna} = ?"
        return self.obtener_uno(query, (valor,))