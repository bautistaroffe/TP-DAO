from pydantic import BaseModel, Field
from typing import Optional, Literal

class CanchaDTO(BaseModel):
    id_cancha: Optional[int] = Field(None, description="Identificador de la cancha")
    nombre: str = Field(..., description="Nombre de la cancha")
    tipo: Literal["futbol", "padel", "basquet"] = Field(..., description="Tipo de cancha")
    estado: Optional[str] = Field("disponible", description="Estado de la cancha")
    precio_base: float = Field(..., ge=0, description="Precio base de uso")
    techada: bool = Field(False, description="Indica si la cancha está techada")
    iluminacion: bool = Field(False, description="Indica si la cancha tiene iluminación")
    superficie: Optional[str] = Field(None, description="Tipo de superficie (césped, sintético, etc.)")
    tamaño: Optional[str] = Field(None, description="Tamaño o dimensiones de la cancha")

    class Config:
        orm_mode = True
