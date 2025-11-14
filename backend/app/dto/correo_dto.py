from pydantic import BaseModel, Field
from typing import Optional


class ComprobanteRequest(BaseModel):
    """
    DTO para la solicitud de envío del comprobante de pago.
    Contiene todos los datos necesarios para generar el HTML del correo.
    """
    email_contacto: str = Field(..., description="Correo electrónico del destinatario.")
    id_reserva: int = Field(..., description="ID de la reserva.")
    # Datos de contenido requeridos por ServicioCorreo.generar_html_comprobante
    dia_reserva: str = Field(..., description="Fecha de la reserva (ej: '2025-11-14').")
    hora_turno: str = Field(..., description="Rango de hora del turno (ej: '20:00 - 21:00').")
    nombre_cancha: str = Field(..., description="Nombre de la cancha reservada.")
    monto_reserva: float = Field(..., description="Monto total pagado.")
    metodo_pago: str = Field(..., description="Método de pago utilizado.")
    nombre_usuario: str = Field(..., description="Nombre completo del usuario.")

    class Config:
        orm_mode = True