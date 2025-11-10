from fastapi import APIRouter, HTTPException
from backend.app.servicios.cancha_service import CanchaService
from backend.app.dominio.cancha import Cancha

router = APIRouter(
    prefix="/canchas",
    tags=["Canchas"]
)

# Instancia del service
cancha_service = CanchaService()

# GET /canchas
@router.get("/")
def listar_canchas():
    canchas = cancha_service.listar_canchas()
    return canchas

# GET /canchas/tipo/{tipo}
@router.get("/tipo/{tipo}")
def obtener_por_tipo(tipo: str):
    canchas = cancha_service.obtener_canchas_por_tipo(tipo)
    return canchas

# GET /canchas/{id_cancha}
@router.get("/{id_cancha}")
def obtener_cancha(id_cancha: int):
    cancha = cancha_service.obtener_cancha_por_id(id_cancha)
    if not cancha:
        raise HTTPException(status_code=404, detail="Cancha no encontrada")
    return cancha




# POST /canchas
@router.post("/")
def agregar_cancha(cancha: Cancha):
    nueva_cancha = cancha_service.agregar_cancha(cancha)
    return {"mensaje": "Cancha agregada con éxito", "cancha": nueva_cancha}


# PUT /canchas/{id_cancha}
@router.put("/{id_cancha}")
def actualizar_cancha(id_cancha: int, cancha: Cancha):
    cancha_existente = cancha_service.obtener_cancha_por_id(id_cancha)
    if not cancha_existente:
        raise HTTPException(status_code=404, detail="Cancha no encontrada")
    if cancha.id_cancha != id_cancha:
        raise HTTPException(status_code=400, detail="El ID de la cancha no coincide con el ID de la ruta")
    cancha_service.actualizar_cancha(cancha)
    return {"mensaje": f"Cancha {id_cancha} actualizada correctamente"}


# DELETE /canchas/{id_cancha}
@router.delete("/{id_cancha}")
def eliminar_cancha(id_cancha: int):
    cancha_existente = cancha_service.obtener_cancha_por_id(id_cancha)
    if not cancha_existente:
        raise HTTPException(status_code=404, detail="Cancha no encontrada")
    cancha_service.eliminar_cancha(id_cancha)
    return {"mensaje": f"Cancha {id_cancha} eliminada correctamente"}
