import sqlite3
from datetime import datetime, timedelta, date
import random

RUTA_BD = "./bd_canchas.db"

def cargar_datos_prueba():
    """
    Carga datos de prueba en las tablas:
    - Usuario
    - Torneo
    - ServicioAdicional
    - Reserva
    - Pago

    Las tablas Cancha y Turno ya deben estar cargadas con datos de seteo.
    """

    conn = sqlite3.connect(RUTA_BD)
    cursor = conn.cursor()
    cursor.execute("PRAGMA foreign_keys = ON;")

    # ========================================
    # 1. USUARIOS
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
    # 2. TORNEOS
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
    # 3. SERVICIOS ADICIONALES
    # ========================================
    print("🟢 Insertando Servicios Adicionales...")
    servicios = [
        (10, 1, 0, 1, 0),
        (0, 0, 1, 0, 4),
        (15, 0, 0, 1, 0),
        (0, 1, 1, 1, 0),
        (0, 0, 0, 0, 2),
        (20, 1, 0, 0, 0),
        (0, 0, 1, 0, 0),
        (8, 0, 0, 1, 0),
        (0, 1, 0, 0, 0),
        (12, 0, 1, 1, 2),
    ]
    for s in servicios:
        cursor.execute("""
            INSERT INTO ServicioAdicional (cant_personas_asado, arbitro, partido_grabado, pecheras, cant_paletas)
            VALUES (?, ?, ?, ?, ?)
        """, s)
    print("✅ 10 Servicios Adicionales insertados correctamente.")

    # ========================================
    # 4. Obtener IDs base
    # ========================================
    cursor.execute("SELECT id_usuario FROM Usuario")
    ids_usuarios = [r[0] for r in cursor.fetchall()]
    cursor.execute("SELECT id_torneo FROM Torneo")
    ids_torneos = [r[0] for r in cursor.fetchall()]
    cursor.execute("SELECT id_servicio FROM ServicioAdicional")
    ids_servicios = [r[0] for r in cursor.fetchall()]
    cursor.execute("SELECT id_cancha, id_turno FROM Turno WHERE estado = 'disponible' LIMIT 40")
    turnos_disponibles = cursor.fetchall()
    if len(turnos_disponibles) < 10:
        print("⚠️ No hay suficientes turnos disponibles.")
        conn.close()
        return
    print(f"📊 IDs disponibles: {len(ids_usuarios)} usuarios, {len(ids_torneos)} torneos, {len(ids_servicios)} servicios, {len(turnos_disponibles)} turnos")

    # ========================================
    # 5. RESERVAS base
    # ========================================
    print("🟢 Insertando Reservas base...")
    cursor.execute("SELECT id_cancha, precio_base FROM Cancha")
    precios_canchas = dict(cursor.fetchall())
    reservas_data = []
    for i in range(10):
        id_cancha, id_turno = turnos_disponibles[i]
        id_cliente = random.choice(ids_usuarios)
        id_torneo = random.choice(ids_torneos) if i % 3 == 0 else None
        id_servicio = ids_servicios[i] if i < len(ids_servicios) else None
        precio_base = precios_canchas[id_cancha]
        precio_total = precio_base + (random.randint(1000, 5000) if id_servicio else 0)
        estado = random.choice(['pendiente', 'confirmada', 'confirmada'])
        origen = random.choice(['torneo', 'particular'])
        reservas_data.append((id_cancha, id_turno, id_cliente, id_torneo, id_servicio, precio_total, estado, origen))
    for r in reservas_data:
        cursor.execute("""
            INSERT INTO Reserva (id_cancha, id_turno, id_cliente, id_torneo, id_servicio, precio_total, estado, origen)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        """, r)
    print("✅ 10 Reservas base insertadas correctamente.")

    # ========================================
    # 6. PAGOS base
    # ========================================
    print("🟢 Insertando Pagos base...")
    cursor.execute("SELECT id_reserva, id_cliente, precio_total FROM Reserva")
    reservas_info = cursor.fetchall()
    metodos_pago = ['efectivo', 'tarjeta_debito', 'tarjeta_credito', 'transferencia', 'mercadopago']
    estados_pago = ['completado', 'completado', 'pendiente']
    for id_reserva, id_cliente, precio_total in reservas_info:
        fecha_pago = (hoy + timedelta(days=random.randint(-5, 5))).isoformat()
        cursor.execute("""
            INSERT INTO Pago (id_usuario, id_reserva, monto, fecha_pago, metodo, estado_transaccion)
            VALUES (?, ?, ?, ?, ?, ?)
        """, (id_cliente, id_reserva, precio_total, fecha_pago, random.choice(metodos_pago), random.choice(estados_pago)))
    print("✅ 10 Pagos base insertados correctamente.")

    # ========================================
    # 7. Reservas adicionales para pruebas de reportes
    # ========================================
    print("🟢 Insertando reservas adicionales para test de reportes...")

    cursor.execute("SELECT id_cancha FROM Cancha")
    ids_canchas = [r[0] for r in cursor.fetchall()]
    cursor.execute("SELECT id_turno, id_cancha FROM Turno WHERE estado = 'disponible'")
    turnos_disp = cursor.fetchall()

    # 🔸 Cliente 1 en canchas ≠ 1
    id_cliente_1 = 1
    canchas_cliente_1 = [c for c in ids_canchas if c != 1]
    reservas_cliente_1 = []
    for i in range(min(5, len(canchas_cliente_1))):
        id_cancha = canchas_cliente_1[i]
        id_turno = random.choice(turnos_disp)[0]
        id_servicio = random.choice(ids_servicios)
        precio_total = random.randint(8000, 15000)
        estado = random.choice(["confirmada", "pendiente"])
        origen = random.choice(["particular", "torneo"])
        reservas_cliente_1.append((id_cancha, id_turno, id_cliente_1, None, id_servicio, precio_total, estado, origen))
    for r in reservas_cliente_1:
        cursor.execute("""
            INSERT INTO Reserva (id_cancha, id_turno, id_cliente, id_torneo, id_servicio, precio_total, estado, origen)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        """, r)

    # 🔸 Otros clientes en canchas ≠ 1
    otros_clientes = [c for c in ids_usuarios if c != 1]
    canchas_otros = [c for c in ids_canchas if c != 1]
    reservas_otros = []
    for i in range(8):
        id_cancha = random.choice(canchas_otros)
        id_turno = random.choice(turnos_disp)[0]
        id_cliente = random.choice(otros_clientes)
        id_servicio = random.choice(ids_servicios)
        precio_total = random.randint(7000, 14000)
        estado = random.choice(["confirmada", "pendiente"])
        origen = random.choice(["particular", "torneo"])
        reservas_otros.append((id_cancha, id_turno, id_cliente, None, id_servicio, precio_total, estado, origen))
    for r in reservas_otros:
        cursor.execute("""
            INSERT INTO Reserva (id_cancha, id_turno, id_cliente, id_torneo, id_servicio, precio_total, estado, origen)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        """, r)

    print(f"✅ {len(reservas_cliente_1)} reservas extra para cliente 1 y {len(reservas_otros)} para otros clientes insertadas.")

    # ========================================
    # 8. Pagos adicionales
    # ========================================
    print("🟢 Insertando pagos adicionales...")
    total_nuevas = len(reservas_cliente_1) + len(reservas_otros)
    cursor.execute("SELECT id_reserva, id_cliente, precio_total FROM Reserva ORDER BY id_reserva DESC LIMIT ?", (total_nuevas,))
    nuevas = cursor.fetchall()
    metodos = ["efectivo", "transferencia", "mercadopago", "tarjeta_credito"]
    estados = ["completado", "pendiente", "completado"]
    for id_reserva, id_cliente, monto in nuevas:
        fecha_pago = (date.today() - timedelta(days=random.randint(0, 10))).isoformat()
        cursor.execute("""
            INSERT INTO Pago (id_usuario, id_reserva, monto, fecha_pago, metodo, estado_transaccion)
            VALUES (?, ?, ?, ?, ?, ?)
        """, (id_cliente, id_reserva, monto, fecha_pago, random.choice(metodos), random.choice(estados)))
    print("✅ Pagos adicionales insertados.")

    # ========================================
    # 9. Actualizar turnos usados
    # ========================================
    print("🔄 Actualizando estado de turnos usados...")
    all_turnos = [r[1] for r in reservas_data + reservas_cliente_1 + reservas_otros]
    for id_turno in all_turnos:
        cursor.execute("UPDATE Turno SET estado = 'reservado' WHERE id_turno = ?", (id_turno,))
    print("✅ Turnos actualizados a reservado.")

    # ========================================
    # Commit y resumen
    # ========================================
    conn.commit()
    print("\n📊 RESUMEN FINAL:")
    for tabla in ["Usuario", "Torneo", "ServicioAdicional", "Reserva", "Pago"]:
        cursor.execute(f"SELECT COUNT(*) FROM {tabla}")
        print(f"   {tabla}: {cursor.fetchone()[0]}")
    conn.close()
    print("\n🏁 ✅ Carga completa (base + extra) realizada exitosamente.")

if __name__ == "__main__":
    cargar_datos_prueba()
