from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime

class PagoDTO(BaseModel):
    id_pago: Optional[int] = Field(None, description="Identificador del pago")
    id_usuario: int = Field(..., description="ID del usuario que realiza el pago")
    id_reserva: int = Field(..., description="ID de la reserva asociada al pago")
    monto: float = Field(..., gt=0, description="Monto total del pago en moneda local")
    fecha_pago: Optional[datetime] = Field(None, description="Fecha y hora del pago")
    metodo: str = Field(..., description="Método de pago (tarjeta, efectivo, transferencia, etc.)")
    estado_transaccion: Optional[str] = Field("pendiente", description="Estado de la transacción (pendiente, aprobado, rechazado)")

    class Config:
        orm_mode = True
