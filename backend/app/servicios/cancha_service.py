from backend.app.dominio.cancha_futbol import CanchaFutbol
from backend.app.dominio.cancha_basquet import CanchaBasquet
from backend.app.dominio.cancha_padel import CanchaPadel
from backend.app.repositorios.cancha_repo import CanchaRepository
from backend.app.repositorios.reserva_repo import ReservaRepository


class CanchaService:

    # ============================
    # VALIDACIONES
    # ============================
    def _validar_campos(self, nombre, precio_base):
        if not nombre or not nombre.strip():
            raise ValueError("El nombre de la cancha es obligatorio.")
        if precio_base is None or precio_base < 0:
            raise ValueError("El precio base debe ser un número positivo.")

    def _instanciar_cancha(self, tipo, **kwargs):
        tipo = tipo.lower()
        if tipo == "futbol":
            return CanchaFutbol(**kwargs)
        elif tipo == "basquet":
            return CanchaBasquet(**kwargs)
        elif tipo == "padel":
            return CanchaPadel(**kwargs)
        else:
            raise ValueError(f"Tipo de cancha desconocido: {tipo}")

    # ============================
    # CREAR CANCHA
    # ============================
    def crear_cancha(self, tipo: str, nombre: str, precio_base: float, techada=False, iluminacion=False, **extra):
        self._validar_campos(nombre, precio_base)
        cancha = self._instanciar_cancha(
            tipo=tipo,
            nombre=nombre.strip(),
            precio_base=precio_base,
            techada=techada,
            iluminacion=iluminacion,
            **extra
        )

        repo = CanchaRepository()
        try:
            repo.agregar(cancha)
            repo.commit()
            return cancha
        except Exception:
            repo.rollback()
            raise
        finally:
            repo.cerrar()

    # ============================
    # OBTENER / LISTAR
    # ============================
    def listar_canchas(self):
        repo = CanchaRepository()
        try:
            return repo.listar_todas()
        finally:
            repo.cerrar()

    def obtener_cancha_por_id(self, id_cancha):
        repo = CanchaRepository()
        try:
            cancha = repo.obtener_por_id(id_cancha)
            if not cancha:
                raise ValueError("Cancha no encontrada.")
            return cancha
        finally:
            repo.cerrar()

    def obtener_canchas_por_tipo(self, tipo):
        repo = CanchaRepository()
        try:
            return repo.obtener_por_tipo(tipo)
        finally:
            repo.cerrar()

    # ============================
    # ACTUALIZAR
    # ============================
    def actualizar_cancha(self, id_cancha, **datos_actualizados):
        repo = CanchaRepository()
        try:
            cancha = repo.obtener_por_id(id_cancha)
            if not cancha:
                raise ValueError("Cancha no encontrada.")

            if "precio_base" in datos_actualizados and datos_actualizados["precio_base"] < 0:
                raise ValueError("El precio base no puede ser negativo.")

            for campo, valor in datos_actualizados.items():
                if hasattr(cancha, campo):
                    setattr(cancha, campo, valor)

            repo.actualizar(cancha)
            repo.commit()
            return cancha
        except Exception:
            repo.rollback()
            raise
        finally:
            repo.cerrar()

    # ============================
    # ELIMINAR
    # ============================
    def eliminar_cancha(self, id_cancha):
        repo_cancha = CanchaRepository()
        repo_reserva = ReservaRepository()
        try:
            cancha = repo_cancha.obtener_por_id(id_cancha)
            if not cancha:
                raise ValueError("Cancha no encontrada.")

            reservas = repo_reserva.obtener_todos(
                "SELECT * FROM Reserva WHERE id_cancha=? AND estado IN ('pendiente', 'confirmada')",
                (id_cancha,)
            )

            if reservas:
                raise ValueError("No se puede eliminar la cancha porque tiene reservas activas o pendientes.")

            repo_cancha.eliminar(id_cancha)
            repo_cancha.commit()
            return {"mensaje": f"Cancha {id_cancha} eliminada correctamente."}

        except Exception:
            repo_cancha.rollback()
            raise
        finally:
            repo_cancha.cerrar()
            repo_reserva.cerrar()
