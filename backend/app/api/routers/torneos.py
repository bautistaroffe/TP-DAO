# backend/app/api/routers/torneos_router.py

from fastapi import APIRouter, HTTPException
from typing import List
from backend.app.dominio.torneo import Torneo
from backend.app.dto.torneo_dto import TorneoDTO

router = APIRouter(
    prefix="/torneos",
    tags=["Torneos"]
)

# === Crear Torneo ===
@router.post("/", response_model=TorneoDTO)
def crear_torneo(dto: TorneoDTO):
    try:
        torneo = Torneo(
            nombre=dto.nombre,
            categoria=dto.categoria,
            fecha_inicio=dto.fecha_inicio,
            fecha_fin=dto.fecha_fin,
            estado=dto.estado
        )
        torneo.guardar()
        return dto
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error al crear torneo: {str(e)}")


# === Listar todos ===
@router.get("/", response_model=List[TorneoDTO])
def listar_torneos():
    try:
        torneos = Torneo.listar_todos()
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


# === Obtener por ID ===
@router.get("/{id_torneo}", response_model=TorneoDTO)
def obtener_torneo(id_torneo: int):
    torneo = Torneo.obtener_por_id(id_torneo)
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


# === Actualizar ===
@router.put("/{id_torneo}", response_model=TorneoDTO)
def actualizar_torneo(id_torneo: int, dto: TorneoDTO):
    torneo = Torneo.obtener_por_id(id_torneo)
    if not torneo:
        raise HTTPException(status_code=404, detail=f"Torneo {id_torneo} no encontrado")

    try:
        torneo.nombre = dto.nombre
        torneo.categoria = dto.categoria
        torneo.fecha_inicio = dto.fecha_inicio
        torneo.fecha_fin = dto.fecha_fin
        torneo.estado = dto.estado
        torneo.guardar()
        return dto
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error al actualizar torneo: {str(e)}")


# === Eliminar ===
@router.delete("/{id_torneo}")
def eliminar_torneo(id_torneo: int):
    torneo = Torneo.obtener_por_id(id_torneo)
    if not torneo:
        raise HTTPException(status_code=404, detail=f"Torneo con ID {id_torneo} no encontrado")

    try:
        torneo.eliminar()
        return {"mensaje": f"Torneo {id_torneo} eliminado correctamente"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error al eliminar torneo: {str(e)}")
