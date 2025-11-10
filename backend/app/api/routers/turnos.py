from fastapi import APIRouter, HTTPException
from backend.app.servicios.turno_service import TurnoService

router = APIRouter(
    prefix="/turnos",
    tags=["Turnos"]
)

service = TurnoService()


# ============================
# GET /turnos
# ============================
@router.get("/", summary="Listar todos los turnos")
def listar_turnos():
    try:
        return service.listar_turnos()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ============================
# GET /turnos/{id_turno}
# ============================
@router.get("/{id_turno}", summary="Obtener un turno por ID")
def obtener_turno(id_turno: int):
    turno = service.obtener_turno_por_id(id_turno)
    if not turno:
        raise HTTPException(status_code=404, detail="Turno no encontrado")
    return turno
