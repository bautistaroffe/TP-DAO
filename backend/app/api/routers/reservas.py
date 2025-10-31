from fastapi import APIRouter, HTTPException
from backend.app.servicios.reserva_service import ReservaService
from backend.app.dominio.reserva import Reserva

router = APIRouter(
    prefix="/reservas",
    tags=["Reservas"]
)

# Instancia del service
reserva_service = ReservaService()

# POST /reservas
@router.post("/")
def crear_reserva(id_cancha: int, id_turno: int, id_cliente: int, id_torneo: int = None, id_servicio: int = None):
    try:
        reserva = reserva_service.crear_reserva(
            id_cancha=id_cancha,
            id_turno=id_turno,
            id_cliente=id_cliente,
            id_torneo=id_torneo,
            id_servicio=id_servicio
        )
        return {"mensaje": "Reserva creada con éxito", "reserva": reserva}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

# PUT /reservas/{id_reserva}
@router.put("/{id_reserva}")
def modificar_reserva(id_reserva: int, nuevo_id_turno: int = None, nuevo_id_servicio: int = None, nuevo_id_cliente: int = None):
    try:
        reserva = reserva_service.modificar_reserva(
            id_reserva=id_reserva,
            nuevo_id_turno=nuevo_id_turno,
            nuevo_id_servicio=nuevo_id_servicio,
            nuevo_id_cliente=nuevo_id_cliente
        )
        return {"mensaje": f"Reserva {id_reserva} modificada correctamente", "reserva": reserva}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

# DELETE /reservas/{id_reserva}/cancelar
@router.delete("/{id_reserva}/cancelar")
def cancelar_reserva(id_reserva: int):
    try:
        reserva_service.cancelar_reserva(id_reserva)
        return {"mensaje": f"Reserva {id_reserva} cancelada correctamente"}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
