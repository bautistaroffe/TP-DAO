import sqlite3

RUTA_BD = "./bd_ecopark.db"
conn = sqlite3.connect(RUTA_BD)
cursor = conn.cursor()
cursor.execute("PRAGMA foreign_keys = ON;")

# ========================================
# USUARIO
# ========================================
cursor.execute("""
CREATE TABLE IF NOT EXISTS Usuario (
    id_usuario INTEGER PRIMARY KEY AUTOINCREMENT,
    dni TEXT UNIQUE NOT NULL,
    nombre TEXT NOT NULL,
    apellido TEXT NOT NULL,
    telefono TEXT,
    email TEXT,
    estado TEXT DEFAULT 'activo'
);
""")

# ========================================
# TORNEO
# ========================================
cursor.execute("""
CREATE TABLE IF NOT EXISTS Torneo (
    id_torneo INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre TEXT NOT NULL,
    categoria TEXT,
    fecha_inicio DATE,
    fecha_fin DATE,
    estado TEXT DEFAULT 'programado'
);
""")

# ========================================
# CANCHAS CONCRETAS (sin clase base)
# ========================================

cursor.execute("""
CREATE TABLE IF NOT EXISTS CanchaFutbol (
    id_cancha INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre TEXT NOT NULL,
    superficie TEXT,
    tamaño TEXT,
    techada INTEGER DEFAULT 0,
    iluminacion INTEGER DEFAULT 0,
    estado TEXT DEFAULT 'disponible',
    precio_base REAL NOT NULL
);
""")

cursor.execute("""
CREATE TABLE IF NOT EXISTS CanchaPadel (
    id_cancha INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre TEXT NOT NULL,
    superficie TEXT,
    techada INTEGER DEFAULT 0,
    iluminacion INTEGER DEFAULT 0,
    estado TEXT DEFAULT 'disponible',
    precio_base REAL NOT NULL
);
""")

cursor.execute("""
CREATE TABLE IF NOT EXISTS CanchaBasquet (
    id_cancha INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre TEXT NOT NULL,
    tamaño TEXT,
    techada INTEGER DEFAULT 0,
    iluminacion INTEGER DEFAULT 0,
    estado TEXT DEFAULT 'disponible',
    precio_base REAL NOT NULL
);
""")

# ========================================
# SERVICIO ADICIONAL
# ========================================
cursor.execute("""
CREATE TABLE IF NOT EXISTS ServicioAdicional (
    id_servicio INTEGER PRIMARY KEY AUTOINCREMENT,
    cant_personas_asado INTEGER DEFAULT 0,
    arbitro INTEGER DEFAULT 0,
    partido_grabado INTEGER DEFAULT 0,
    pecheras INTEGER DEFAULT 0,
    cant_paletas INTEGER DEFAULT 0
);
""")

# ========================================
# TURNOS (comparten FK a distintas canchas)
# ========================================
cursor.execute("""
CREATE TABLE IF NOT EXISTS Turno (
    id_turno INTEGER PRIMARY KEY AUTOINCREMENT,
    tipo_cancha TEXT NOT NULL CHECK (tipo_cancha IN ('futbol','padel','basquet')),
    id_cancha INTEGER NOT NULL,
    fecha DATE NOT NULL,
    hora_inicio TIME NOT NULL,
    hora_fin TIME NOT NULL,
    estado TEXT DEFAULT 'disponible',
    CONSTRAINT ck_turno_horas CHECK (hora_fin > hora_inicio)
);
""")

# ========================================
# RESERVAS
# ========================================
cursor.execute("""
CREATE TABLE IF NOT EXISTS Reserva (
    id_reserva INTEGER PRIMARY KEY AUTOINCREMENT,
    tipo_cancha TEXT NOT NULL CHECK (tipo_cancha IN ('futbol','padel','basquet')),
    id_cancha INTEGER NOT NULL,
    id_turno INTEGER NOT NULL,
    id_cliente INTEGER NOT NULL,
    id_torneo INTEGER,
    precio_total REAL NOT NULL,
    estado TEXT DEFAULT 'pendiente',
    origen TEXT DEFAULT 'online',
    FOREIGN KEY (id_cliente) REFERENCES Usuario(id_usuario)
        ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (id_torneo) REFERENCES Torneo(id_torneo)
        ON DELETE CASCADE ON UPDATE CASCADE,
    UNIQUE (tipo_cancha, id_cancha, id_turno)
);
""")

# ========================================
# RELACIÓN RESERVA - SERVICIO
# ========================================
cursor.execute("""
CREATE TABLE IF NOT EXISTS ReservaServicio (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    id_reserva INTEGER NOT NULL,
    id_servicio INTEGER NOT NULL,
    FOREIGN KEY (id_reserva) REFERENCES Reserva(id_reserva)
        ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (id_servicio) REFERENCES ServicioAdicional(id_servicio)
        ON DELETE CASCADE ON UPDATE CASCADE,
    UNIQUE (id_reserva, id_servicio)
);
""")

# ========================================
# PAGOS
# ========================================
cursor.execute("""
CREATE TABLE IF NOT EXISTS Pago (
    id_pago INTEGER PRIMARY KEY AUTOINCREMENT,
    id_usuario INTEGER NOT NULL,
    id_reserva INTEGER NOT NULL,
    monto REAL NOT NULL CHECK (monto >= 0),
    fecha_pago DATE NOT NULL,
    metodo TEXT,
    estado_transaccion TEXT DEFAULT 'pendiente',
    FOREIGN KEY (id_usuario) REFERENCES Usuario(id_usuario)
        ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (id_reserva) REFERENCES Reserva(id_reserva)
        ON DELETE CASCADE ON UPDATE CASCADE,
    UNIQUE (id_reserva)
);
""")

conn.commit()
conn.close()
print("✅ Base de datos creada correctamente sin tabla base Cancha (herencia manejada en modelo).")
