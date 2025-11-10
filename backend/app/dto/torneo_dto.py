
from pydantic import BaseModel, Field
from typing import Optional
from datetime import date

class TorneoDTO(BaseModel):
    id_torneo: Optional[int] = Field(None, description="Identificador del torneo")
    nombre: str = Field(..., description="Nombre del torneo")
    categoria: str = Field(..., description="Categoría del torneo (Ej: Libre, Senior, Femenino)")
    fecha_inicio: date = Field(..., description="Fecha de inicio del torneo")
    fecha_fin: date = Field(..., description="Fecha de finalización del torneo")
    estado: Optional[str] = Field("programado", description="Estado actual del torneo")

    class Config:
        orm_mode = True
