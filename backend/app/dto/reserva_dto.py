from pydantic import BaseModel, Field
from typing import Optional

class ReservaCreateRequest(BaseModel):
    id_cancha: int
    id_turno: int
    id_cliente: int
    id_torneo: Optional[int] = None
    id_servicio: Optional[int] = None


class ReservaUpdateRequest(BaseModel):
    nuevo_id_turno: Optional[int] = None
    nuevo_id_servicio: Optional[int] = None
    nuevo_id_cliente: Optional[int] = None

class ReservaDTO(BaseModel):
    id_reserva: Optional[int] = Field(None, description="Identificador único de la reserva")
    id_cancha: int = Field(..., description="ID de la cancha reservada")
    id_turno: int = Field(..., description="ID del turno reservado")
    id_cliente: int = Field(..., description="ID del cliente que hizo la reserva")
    id_torneo: Optional[int] = Field(None, description="ID del torneo asociado (si aplica)")
    id_servicio: Optional[int] = Field(None, description="ID del servicio adicional (si aplica)")
    precio_total: float = Field(..., description="Costo total de la reserva")
    estado: str = Field(..., description="Estado actual de la reserva (ej: pendiente, confirmada, cancelada)")
    origen: str = Field(..., description="Origen de la reserva (ej: online, torneo)")

    class Config:
        orm_mode = True