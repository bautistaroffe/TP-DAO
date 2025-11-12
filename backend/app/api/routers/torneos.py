from fastapi import APIRouter, HTTPException
from typing import List
from backend.app.servicios.torneo_service import TorneoService
from backend.app.dto.torneo_dto import TorneoDTO
from backend.app.dominio.torneo import Torneo

router = APIRouter(
    prefix="/torneos",
    tags=["Torneos"]
)

service = TorneoService()

# ============================
# POST /torneos/
# ============================
@router.post("/", response_model=TorneoDTO, summary="Crear un nuevo torneo")
def crear_torneo(dto: TorneoDTO):
    try:
        torneo = service.crear_torneo(
            nombre=dto.nombre,
            categoria=dto.categoria,
            fecha_inicio=dto.fecha_inicio,
            fecha_fin=dto.fecha_fin,
            estado=dto.estado
        )
        return TorneoDTO(
            id_torneo=torneo.id_torneo,
            nombre=torneo.nombre,
            categoria=torneo.categoria,
            fecha_inicio=torneo.fecha_inicio,
            fecha_fin=torneo.fecha_fin,
            estado=torneo.estado
        )
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error al crear torneo: {str(e)}")


# ============================
# GET /torneos/
# ============================
@router.get("/", response_model=List[TorneoDTO], summary="Listar todos los torneos")
def listar_todos():
    try:
        torneos = service.listar_todos()
        return [
            TorneoDTO(
                id_torneo=t.id_torneo,
                nombre=t.nombre,
                categoria=t.categoria,
                fecha_inicio=t.fecha_inicio,
                fecha_fin=t.fecha_fin,
                estado=t.estado
            ) for t in torneos
        ]
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error al listar torneos: {str(e)}")


# ============================
# GET /torneos/{id_torneo}
# ============================
@router.get("/{id_torneo}", response_model=TorneoDTO, summary="Obtener torneo por ID")
def obtener_torneo(id_torneo: int):
    try:
        torneo = service.obtener_por_id(id_torneo)
        if not torneo:
            raise HTTPException(status_code=404, detail=f"Torneo con ID {id_torneo} no encontrado")
        return TorneoDTO(
            id_torneo=torneo.id_torneo,
            nombre=torneo.nombre,
            categoria=torneo.categoria,
            fecha_inicio=torneo.fecha_inicio,
            fecha_fin=torneo.fecha_fin,
            estado=torneo.estado
        )
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error al obtener torneo: {str(e)}")


# ============================
# PUT /torneos/{id_torneo}
# ============================
@router.put("/{id_torneo}", response_model=TorneoDTO, summary="Actualizar torneo existente")
def actualizar_torneo(id_torneo: int, dto: TorneoDTO):
    try:
        torneo_existente = service.obtener_por_id(id_torneo)
        if not torneo_existente:
            raise HTTPException(status_code=404, detail=f"Torneo {id_torneo} no encontrado")

        torneo_actualizado = Torneo(
            id_torneo=id_torneo,
            nombre=dto.nombre,
            categoria=dto.categoria,
            fecha_inicio=dto.fecha_inicio,
            fecha_fin=dto.fecha_fin,
            estado=dto.estado
        )

        service.actualizar_torneo(torneo_actualizado)
        return dto
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error al actualizar torneo: {str(e)}")


# ============================
# DELETE /torneos/{id_torneo}
# ============================
@router.delete("/{id_torneo}", summary="Eliminar torneo por ID")
def eliminar_torneo(id_torneo: int):
    try:
        torneo = service.obtener_por_id(id_torneo)
        if not torneo:
            raise HTTPException(status_code=404, detail=f"Torneo con ID {id_torneo} no encontrado")

        service.eliminar_torneo(id_torneo)
        return {"mensaje": f"Torneo {id_torneo} eliminado correctamente"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error al eliminar torneo: {str(e)}")
