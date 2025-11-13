from backend.app.dominio.cancha_futbol import CanchaFutbol
from backend.app.dominio.cancha_basquet import CanchaBasquet
from backend.app.dominio.cancha_padel import CanchaPadel
# Nota: La ruta del repositorio debe ser correcta en tu proyecto
from backend.app.repositorios.cancha_repo import CanchaRepository
from backend.app.repositorios.reserva_repo import \
    ReservaRepository  # Asumiendo que ReservaRepository hereda de BaseRepository
from backend.app.dto.cancha_dto import CanchaDTO
from backend.app.dominio.cancha import Cancha


class CanchaService:

    # ============================
    # Mapeo y Validaciones
    # ============================

    def _validar_campos(self, nombre, precio_base):
        """Valida campos básicos de la cancha."""
        if not nombre or not nombre.strip():
            raise ValueError("El nombre de la cancha es obligatorio.")
        if precio_base is None or precio_base < 0:
            raise ValueError("El precio base debe ser un número positivo.")

    def _instanciar_cancha(self, tipo, **kwargs):
        """Instancia el objeto de dominio correcto según el tipo."""
        tipo = tipo.lower()
        if tipo == "futbol":
            return CanchaFutbol(**kwargs)
        elif tipo == "basquet":
            return CanchaBasquet(**kwargs)
        elif tipo == "padel":
            return CanchaPadel(**kwargs)
        else:
            raise ValueError(f"Tipo de cancha desconocido: {tipo}")

    def _mapear_a_dto(self, cancha: Cancha) -> CanchaDTO:
        """Convierte un objeto de dominio Cancha en un DTO."""
        data = {
            "id_cancha": cancha.id_cancha,
            "nombre": cancha.nombre,
            "tipo": cancha.tipo,
            "estado": cancha.estado,
            "precio_base": cancha.precio_base,
            "techada": cancha.techada,
            "iluminacion": cancha.iluminacion,
            "superficie": getattr(cancha, "superficie", None),
            "tamaño": getattr(cancha, "tamaño", None)
        }
        return CanchaDTO(**data)

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
        # El repo.agregar ya ejecuta el INSERT y hace el commit de forma atómica.
        repo.agregar(cancha)
        return self._mapear_a_dto(cancha)

    # ============================
    # OBTENER / LISTAR
    # ============================
    def listar_canchas(self):
        repo = CanchaRepository()
        # Retornamos DTOs para mantener la consistencia en el servicio
        canchas = repo.listar_todas()
        return [self._mapear_a_dto(c) for c in canchas if c]

    def obtener_cancha_por_id(self, id_cancha):
        repo = CanchaRepository()
        cancha = repo.obtener_por_id(id_cancha)
        if not cancha:
            raise ValueError("Cancha no encontrada.")
        return self._mapear_a_dto(cancha)

    def obtener_canchas_por_tipo(self, tipo):
        repo = CanchaRepository()
        # Retornamos DTOs para mantener la consistencia
        canchas = repo.obtener_por_tipo(tipo)
        return [self._mapear_a_dto(c) for c in canchas if c]

    # ============================
    # ACTUALIZAR
    # ============================
    def actualizar_cancha(self, id_cancha, **datos_actualizados):
        repo = CanchaRepository()

        cancha = repo.obtener_por_id(id_cancha)
        if not cancha:
            raise ValueError("Cancha no encontrada.")

        if "precio_base" in datos_actualizados and datos_actualizados["precio_base"] < 0:
            raise ValueError("El precio base no puede ser negativo.")

        for campo, valor in datos_actualizados.items():
            # Asignamos el valor solo si el atributo existe en la instancia de la cancha
            if hasattr(cancha, campo):
                setattr(cancha, campo, valor)

        # El repo.actualizar ya ejecuta el UPDATE y hace el commit de forma atómica.
        repo.actualizar(cancha)
        return self._mapear_a_dto(cancha)

    # ============================
    # ELIMINAR
    # ============================
    def eliminar_cancha(self, id_cancha):
        repo_cancha = CanchaRepository()
        repo_reserva = ReservaRepository()

        # 1. Verificar existencia
        cancha = repo_cancha.obtener_por_id(id_cancha)
        if not cancha:
            raise ValueError("Cancha no encontrada.")

        # 2. Verificar reservas activas/pendientes (lectura)
        reservas = repo_reserva.obtener_todos(
            "SELECT * FROM Reserva WHERE id_cancha=? AND estado IN ('pendiente', 'confirmada')",
            (id_cancha,)
        )

        if reservas:
            raise ValueError("No se puede eliminar la cancha porque tiene reservas activas o pendientes.")

        # 3. Eliminar (escritura atómica)
        repo_cancha.eliminar(id_cancha)

        return {"mensaje": f"Cancha {id_cancha} eliminada correctamente."}