from fastapi import APIRouter, HTTPException
from backend.app.servicios.usuario_service import UsuarioService
from backend.app.dto.usuario_dto import UsuarioDTO

router = APIRouter(
    prefix="/usuarios",
    tags=["Usuarios"]
)

service = UsuarioService()


# ============================
# GET /usuarios
# ============================
@router.get("/", summary="Listar todos los usuarios")
def listar_usuarios():
    try:
        return service.listar_usuarios()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ============================
# GET /usuarios/{id_usuario}
# ============================

@router.get("/buscar", summary="Buscar un usuario por su DNI")
def buscar_usuario_por_dni(dni: str):
    """
    Busca un usuario por su DNI.
    Devuelve el usuario si lo encuentra, o un 404 si no existe.
    """
    try:
        # Llama al nuevo método del servicio
        usuario = service.obtener_usuario_por_dni(dni)

        if usuario is None:
            # Si el servicio devuelve None (usuario no encontrado), respondemos con 404.
            # Esto es clave para que el frontend (usuarioService.js) sepa que debe crear el usuario.
            raise HTTPException(status_code=404, detail="Usuario no encontrado con ese DNI")

        return usuario

    except HTTPException as e:
        # Re-lanzar 404 (si el service devolvió None)
        raise e
    except Exception as e:
        # Errores inesperados (DB, validación, etc.)
        raise HTTPException(status_code=500, detail=f"Error interno al buscar por DNI: {str(e)}")

@router.get("/{id_usuario}", summary="Obtener un usuario por su ID")
def obtener_usuario(id_usuario: int):
    try:
        usuario = service.obtener_usuario_por_id(id_usuario)
        if not usuario:
            raise HTTPException(status_code=404, detail="Usuario no encontrado")
        return usuario
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ============================
# POST /usuarios
# ============================
@router.post("/", summary="Crear un nuevo usuario")
def crear_usuario(usuario: UsuarioDTO):
    try:
        return service.crear_usuario(
            dni=usuario.dni,
            nombre=usuario.nombre,
            apellido=usuario.apellido,
            telefono=usuario.telefono,
            email=usuario.email,
            estado=usuario.estado
        )
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


# ============================
# PUT /usuarios/{id_usuario}
# ============================
@router.put("/{id_usuario}", summary="Actualizar un usuario existente")
def actualizar_usuario(id_usuario: int, usuario: UsuarioDTO):
    try:
        return service.actualizar_usuario(id_usuario, **usuario.dict(exclude_unset=True))
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


# ============================
# DELETE /usuarios/{id_usuario}
# ============================
@router.delete("/{id_usuario}", summary="Eliminar o inactivar un usuario")
def eliminar_usuario(id_usuario: int):
    try:
        return service.eliminar_usuario(id_usuario)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))



