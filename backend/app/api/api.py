from fastapi import FastAPI
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

# ============================
# Inclusión de Routers
# ============================
app.include_router(canchas_router)
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
