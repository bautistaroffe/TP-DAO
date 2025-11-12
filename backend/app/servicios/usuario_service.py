import re

from backend.app.dominio.usuario import Usuario
from backend.app.repositorios.usuario_repo import UsuarioRepository
from backend.app.repositorios.reserva_repo import ReservaRepository
from backend.app.repositorios.pago_repo import PagoRepository
from backend.app.dto.usuario_dto import UsuarioDTO


class UsuarioService:
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
        try:
            # verificar duplicado
            existentes = [u for u in repo.listar_todos() if u.dni == dni]
            if existentes:
                raise ValueError("Ya existe un usuario con ese DNI.")

            repo.agregar(usuario)
            repo.commit()
            return usuario
        except Exception:
            repo.rollback()
            raise
        finally:
            repo.cerrar()

    # ============================
    # OBTENER / LISTAR
    # ============================
    def listar_usuarios(self) -> list[UsuarioDTO]:
        repo = UsuarioRepository()
        try:
            usuarios: list[Usuario] = repo.listar_todos()

            usuarios_dto: list[UsuarioDTO] = [
                self._mapear_a_dto(usuario)
                for usuario in usuarios if usuario
            ]
            return usuarios_dto
        finally:
            repo.cerrar()

    def obtener_usuario_por_id(self, id_usuario):
        repo = UsuarioRepository()
        try:
            usuario = repo.obtener_por_id(id_usuario)
            if not usuario:
                raise ValueError("Usuario no encontrado.")
            return usuario
        finally:
            repo.cerrar()

    # ============================
    # ACTUALIZAR USUARIO
    # ============================
    def actualizar_usuario(self, id_usuario, **datos_actualizados):
        repo = UsuarioRepository()
        try:
            usuario = repo.obtener_por_id(id_usuario)
            if not usuario:
                raise ValueError("Usuario no encontrado.")

            # Validar nuevos datos
            self._validar_campos(
                dni=datos_actualizados.get("dni", usuario.dni),
                nombre=datos_actualizados.get("nombre", usuario.nombre),
                apellido=datos_actualizados.get("apellido", usuario.apellido),
                email=datos_actualizados.get("email", usuario.email),
                telefono=datos_actualizados.get("telefono", usuario.telefono)
            )

            # Actualizar campos válidos
            for campo, valor in datos_actualizados.items():
                if hasattr(usuario, campo):
                    setattr(usuario, campo, valor)

            repo.actualizar(usuario)
            repo.commit()
            return usuario
        except Exception:
            repo.rollback()
            raise
        finally:
            repo.cerrar()

    # ============================
    # ELIMINAR USUARIO (segura)
    # ============================
    def eliminar_usuario(self, id_usuario):
        """
        Si el usuario tiene pagos o reservas asociadas:
            → No se elimina físicamente.
            → Se marca como inactivo y se informa.
        Si no tiene registros → se elimina.
        """
        repo_usuario = UsuarioRepository()
        repo_reserva = ReservaRepository()
        repo_pago = PagoRepository()

        try:
            usuario = repo_usuario.obtener_por_id(id_usuario)
            if not usuario:
                raise ValueError("Usuario no encontrado.")

            reservas = repo_reserva.obtener_todos(
                "SELECT * FROM Reserva WHERE id_cliente=?", (id_usuario,)
            )
            pagos = repo_pago.obtener_todos(
                "SELECT * FROM Pago WHERE id_usuario=?", (id_usuario,)
            )

            if reservas or pagos:
                usuario.estado = "inactivo"
                repo_usuario.actualizar(usuario)
                repo_usuario.commit()
                return {
                    "mensaje": f"Usuario {id_usuario} marcado como inactivo: tenía reservas o pagos asociados.",
                    "usuario": usuario.__dict__
                }

            repo_usuario.eliminar(id_usuario)
            repo_usuario.commit()
            return {"mensaje": f"Usuario {id_usuario} eliminado correctamente."}

        except Exception:
            repo_usuario.rollback()
            raise
        finally:
            repo_usuario.cerrar()
            repo_reserva.cerrar()
            repo_pago.cerrar()

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
