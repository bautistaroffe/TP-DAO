import sqlite3
from datetime import datetime, timedelta, date
import random

RUTA_BD = "./bd_canchas.db"

def cargar_datos_prueba():
    """
    Carga 10 registros de datos de prueba en las tablas:
    - Usuario
    - Torneo
    - ServicioAdicional
    - Reserva
    - Pago

    Las tablas Cancha y Turno ya deben estar cargadas con datos de seteo.
    """

    # Conectar a la base de datos
    conn = sqlite3.connect(RUTA_BD)
    cursor = conn.cursor()
    cursor.execute("PRAGMA foreign_keys = ON;")

    # ========================================
    # 1. USUARIOS (10 registros)
    # ========================================
    print("🟢 Insertando Usuarios...")
    usuarios = [
        ("35123456", "Juan", "Pérez", "1145678901", "juan.perez@email.com", "activo"),
        ("36234567", "María", "González", "1156789012", "maria.gonzalez@email.com", "activo"),
        ("37345678", "Carlos", "Rodríguez", "1167890123", "carlos.rodriguez@email.com", "activo"),
        ("38456789", "Ana", "Martínez", "1178901234", "ana.martinez@email.com", "activo"),
        ("39567890", "Luis", "Fernández", "1189012345", "luis.fernandez@email.com", "activo"),
        ("40678901", "Laura", "López", "1190123456", "laura.lopez@email.com", "activo"),
        ("41789012", "Diego", "Sánchez", "1101234567", "diego.sanchez@email.com", "activo"),
        ("42890123", "Sofía", "Ramírez", "1112345678", "sofia.ramirez@email.com", "activo"),
        ("43901234", "Martín", "Torres", "1123456789", "martin.torres@email.com", "activo"),
        ("44012345", "Valentina", "Flores", "1134567890", "valentina.flores@email.com", "activo"),
    ]

    for u in usuarios:
        cursor.execute("""
            INSERT INTO Usuario (dni, nombre, apellido, telefono, email, estado)
            VALUES (?, ?, ?, ?, ?, ?)
        """, u)

    print("✅ 10 Usuarios insertados correctamente.")

    # ========================================
    # 2. TORNEOS (10 registros)
    # ========================================
    print("🟢 Insertando Torneos...")
    hoy = date.today()
    torneos = [
        ("Torneo Apertura Fútbol", "Primera", (hoy + timedelta(days=5)).isoformat(), (hoy + timedelta(days=35)).isoformat(), "programado"),
        ("Copa Primavera Pádel", "Intermedia", (hoy + timedelta(days=10)).isoformat(), (hoy + timedelta(days=25)).isoformat(), "programado"),
        ("Liga Básquet Verano", "Avanzada", (hoy + timedelta(days=3)).isoformat(), (hoy + timedelta(days=40)).isoformat(), "programado"),
        ("Torneo Clausura Fútbol", "Segunda", (hoy + timedelta(days=15)).isoformat(), (hoy + timedelta(days=45)).isoformat(), "programado"),
        ("Copa Invierno Pádel", "Principiante", (hoy + timedelta(days=20)).isoformat(), (hoy + timedelta(days=50)).isoformat(), "programado"),
        ("Torneo Relámpago Fútbol", "Libre", (hoy + timedelta(days=7)).isoformat(), (hoy + timedelta(days=8)).isoformat(), "programado"),
        ("Liga Pádel Nocturna", "Intermedia", (hoy + timedelta(days=12)).isoformat(), (hoy + timedelta(days=30)).isoformat(), "programado"),
        ("Campeonato Básquet 3x3", "Libre", (hoy + timedelta(days=18)).isoformat(), (hoy + timedelta(days=19)).isoformat(), "programado"),
        ("Torneo Amistoso Fútbol", "Recreativa", (hoy + timedelta(days=25)).isoformat(), (hoy + timedelta(days=26)).isoformat(), "programado"),
        ("Copa Fin de Año Pádel", "Primera", (hoy + timedelta(days=60)).isoformat(), (hoy + timedelta(days=90)).isoformat(), "programado"),
    ]

    for t in torneos:
        cursor.execute("""
            INSERT INTO Torneo (nombre, categoria, fecha_inicio, fecha_fin, estado)
            VALUES (?, ?, ?, ?, ?)
        """, t)

    print("✅ 10 Torneos insertados correctamente.")

    # ========================================
    # 3. SERVICIOS ADICIONALES (10 registros)
    # ========================================
    print("🟢 Insertando Servicios Adicionales...")
    servicios = [
        (10, 1, 0, 1, 0),  # Asado para 10, con árbitro, con pecheras
        (0, 0, 1, 0, 4),   # Partido grabado, 4 paletas
        (15, 0, 0, 1, 0),  # Asado para 15, con pecheras
        (0, 1, 1, 1, 0),   # Árbitro, grabado, pecheras
        (0, 0, 0, 0, 2),   # Solo 2 paletas
        (20, 1, 0, 0, 0),  # Asado para 20, con árbitro
        (0, 0, 1, 0, 0),   # Solo grabación
        (8, 0, 0, 1, 0),   # Asado para 8, con pecheras
        (0, 1, 0, 0, 0),   # Solo árbitro
        (12, 0, 1, 1, 2),  # Asado para 12, grabado, pecheras, 2 paletas
    ]

    for s in servicios:
        cursor.execute("""
            INSERT INTO ServicioAdicional (cant_personas_asado, arbitro, partido_grabado, pecheras, cant_paletas)
            VALUES (?, ?, ?, ?, ?)
        """, s)

    print("✅ 10 Servicios Adicionales insertados correctamente.")

    # ========================================
    # 4. Obtener IDs disponibles
    # ========================================
    cursor.execute("SELECT id_usuario FROM Usuario")
    ids_usuarios = [r[0] for r in cursor.fetchall()]

    cursor.execute("SELECT id_torneo FROM Torneo")
    ids_torneos = [r[0] for r in cursor.fetchall()]

    cursor.execute("SELECT id_servicio FROM ServicioAdicional")
    ids_servicios = [r[0] for r in cursor.fetchall()]

    cursor.execute("SELECT id_cancha, id_turno FROM Turno WHERE estado = 'disponible' LIMIT 20")
    turnos_disponibles = cursor.fetchall()

    if len(turnos_disponibles) < 10:
        print("⚠️ ADVERTENCIA: No hay suficientes turnos disponibles. Se necesitan al menos 10.")
        conn.close()
        return

    print(f"📊 IDs disponibles: {len(ids_usuarios)} usuarios, {len(ids_torneos)} torneos, {len(ids_servicios)} servicios, {len(turnos_disponibles)} turnos")

    # ========================================
    # 5. RESERVAS (10 registros)
    # ========================================
    print("🟢 Insertando Reservas...")

    # Precios base de las canchas
    cursor.execute("SELECT id_cancha, precio_base FROM Cancha")
    precios_canchas = dict(cursor.fetchall())

    reservas_data = []
    for i in range(10):
        id_cancha, id_turno = turnos_disponibles[i]
        id_cliente = random.choice(ids_usuarios)
        id_torneo = random.choice(ids_torneos) if i % 3 == 0 else None  # 1 de cada 3 es torneo
        id_servicio = ids_servicios[i] if i < len(ids_servicios) else None

        precio_base = precios_canchas[id_cancha]
        # Agregar costo de servicios adicionales (simplificado)
        precio_total = precio_base + (random.randint(1000, 5000) if id_servicio else 0)

        estado = random.choice(['pendiente', 'confirmada', 'confirmada', 'confirmada'])  # Más confirmadas
        origen = random.choice(['online', 'online', 'presencial'])  # Más online

        reservas_data.append((id_cancha, id_turno, id_cliente, id_torneo, id_servicio, precio_total, estado, origen))

    for r in reservas_data:
        cursor.execute("""
            INSERT INTO Reserva (id_cancha, id_turno, id_cliente, id_torneo, id_servicio, precio_total, estado, origen)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        """, r)

    print("✅ 10 Reservas insertadas correctamente.")

    # ========================================
    # 6. PAGOS (10 registros)
    # ========================================
    print("🟢 Insertando Pagos...")

    cursor.execute("SELECT id_reserva, id_cliente, precio_total FROM Reserva")
    reservas_info = cursor.fetchall()

    metodos_pago = ['efectivo', 'tarjeta_debito', 'tarjeta_credito', 'transferencia', 'mercadopago']
    estados_pago = ['completado', 'completado', 'completado', 'pendiente']  # Más completados

    for id_reserva, id_cliente, precio_total in reservas_info:
        monto = precio_total
        fecha_pago = (hoy + timedelta(days=random.randint(-5, 5))).isoformat()
        metodo = random.choice(metodos_pago)
        estado_transaccion = random.choice(estados_pago)

        cursor.execute("""
            INSERT INTO Pago (id_usuario, id_reserva, monto, fecha_pago, metodo, estado_transaccion)
            VALUES (?, ?, ?, ?, ?, ?)
        """, (id_cliente, id_reserva, monto, fecha_pago, metodo, estado_transaccion))

    print("✅ 10 Pagos insertados correctamente.")

    # ========================================
    # Actualizar estado de turnos reservados
    # ========================================
    print("🔄 Actualizando estado de turnos...")
    for i in range(10):
        id_turno = turnos_disponibles[i][1]
        cursor.execute("UPDATE Turno SET estado = 'reservado' WHERE id_turno = ?", (id_turno,))

    print("✅ Estados de turnos actualizados.")

    # ========================================
    # Commit y cierre
    # ========================================
    conn.commit()

    # Verificar datos insertados
    print("\n📊 RESUMEN DE DATOS INSERTADOS:")
    cursor.execute("SELECT COUNT(*) FROM Usuario")
    print(f"   Usuarios: {cursor.fetchone()[0]}")

    cursor.execute("SELECT COUNT(*) FROM Torneo")
    print(f"   Torneos: {cursor.fetchone()[0]}")

    cursor.execute("SELECT COUNT(*) FROM ServicioAdicional")
    print(f"   Servicios Adicionales: {cursor.fetchone()[0]}")

    cursor.execute("SELECT COUNT(*) FROM Reserva")
    print(f"   Reservas: {cursor.fetchone()[0]}")

    cursor.execute("SELECT COUNT(*) FROM Pago")
    print(f"   Pagos: {cursor.fetchone()[0]}")

    conn.close()
    print("\n🏁 ✅ Carga de datos de prueba completada exitosamente.")



if __name__ == "__main__":
    cargar_datos_prueba()
