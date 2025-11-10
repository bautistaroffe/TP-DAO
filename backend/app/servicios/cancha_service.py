from backend.app.dominio.cancha_futbol import CanchaFutbol
from backend.app.dominio.cancha_basquet import CanchaBasquet
from backend.app.dominio.cancha_padel import CanchaPadel
from backend.app.repositorios.cancha_repo import CanchaRepository
from backend.app.repositorios.reserva_repo import ReservaRepository


class CanchaService:
    def __init__(self):
        self.cancha_repo = CanchaRepository()
        self.reserva_repo = ReservaRepository()

    # ============================
    # VALIDACIONES
    # ============================
    def _validar_campos(self, nombre, precio_base):
        if not nombre or not nombre.strip():
            raise ValueError("El nombre de la cancha es obligatorio.")
        if precio_base is None or precio_base < 0:
            raise ValueError("El precio base debe ser un número positivo.")

    def _instanciar_cancha(self, tipo, **kwargs):
        """
        Crea una instancia del tipo de cancha correcto según el argumento 'tipo'.
        """
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
        """
        Crea una nueva cancha validando datos y tipo.
        """
        self._validar_campos(nombre, precio_base)
        cancha = self._instanciar_cancha(
            tipo=tipo,
            nombre=nombre.strip(),
            precio_base=precio_base,
            techada=techada,
            iluminacion=iluminacion,
            **extra
        )

        try:
            self.cancha_repo.agregar(cancha)
            self.cancha_repo.commit()
            return cancha
        except Exception:
            self.cancha_repo.rollback()
            raise
        finally:
            self.cancha_repo.cerrar()

    # ============================
    # OBTENER / LISTAR
    # ============================
    def listar_canchas(self):
        try:
            return self.cancha_repo.listar_todas()
        finally:
            self.cancha_repo.cerrar()

    def obtener_cancha_por_id(self, id_cancha):
        try:
            cancha = self.cancha_repo.obtener_por_id(id_cancha)
            if not cancha:
                raise ValueError("Cancha no encontrada.")
            return cancha
        finally:
            self.cancha_repo.cerrar()

    def obtener_canchas_por_tipo(self, tipo):
        try:
            return self.cancha_repo.obtener_por_tipo(tipo)
        finally:
            self.cancha_repo.cerrar()

    # ============================
    # ACTUALIZAR
    # ============================
    def actualizar_cancha(self, id_cancha, **datos_actualizados):
        """
        Actualiza una cancha existente. Solo campos válidos son modificados.
        """
        try:
            cancha = self.cancha_repo.obtener_por_id(id_cancha)
            if not cancha:
                raise ValueError("Cancha no encontrada.")

            # Validación básica
            if "precio_base" in datos_actualizados:
                if datos_actualizados["precio_base"] < 0:
                    raise ValueError("El precio base no puede ser negativo.")

            for campo, valor in datos_actualizados.items():
                if hasattr(cancha, campo):
                    setattr(cancha, campo, valor)

            self.cancha_repo.actualizar(cancha)
            self.cancha_repo.commit()
            return cancha

        except Exception:
            self.cancha_repo.rollback()
            raise
        finally:
            self.cancha_repo.cerrar()

    # ============================
    # ELIMINAR
    # ============================
    def eliminar_cancha(self, id_cancha):
        """
        Elimina una cancha solo si no tiene reservas activas o pendientes.
        """
        try:
            cancha = self.cancha_repo.obtener_por_id(id_cancha)
            if not cancha:
                raise ValueError("Cancha no encontrada.")

            reservas = self.reserva_repo.obtener_todos(
                "SELECT * FROM Reserva WHERE id_cancha=? AND estado IN ('pendiente', 'confirmada')",
                (id_cancha,)
            )

            if reservas:
                raise ValueError("No se puede eliminar la cancha porque tiene reservas activas o pendientes.")

            self.cancha_repo.eliminar(id_cancha)
            self.cancha_repo.commit()
            return {"mensaje": f"Cancha {id_cancha} eliminada correctamente."}

        except Exception:
            self.cancha_repo.rollback()
            raise
        finally:
            self.cancha_repo.cerrar()
            self.reserva_repo.cerrar()
