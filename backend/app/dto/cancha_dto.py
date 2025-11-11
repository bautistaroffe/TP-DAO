from pydantic import BaseModel, Field
from typing import Optional

class CanchaDTO(BaseModel):
    id_cancha: Optional[int] = Field(None, description="Identificador de la cancha")
    nombre: str = Field(..., description="Nombre o descripción de la cancha")
    tipo: str = Field(..., description="Tipo de cancha (futbol, basquet, padel, etc.)")
    superficie: Optional[str] = Field(None, description="Tipo de superficie de la cancha (solo aplica a fútbol/pádel)")
    tamaño: Optional[str] = Field(None, description="Tamaño de la cancha (grande, mediana, etc.)")
    techada: Optional[bool] = Field(False, description="Indica si la cancha es techada")
    iluminacion: Optional[bool] = Field(False, description="Indica si la cancha posee iluminación")
    estado: Optional[str] = Field("disponible", description="Estado actual de la cancha")
    precio_base: float = Field(..., ge=0, description="Precio base de reserva de la cancha")

    class Config:
        orm_mode = True
