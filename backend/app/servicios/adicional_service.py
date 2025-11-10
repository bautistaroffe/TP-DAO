from backend.app.dominio.servicio_adicional import ServicioAdicional
from backend.app.repositorios.adicional_repo import ServicioAdicionalRepository


class ServicioAdicionalService:
    def __init__(self):
        self.servicio_repo = ServicioAdicionalRepository()

    # ============================
    # VALIDACIONES
    # ============================
    def _validar_campos(self, cant_personas_asado=None, arbitro=None,
                        partido_grabado=None, pecheras=None, cant_paletas=None):
        if cant_personas_asado is not None and cant_personas_asado < 0:
            raise ValueError("La cantidad de personas para el asado no puede ser negativa.")
        if cant_paletas is not None and cant_paletas < 0:
            raise ValueError("La cantidad de paletas no puede ser negativa.")
        if arbitro not in (None, True, False):
            raise ValueError("El campo 'arbitro' debe ser True o False.")
        if partido_grabado not in (None, True, False):
            raise ValueError("El campo 'partido_grabado' debe ser True o False.")
        if pecheras not in (None, True, False):
            raise ValueError("El campo 'pecheras' debe ser True o False.")

    # ============================
    # CREAR SERVICIO
    # ============================
    def crear_servicio(self, cant_personas_asado=0, arbitro=False,
                       partido_grabado=False, pecheras=False, cant_paletas=0):
        self._validar_campos(cant_personas_asado, arbitro, partido_grabado, pecheras, cant_paletas)

        servicio = ServicioAdicional(
            cant_personas_asado=cant_personas_asado,
            arbitro=arbitro,
            partido_grabado=partido_grabado,
            pecheras=pecheras,
            cant_paletas=cant_paletas
        )

        try:
            self.servicio_repo.agregar(servicio)
            self.servicio_repo.commit()
            return servicio
        except Exception:
            self.servicio_repo.rollback()
            raise
        finally:
            self.servicio_repo.cerrar()

    # ============================
    # OBTENER / LISTAR
    # ============================
    def listar_servicios(self):
        try:
            return self.servicio_repo.listar_todos()
        finally:
            self.servicio_repo.cerrar()

    def obtener_servicio_por_id(self, id_servicio):
        try:
            servicio = self.servicio_repo.obtener_por_id(id_servicio)
            if not servicio:
                raise ValueError("Servicio adicional no encontrado.")
            return servicio
        finally:
            self.servicio_repo.cerrar()

    # ============================
    # ACTUALIZAR
    # ============================
    def actualizar_servicio(self, id_servicio, **datos_actualizados):
        try:
            servicio = self.servicio_repo.obtener_por_id(id_servicio)
            if not servicio:
                raise ValueError("Servicio adicional no encontrado.")

            self._validar_campos(
                cant_personas_asado=datos_actualizados.get("cant_personas_asado", servicio.cant_personas_asado),
                arbitro=datos_actualizados.get("arbitro", servicio.arbitro),
                partido_grabado=datos_actualizados.get("partido_grabado", servicio.partido_grabado),
                pecheras=datos_actualizados.get("pecheras", servicio.pecheras),
                cant_paletas=datos_actualizados.get("cant_paletas", servicio.cant_paletas)
            )

            for campo, valor in datos_actualizados.items():
                if hasattr(servicio, campo):
                    setattr(servicio, campo, valor)

            self.servicio_repo.actualizar(servicio)
            self.servicio_repo.commit()
            return servicio
        except Exception:
            self.servicio_repo.rollback()
            raise
        finally:
            self.servicio_repo.cerrar()

    # ============================
    # ELIMINAR
    # ============================
    def eliminar_servicio(self, id_servicio):
        """
        Elimina un servicio adicional si no está asociado a ninguna reserva activa.
        (La lógica de verificación se maneja en ReservaService antes de llamar a este método)
        """
        try:
            servicio = self.servicio_repo.obtener_por_id(id_servicio)
            if not servicio:
                raise ValueError("Servicio adicional no encontrado.")

            self.servicio_repo.eliminar(id_servicio)
            self.servicio_repo.commit()
            return {"mensaje": f"Servicio adicional {id_servicio} eliminado correctamente."}
        except Exception:
            self.servicio_repo.rollback()
            raise
        finally:
            self.servicio_repo.cerrar()
