import sqlite3
import os

# Ruta absoluta hacia la base de datos
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
RUTA_BD = os.path.join(BASE_DIR, "bd", "bd_canchas.db")

def get_connection():
    """
    Retorna una conexión SQLite activa con foreign_keys habilitadas.
    Permite uso multihilo (check_same_thread=False) para FastAPI/Uvicorn.
    """
    conn = sqlite3.connect(RUTA_BD, check_same_thread=False)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA foreign_keys = ON;")
    return conn
