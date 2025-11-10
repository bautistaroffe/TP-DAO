from fastapi import FastAPI
from backend.app.api.routers.canchas import canchas

app = FastAPI(title="API de Gestión de Canchas Deportivas", version="1.0.0")

app.include_router(canchas.router)

@app.get("/")
def root():
    return {"message": "Bienvenido a la API de Gestión de Canchas Deportivas"}