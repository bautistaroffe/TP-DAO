import sqlite3
from datetime import datetime, timedelta, time, date

RUTA_BD = "./bd_canchas.db"

# --------------------------------------------
# Configuración general
# --------------------------------------------
HORARIO_INICIO = 10
HORARIO_FIN = 22
DIAS_EXCLUIDOS = [(12, 25), (1, 1)]  # (mes, día)

CANCHAS = [
    # tipo, nombre, superficie, tamaño, techada, iluminacion, precio_base
    ("futbol", "Fútbol 1", "césped sintético", "grande", 0, 1, 12000),
    ("futbol", "Fútbol 2", "césped natural", "mediana", 0, 0, 10000),
    ("padel", "Pádel 1", "blindex", None, 1, 1, 8000),
    ("padel", "Pádel 2", "muro", None, 0, 1, 7000),
    ("basquet", "Básquet 1", None, "reglamentaria", 0, 1, 9000),
    ("basquet", "Básquet 2", None, "recreativa", 1, 0, 8500),
]


def crear_canchas(cursor):
    print("🟢 Insertando canchas...")
    for c in CANCHAS:
        cursor.execute(
            """
            INSERT INTO Cancha (tipo, nombre, superficie, tamaño, techada, iluminacion, precio_base)
            VALUES (?, ?, ?, ?, ?, ?, ?)
            """,
            c
        )
    print("✅ Canchas creadas correctamente.")


def generar_turnos(cursor, fecha_inicio, fecha_fin):
    print("🕒 Generando turnos desde", fecha_inicio, "hasta", fecha_fin)
    cursor.execute("SELECT id_cancha FROM Cancha")
    canchas = [r[0] for r in cursor.fetchall()]

    fecha_actual = fecha_inicio
    while fecha_actual <= fecha_fin:
        # Saltar navidad y año nuevo
        if (fecha_actual.month, fecha_actual.day) not in DIAS_EXCLUIDOS:
            for id_cancha in canchas:
                for hora in range(HORARIO_INICIO, HORARIO_FIN):
                    hora_ini = time(hora, 0)
                    hora_fin = time(hora + 1, 0)
                    cursor.execute(
                        """
                        INSERT INTO Turno (id_cancha, fecha, hora_inicio, hora_fin, estado)
                        VALUES (?, ?, ?, ?, 'disponible')
                        """,
                        (id_cancha, fecha_actual.isoformat(), hora_ini.strftime("%H:%M"), hora_fin.strftime("%H:%M"))
                    )
        fecha_actual += timedelta(days=1)
    print("✅ Turnos generados correctamente.")


def main():
    conn = sqlite3.connect(RUTA_BD)
    cursor = conn.cursor()

    # Evita duplicar si ya existen
    cursor.execute("SELECT COUNT(*) FROM Cancha")
    if cursor.fetchone()[0] == 0:
        crear_canchas(cursor)
    else:
        print("ℹ️ Ya existen canchas, no se insertarán nuevamente.")

    cursor.execute("SELECT COUNT(*) FROM Turno")
    if cursor.fetchone()[0] == 0:
        hoy = date.today()
        fin_mes = hoy + timedelta(days=30)
        generar_turnos(cursor, hoy, fin_mes)
    else:
        print("ℹ️ Ya existen turnos, no se insertarán nuevamente.")

    conn.commit()
    conn.close()
    print("🏁 Carga inicial completada correctamente.")


if __name__ == "__main__":
    main()
