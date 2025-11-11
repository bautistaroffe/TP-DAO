from fastapi import APIRouter, HTTPException
from backend.app.servicios.pagos_service import PagoService
from backend.app.dto.pago_dto import PagoDTO

router = APIRouter(
    prefix="/pagos",
    tags=["Pagos"]
)

service = PagoService()


# ============================
# GET /pagos
# ============================
@router.get("/", summary="Listar todos los pagos")
def listar_pagos():
    try:
        return service.listar_pagos()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error al listar pagos: {str(e)}")


# ============================
# GET /pagos/{id_pago}
# ============================
@router.get("/{id_pago}", summary="Obtener un pago por su ID")
def obtener_pago(id_pago: int):
    try:
        return service.obtener_pago_por_id(id_pago)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error al obtener pago: {str(e)}")


# ============================
# GET /pagos/reserva/{id_reserva}
# ============================
@router.get("/reserva/{id_reserva}", summary="Obtener pago asociado a una reserva")
def obtener_pago_por_reserva(id_reserva: int):
    try:
        return service.obtener_pago_por_reserva(id_reserva)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error al obtener pago por reserva: {str(e)}")


# ============================
# POST /pagos
# ============================
@router.post("/", summary="Procesar un nuevo pago")
def procesar_pago(pago: PagoDTO):
    try:
        return service.procesar_pago(
            id_usuario=pago.id_usuario,
            id_reserva=pago.id_reserva,
            monto=pago.monto,
            metodo=pago.metodo
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error al procesar pago: {str(e)}")


# ============================
# DELETE /pagos/{id_pago}
# ============================
@router.delete("/{id_pago}", summary="Eliminar un pago (si no está completado)")
def eliminar_pago(id_pago: int):
    try:
        return service.eliminar_pago(id_pago)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error al eliminar pago: {str(e)}")
