from pydantic import BaseModel, Field
from typing import Optional

class ServicioAdicionalDTO(BaseModel):
    id_servicio: Optional[int] = Field(None, description="Identificador del servicio adicional")
    cant_personas_asado: Optional[int] = Field(0, ge=0, description="Cantidad de personas para el servicio de asado")
    arbitro: Optional[bool] = Field(False, description="Indica si se incluye árbitro")
    partido_grabado: Optional[bool] = Field(False, description="Indica si el partido será grabado")
    pecheras: Optional[bool] = Field(False, description="Indica si se incluyen pecheras")
    cant_paletas: Optional[int] = Field(0, ge=0, description="Cantidad de paletas para pádel o tenis")

    class Config:
        orm_mode = True
