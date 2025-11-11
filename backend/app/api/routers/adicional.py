from fastapi import APIRouter, HTTPException
from backend.app.servicios.adicional_service import ServicioAdicionalService
from backend.app.dto.adicional_dto import ServicioAdicionalDTO

router = APIRouter(
    prefix="/servicios-adicionales",
    tags=["Servicios Adicionales"]
)

service = ServicioAdicionalService()


# ============================
# GET /servicios-adicionales
# ============================
@router.get("/", summary="Listar todos los servicios adicionales")
def listar_servicios():
    try:
        return service.listar_servicios()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ============================
# GET /servicios-adicionales/{id_servicio}
# ============================
@router.get("/{id_servicio}", summary="Obtener un servicio adicional por su ID")
def obtener_servicio(id_servicio: int):
    try:
        servicio = service.obtener_servicio_por_id(id_servicio)
        if not servicio:
            raise HTTPException(status_code=404, detail="Servicio adicional no encontrado")
        return servicio
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ============================
# POST /servicios-adicionales
# ============================
@router.post("/", summary="Crear un nuevo servicio adicional")
def crear_servicio(servicio: ServicioAdicionalDTO):
    try:
        return service.crear_servicio(
            cant_personas_asado=servicio.cant_personas_asado,
            arbitro=servicio.arbitro,
            partido_grabado=servicio.partido_grabado,
            pecheras=servicio.pecheras,
            cant_paletas=servicio.cant_paletas
        )
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


# ============================
# PUT /servicios-adicionales/{id_servicio}
# ============================
@router.put("/{id_servicio}", summary="Actualizar un servicio adicional")
def actualizar_servicio(id_servicio: int, servicio: ServicioAdicionalDTO):
    try:
        return service.actualizar_servicio(id_servicio, **servicio.dict(exclude_unset=True))
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


# ============================
# DELETE /servicios-adicionales/{id_servicio}
# ============================
@router.delete("/{id_servicio}", summary="Eliminar un servicio adicional")
def eliminar_servicio(id_servicio: int):
    try:
        return service.eliminar_servicio(id_servicio)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
