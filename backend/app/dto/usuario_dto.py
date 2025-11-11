from pydantic import BaseModel, Field, EmailStr
from typing import Optional

class UsuarioDTO(BaseModel):
    id_usuario: Optional[int] = Field(None, description="Identificador del usuario")
    dni: str = Field(..., description="Documento Nacional de Identidad del usuario")
    nombre: str = Field(..., description="Nombre del usuario")
    apellido: str = Field(..., description="Apellido del usuario")
    telefono: Optional[str] = Field(None, description="Número de teléfono del usuario")
    email: Optional[EmailStr] = Field(None, description="Correo electrónico del usuario")
    estado: Optional[str] = Field("activo", description="Estado actual del usuario (activo/inactivo)")

    class Config:
        orm_mode = True
