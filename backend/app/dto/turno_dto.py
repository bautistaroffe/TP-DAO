from pydantic import BaseModel, Field
from typing import Optional
from datetime import date, time

class TurnoDTO(BaseModel):
    id_turno: Optional[int] = Field(None, description="Identificador del turno")
    id_cancha: int = Field(..., description="ID de la cancha asociada al turno")
    fecha: date = Field(..., description="Fecha del turno (YYYY-MM-DD)")
    hora_inicio: time = Field(..., description="Hora de inicio del turno")
    hora_fin: time = Field(..., description="Hora de finalización del turno")
    estado: Optional[str] = Field("disponible", description="Estado actual del turno")

    class Config:
        orm_mode = True
