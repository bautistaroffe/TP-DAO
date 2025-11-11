from fastapi import APIRouter, HTTPException
from datetime import date, time
from backend.app.servicios.turno_service import TurnoService
from backend.app.dto.turno_dto import TurnoDTO

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
        raise HTTPException(status_code=500, detail=f"Error al listar turnos: {str(e)}")


# ============================
# GET /turnos/{id_turno}
# ============================
@router.get("/{id_turno}", summary="Obtener un turno por ID")
def obtener_turno(id_turno: int):
    try:
        return service.obtener_turno_por_id(id_turno)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error al obtener turno: {str(e)}")


# ============================
# POST /turnos
# ============================
@router.post("/", summary="Crear un nuevo turno")
def crear_turno(turno: TurnoDTO):
    try:
        return service.crear_turno(
            id_cancha=turno.id_cancha,
            fecha=turno.fecha,
            hora_inicio=turno.hora_inicio,
            hora_fin=turno.hora_fin,
            estado=turno.estado
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error al crear turno: {str(e)}")


# ============================
# PUT /turnos/{id_turno}
# ============================
@router.put("/{id_turno}", summary="Actualizar un turno existente")
def actualizar_turno(id_turno: int, turno: TurnoDTO):
    try:
        return service.actualizar_turno(
            id_turno,
            fecha=turno.fecha,
            hora_inicio=turno.hora_inicio,
            hora_fin=turno.hora_fin,
            estado=turno.estado
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error al actualizar turno: {str(e)}")


# ============================
# DELETE /turnos/{id_turno}
# ============================
@router.delete("/{id_turno}", summary="Eliminar un turno")
def eliminar_turno(id_turno: int):
    try:
        return service.eliminar_turno(id_turno)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error al eliminar turno: {str(e)}")
