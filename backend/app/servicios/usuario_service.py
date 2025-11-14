import re

from backend.app.dominio.usuario import Usuario
from backend.app.repositorios.usuario_repo import UsuarioRepository
from backend.app.repositorios.reserva_repo import \
    ReservaRepository  # Asumiendo que ReservaRepository hereda de BaseRepository
from backend.app.repositorios.pago_repo import PagoRepository  # Asumiendo que PagoRepository hereda de BaseRepository
from backend.app.dto.usuario_dto import UsuarioDTO


class UsuarioService:

    # ============================
    # MAPEO
    # ============================
    def _mapear_a_dto(self, usuario: Usuario) -> UsuarioDTO:
        data = {
            "id_usuario": usuario.id_usuario,
            "dni": usuario.dni,
            "nombre": usuario.nombre,
            "apellido": usuario.apellido,
            "telefono": usuario.telefono,
            "email": usuario.email,
            "estado": usuario.estado
        }
        return UsuarioDTO(**data)

    # ============================
    # VALIDACIONES
    # ============================
    def _validar_campos(self, dni, nombre, apellido, email=None, telefono=None):
        if not dni or not str(dni).strip():
            raise ValueError("El DNI es obligatorio.")
        if not nombre or not nombre.strip():
            raise ValueError("El nombre es obligatorio.")
        if not apellido or not apellido.strip():
            raise ValueError("El apellido es obligatorio.")
        if email and not re.match(r"^[\w\.-]+@[\w\.-]+\.\w+$", email):
            raise ValueError("El correo electrónico no tiene un formato válido.")
        if telefono and not re.match(r"^[0-9\-\+\s]+$", telefono):
            raise ValueError("El número de teléfono contiene caracteres no válidos.")

    # ============================
    # CREAR USUARIO
    # ============================
    def crear_usuario(self, dni, nombre, apellido, telefono=None, email=None, estado="activo"):
        self._validar_campos(dni, nombre, apellido, email, telefono)

        usuario = Usuario(
            dni=dni.strip(),
            nombre=nombre.strip(),
            apellido=apellido.strip(),
            telefono=telefono.strip() if telefono else None,
            email=email.strip() if email else None,
            estado=estado
        )

        repo = UsuarioRepository()

        # Verificar duplicado (lectura atómica)
        # Nota: Idealmente, usar obtener_por_dni para mayor eficiencia.
        existentes = [u for u in repo.listar_todos() if u and str(u.dni) == str(dni)]
        if existentes:
            raise ValueError("Ya existe un usuario con ese DNI.")

        # Escribir (operación atómica)
        repo.agregar(usuario)
        return self._mapear_a_dto(usuario)

    # ============================
    # OBTENER / LISTAR
    # ============================
    def listar_usuarios(self) -> list[UsuarioDTO]:
        repo = UsuarioRepository()
        # Lectura atómica
        usuarios: list[Usuario] = repo.listar_todos()

        # Mapear a DTO
        usuarios_dto: list[UsuarioDTO] = [
            self._mapear_a_dto(usuario)
            for usuario in usuarios if usuario
        ]
        return usuarios_dto

    def obtener_usuario_por_id(self, id_usuario):
        repo = UsuarioRepository()
        # Lectura atómica
        usuario = repo.obtener_por_id(id_usuario)
        if not usuario:
            raise ValueError("Usuario no encontrado.")
        # Mapear a DTO
        return self._mapear_a_dto(usuario)

    # ============================
    # ACTUALIZAR USUARIO
    # ============================
    def actualizar_usuario(self, id_usuario, **datos_actualizados):
        repo = UsuarioRepository()

        # Lectura atómica
        usuario = repo.obtener_por_id(id_usuario)
        if not usuario:
            raise ValueError("Usuario no encontrado.")

        # Validar nuevos datos (usando valores actuales como fallback)
        self._validar_campos(
            dni=datos_actualizados.get("dni", usuario.dni),
            nombre=datos_actualizados.get("nombre", usuario.nombre),
            apellido=datos_actualizados.get("apellido", usuario.apellido),
            email=datos_actualizados.get("email", usuario.email),
            telefono=datos_actualizados.get("telefono", usuario.telefono)
        )

        # Actualizar campos válidos en el objeto de dominio
        for campo, valor in datos_actualizados.items():
            if hasattr(usuario, campo):
                setattr(usuario, campo, valor)

        # Escribir (operación atómica)
        repo.actualizar(usuario)
        # Mapear a DTO
        return self._mapear_a_dto(usuario)

    # ============================
    # ELIMINAR USUARIO (segura)
    # ============================
    def eliminar_usuario(self, id_usuario):
        """
        Si el usuario tiene pagos o reservas asociadas, se marca como inactivo.
        Si no tiene registros, se elimina.
        """
        repo_usuario = UsuarioRepository()
        repo_reserva = ReservaRepository()
        repo_pago = PagoRepository()

        # 1. Verificar existencia (lectura atómica)
        usuario = repo_usuario.obtener_por_id(id_usuario)
        if not usuario:
            raise ValueError("Usuario no encontrado.")

        # 2. Verificar dependencias (lecturas atómicas)
        reservas = repo_reserva.obtener_todos(
            "SELECT * FROM Reserva WHERE id_cliente=?", (id_usuario,)
        )
        pagos = repo_pago.obtener_todos(
            "SELECT * FROM Pago WHERE id_usuario=?", (id_usuario,)
        )

        if reservas or pagos:
            # 3. Marcar como inactivo (escritura atómica)
            usuario.estado = "inactivo"
            repo_usuario.actualizar(usuario)
            return {
                "mensaje": f"Usuario {id_usuario} marcado como inactivo: tenía reservas o pagos asociados.",
                # Mapear a DTO
                "usuario": self._mapear_a_dto(usuario)
            }

        # 4. Eliminar físicamente (escritura atómica)
        repo_usuario.eliminar(id_usuario)
        return {"mensaje": f"Usuario {id_usuario} eliminado correctamente."}

    def obtener_usuario_por_dni(self, dni: str):
        repo = UsuarioRepository()
        # Lectura atómica
        usuario = repo.obtener_por_dni(dni)

        # Si no se encuentra, NO lanzamos excepción; devolvemos None/null.
        # Esto es clave para que el frontend pueda manejar el caso "usuario no existe".
        if not usuario:
            return None  # Devolver None para indicar "no encontrado"

        # Mapear a DTO
        return self._mapear_a_dto(usuario)