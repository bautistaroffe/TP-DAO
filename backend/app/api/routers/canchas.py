from fastapi import APIRouter, HTTPException
from backend.app.servicios.cancha_service import CanchaService

router = APIRouter(
    prefix="/canchas",
    tags=["Canchas"]
)

service = CanchaService()


# ============================
# GET /canchas
# ============================
@router.get("/", summary="Listar todas las canchas")
def listar_canchas():
    try:
        return service.listar_canchas()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ============================
# GET /canchas/{id_cancha}
# ============================
@router.get("/{id_cancha}", summary="Obtener una cancha por su ID")
def obtener_cancha(id_cancha: int):
    cancha = service.obtener_cancha_por_id(id_cancha)
    if not cancha:
        raise HTTPException(status_code=404, detail="Cancha no encontrada")
    return cancha


# ============================
# GET /canchas/tipo/{tipo}
# ============================
@router.get("/tipo/{tipo}", summary="Listar canchas por tipo")
def obtener_por_tipo(tipo: str):
    try:
        return service.obtener_canchas_por_tipo(tipo)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
