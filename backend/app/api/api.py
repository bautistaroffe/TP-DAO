from fastapi import FastAPI
from backend.app.api.routers.canchas import router as canchas_router
from backend.app.api.routers.reservas import router as reservas_router
from backend.app.api.routers.torneos import router as torneos_router
from backend.app.api.routers.turnos import router as turnos_router

app = FastAPI(title="API de Gestión de Canchas Deportivas")

app.include_router(canchas_router)
app.include_router(reservas_router)
app.include_router(torneos_router)
app.include_router(turnos_router)

@app.get("/")
def root():
    return {"message": "Bienvenido a la API de Gestión de Canchas Deportivas"}
