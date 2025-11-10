import re
from backend.app.dominio.usuario import Usuario
from backend.app.repositorios.usuario_repo import UsuarioRepository
from backend.app.repositorios.reserva_repo import ReservaRepository
from backend.app.repositorios.pago_repo import PagoRepository


class UsuarioService:
    def __init__(self):
        self.usuario_repo = UsuarioRepository()
        self.reserva_repo = ReservaRepository()
        self.pago_repo = PagoRepository()

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

        try:
            # verificar duplicado
            existentes = [u for u in self.usuario_repo.listar_todos() if u.dni == dni]
            if existentes:
                raise ValueError("Ya existe un usuario con ese DNI.")

            self.usuario_repo.agregar(usuario)
            self.usuario_repo.commit()
            return usuario
        except Exception:
            self.usuario_repo.rollback()
            raise
        finally:
            self.usuario_repo.cerrar()

    # ============================
    # OBTENER / LISTAR
    # ============================
    def listar_usuarios(self):
        try:
            return self.usuario_repo.listar_todos()
        finally:
            self.usuario_repo.cerrar()

    def obtener_usuario_por_id(self, id_usuario):
        try:
            usuario = self.usuario_repo.obtener_por_id(id_usuario)
            if not usuario:
                raise ValueError("Usuario no encontrado.")
            return usuario
        finally:
            self.usuario_repo.cerrar()

    # ============================
    # ACTUALIZAR USUARIO
    # ============================
    def actualizar_usuario(self, id_usuario, **datos_actualizados):
        try:
            usuario = self.usuario_repo.obtener_por_id(id_usuario)
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

            self.usuario_repo.actualizar(usuario)
            self.usuario_repo.commit()
            return usuario
        except Exception:
            self.usuario_repo.rollback()
            raise
        finally:
            self.usuario_repo.cerrar()

    # ============================
    # ELIMINAR USUARIO (Opción 1)
    # ============================
    def eliminar_usuario(self, id_usuario):
        """
        Opción 1 — Si el usuario tiene pagos o reservas asociadas:
            → No se elimina.
            → Se marca como inactivo y se notifica el motivo.
        Si no tiene registros → se elimina físicamente.
        """
        try:
            usuario = self.usuario_repo.obtener_por_id(id_usuario)
            if not usuario:
                raise ValueError("Usuario no encontrado.")

            reservas = self.reserva_repo.obtener_todos(
                "SELECT * FROM Reserva WHERE id_cliente=?", (id_usuario,)
            )
            pagos = self.pago_repo.obtener_todos(
                "SELECT * FROM Pago WHERE id_usuario=?", (id_usuario,)
            )

            if reservas or pagos:
                usuario.estado = "inactivo"
                self.usuario_repo.actualizar(usuario)
                self.usuario_repo.commit()
                return {
                    "mensaje": f"Usuario {id_usuario} marcado como inactivo: tenía reservas o pagos asociados.",
                    "usuario": usuario.__dict__
                }

            # Eliminación física si no tiene relaciones
            self.usuario_repo.eliminar(id_usuario)
            self.usuario_repo.commit()
            return {"mensaje": f"Usuario {id_usuario} eliminado correctamente."}

        except Exception:
            self.usuario_repo.rollback()
            raise
        finally:
            self.usuario_repo.cerrar()
            self.reserva_repo.cerrar()
            self.pago_repo.cerrar()
