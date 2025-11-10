# TP-DAO

Estructura
```plaintext
reservas-canchas/
├── README.md
├── .gitignore
├── requirements.txt
├── .env.example
│
├── backend/                          
│   ├── __init__.py                    
│   ├── app/                           
│   │   ├── __init__.py
│   │   ├── main.py                    # punto de entrada (FastAPI / Flask / Tkinter)
│   │   │
│   │   ├── core/                      # ⚙️ configuración general
│   │   │   ├── __init__.py
│   │   │   ├── config.py              # manejo de .env, rutas, etc.
│   │   │   └── db_connection.py       # conexión a sqlite3 (singleton)
│   │   │
│   │   ├── bd/                        # 📦 scripts SQL y conexión base
│   │   │   ├── create_db.py           # crea las tablas (como tu ejemplo)
│   │   │   ├── seed_data.py           # carga de datos iniciales
│   │   │   └── bd_ecopark.db          # archivo de base de datos SQLite generado
│   │   │
│   │   ├── domain/                    # 🧩 clases de negocio (modelo lógico)
│   │   │   ├── __init__.py
│   │   │   ├── cancha.py
│   │   │   ├── usuario.py
│   │   │   ├── turno.py
│   │   │   ├── reserva.py
│   │   │   ├── torneo.py
│   │   │   ├── pago.py
│   │   │   └── servicio_adicional.py
│   │   │
│   │   ├── repositories/              # 💾 acceso a datos (CRUD SQLite)
│   │   │   ├── __init__.py
│   │   │   ├── base_repo.py           # clase genérica con métodos CRUD
│   │   │   ├── cancha_repo.py
│   │   │   ├── usuario_repo.py
│   │   │   ├── turno_repo.py
│   │   │   ├── reserva_repo.py
│   │   │   ├── torneo_repo.py
│   │   │   └── pago_repo.py
│   │   │
│   │   ├── services/                  # 🧠 lógica de negocio / transacciones
│   │   │   ├── __init__.py
│   │   │   ├── reserva_service.py     # valida choques de reservas, calcula precios, etc.
│   │   │   ├── torneo_service.py
│   │   │   └── reportes_service.py
│   │   │
│   │   ├── api/                       # 🌐 capa de endpoints (si es app web)
│   │   │   ├── __init__.py
│   │   │   ├── routers/
│   │   │   │   ├── __init__.py
│   │   │   │   ├── canchas.py
│   │   │   │   ├── usuarios.py
│   │   │   │   ├── turnos.py
│   │   │   │   ├── reservas.py
│   │   │   │   ├── torneos.py
│   │   │   │   ├── pagos.py
│   │   │   │   └── reportes.py
│   │   │   └── deps.py                  
│   │   │
│   │   ├── validations/               # ✅ validaciones de dominio
│   │   │   ├── __init__.py
│   │   │   ├── horarios.py
│   │   │   └── reglas.py
│   │   │
│   │   └── tests/                     # 🧪 pruebas unitarias
│   │       ├── __init__.py
│   │       ├── test_abm_basico.py
│   │       ├── test_reservas.py
│   │       └── test_reportes.py
│   │
│   └── venv/ (opcional)               # entorno virtual local
│
├── frontend/                          # ⚛️ Proyecto NO Python (React, Angular o Flet web)
│   ├── package.json
│   ├── vite.config.js
│   ├── src/
│   │   ├── main.jsx
│   │   ├── App.jsx
│   │   ├── components/
│   │   ├── pages/
│   │   ├── api/
│   │   └── styles/
│   └── public/
│
└── docs/                              # 📘 documentación (PDFs, diagramas, entregables)
    ├── modelo_ER.pdf
    ├── diagrama_clases.pdf
    ├── diagrama_casos_uso.pdf
    └── plan_trabajo.md
```
INSTRUCCIONES
Los pasos y requisitos para correr el frontend estan en el README.md dentro de la carptea frontend