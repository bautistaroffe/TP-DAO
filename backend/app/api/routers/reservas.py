from fastapi import APIRouter, HTTPException
from backend.app.servicios.reserva_service import ReservaService
from backend.app.dto.reserva_dto import ReservaCreateRequest, ReservaUpdateRequest

router = APIRouter(
    prefix="/reservas",
    tags=["Reservas"]
)

service = ReservaService()


# ============================
# GET /reservas
# ============================
@router.get("/", summary="Listar todas las reservas")
def listar_reservas():
    try:
        return service.listar_reservas()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error al listar reservas: {str(e)}")


# ============================
# GET /reservas/{id_reserva}
# ============================
@router.get("/{id_reserva}", summary="Obtener una reserva por ID")
def obtener_reserva(id_reserva: int):
    try:
        return service.obtener_reserva_por_id(id_reserva)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error al obtener reserva: {str(e)}")


# ============================
# POST /reservas
# ============================
@router.post("/", summary="Crear una nueva reserva")
def crear_reserva(request: ReservaCreateRequest):
    try:
        return service.crear_reserva(
            id_cancha=request.id_cancha,
            id_turno=request.id_turno,
            id_cliente=request.id_cliente,
            id_torneo=request.id_torneo,
            id_servicio=request.id_servicio
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error al crear reserva: {str(e)}")


# ============================
# PUT /reservas/{id_reserva}
# ============================
@router.put("/{id_reserva}", summary="Modificar una reserva existente")
def modificar_reserva(id_reserva: int, request: ReservaUpdateRequest):
    try:
        return service.modificar_reserva(
            id_reserva=id_reserva,
            nuevo_id_turno=request.nuevo_id_turno,
            nuevo_id_servicio=request.nuevo_id_servicio,
            nuevo_id_cliente=request.nuevo_id_cliente
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error al modificar reserva: {str(e)}")


# ============================
# DELETE /reservas/{id_reserva}
# ============================
@router.delete("/{id_reserva}", summary="Cancelar (eliminar lógicamente) una reserva")
def cancelar_reserva(id_reserva: int):
    try:
        return service.cancelar_reserva(id_reserva)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error al cancelar reserva: {str(e)}")
