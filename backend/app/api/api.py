from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.app.api.routers.canchas import router as canchas_router
from backend.app.api.routers.reservas import router as reservas_router
from backend.app.api.routers.torneos import router as torneos_router
from backend.app.api.routers.turnos import router as turnos_router
from backend.app.api.routers.usuarios import router as usuarios_router
from backend.app.api.routers.pagos import router as pagos_router
from backend.app.api.routers.adicional import router as servicios_adicionales_router

app = FastAPI(
    title="API de Gestión de Canchas Deportivas",
    description="Sistema completo de gestión de canchas, reservas, torneos, pagos y servicios adicionales.",
    version="1.0.0"
)
origins = [
    # 🚨 ESTE ES EL ORIGEN CLAVE: El puerto donde corre tu frontend
    "http://localhost:5174",
    # Si planeas desplegar o usar otro frontend en localhost:
    "http://localhost",
    "http://localhost:3000", # Puertos comunes para React/Vite
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,              # Permite los orígenes definidos arriba
    allow_credentials=True,             # Permite cookies de origen cruzado
    allow_methods=["*"],                # Permite todos los métodos (GET, POST, DELETE, etc.)
    allow_headers=["*"],                # Permite todos los encabezados
)

# ============================
# Inclusión de Routers
# ============================
app.include_router(canchas_router, prefix="/api")
app.include_router(reservas_router)
app.include_router(torneos_router)
app.include_router(turnos_router)
app.include_router(usuarios_router)
app.include_router(pagos_router)
app.include_router(servicios_adicionales_router)


# ============================
# Ruta raíz
# ============================
@app.get("/", summary="Mensaje de bienvenida")
def root():
    return {
        "message": "Bienvenido a la API de Gestión de Canchas Deportivas ⚽🏀🎾",
        "version": "1.0.0",
        "endpoints": [
            "/canchas",
            "/turnos",
            "/reservas",
            "/torneos",
            "/usuarios",
            "/pagos",
            "/servicios-adicionales",
        ]
    }
