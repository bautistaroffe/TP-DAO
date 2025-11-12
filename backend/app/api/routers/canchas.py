from fastapi import APIRouter, HTTPException
from typing import List
from backend.app.servicios.cancha_service import CanchaService
from backend.app.dto.cancha_dto import CanchaDTO  # Si ya lo tenés

router = APIRouter(
    prefix="/canchas",
    tags=["Canchas"]
)

service = CanchaService()


# ============================
# GET /canchas
# ============================
@router.get("/", summary="Listar todas las canchas", response_model=List[CanchaDTO])
def listar_canchas():
    try:
        return service.listar_canchas()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ============================
# GET /canchas/{id_cancha}
# ============================
@router.get("/{id_cancha}", summary="Obtener una cancha por su ID", response_model=CanchaDTO)
def obtener_cancha(id_cancha: int):
    try:
        return service.obtener_cancha_por_id(id_cancha)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ============================
# GET /canchas/tipo/{tipo}
# ============================
@router.get("/tipo/{tipo}", summary="Listar canchas por tipo", response_model=List[CanchaDTO])
def obtener_por_tipo(tipo: str):
    try:
        return service.obtener_canchas_por_tipo(tipo)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ============================
# POST /canchas
# ============================
@router.post("/", summary="Crear una nueva cancha", response_model=CanchaDTO)
def crear_cancha(dto: CanchaDTO):
    try:
        return service.crear_cancha(
            tipo=dto.tipo,
            nombre=dto.nombre,
            precio_base=dto.precio_base,
            techada=dto.techada,
            iluminacion=dto.iluminacion,
            superficie=dto.superficie,
            tamaño=dto.tamaño,
            estado=dto.estado
        )

    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ============================
# PUT /canchas/{id_cancha}
# ============================
@router.put("/{id_cancha}", summary="Actualizar una cancha", response_model=CanchaDTO)
def actualizar_cancha(id_cancha: int, dto: CanchaDTO):
    try:
        cancha_actualizada = service.actualizar_cancha(
            id_cancha,
            nombre=dto.nombre,
            tipo=dto.tipo,
            superficie=dto.superficie,
            tamaño=dto.tamaño,
            techada=dto.techada,
            iluminacion=dto.iluminacion,
            precio_base=dto.precio_base,
            estado=dto.estado
        )
        return cancha_actualizada
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ============================
# DELETE /canchas/{id_cancha}
# ============================
@router.delete("/{id_cancha}", summary="Eliminar una cancha")
def eliminar_cancha(id_cancha: int):
    try:
        return service.eliminar_cancha(id_cancha)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
