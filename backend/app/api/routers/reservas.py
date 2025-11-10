from fastapi import APIRouter, HTTPException
from backend.app.servicios.reserva_service import ReservaService
from backend.app.dto.reserva_dto import ReservaCreateRequest, ReservaUpdateRequest

router = APIRouter(
    prefix="/reservas",
    tags=["Reservas"]
)

reserva_service = ReservaService()

@router.post("/")
def crear_reserva(request: ReservaCreateRequest):
    try:
        reserva = reserva_service.crear_reserva(
            id_cancha=request.id_cancha,
            id_turno=request.id_turno,
            id_cliente=request.id_cliente,
            id_torneo=request.id_torneo,
            id_servicio=request.id_servicio
        )
        return {"mensaje": "Reserva creada con éxito", "reserva": reserva}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.put("/{id_reserva}")
def modificar_reserva(id_reserva: int, request: ReservaUpdateRequest):
    try:
        reserva = reserva_service.modificar_reserva(
            id_reserva=id_reserva,
            nuevo_id_turno=request.nuevo_id_turno,
            nuevo_id_servicio=request.nuevo_id_servicio,
            nuevo_id_cliente=request.nuevo_id_cliente
        )
        return {"mensaje": f"Reserva {id_reserva} modificada correctamente", "reserva": reserva}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
