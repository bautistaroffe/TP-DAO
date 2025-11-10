from pydantic import BaseModel
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
