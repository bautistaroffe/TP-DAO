from backend.app.dominio.servicio_adicional import ServicioAdicional
from backend.app.repositorios.adicional_repo import ServicioAdicionalRepository


class ServicioAdicionalService:
    # ============================
    # VALIDACIONES
    # ============================
    def _validar_campos(self, cant_personas_asado=None, arbitro=None,
                        partido_grabado=None, pecheras=None, cant_paletas=None):
        if cant_personas_asado is not None and cant_personas_asado < 0:
            raise ValueError("La cantidad de personas para el asado no puede ser negativa.")
        if cant_paletas is not None and cant_paletas < 0:
            raise ValueError("La cantidad de paletas no puede ser negativa.")
        # Se verifica que los booleanos solo sean True/False o None si no se proporcionan
        if arbitro not in (None, True, False):
            raise ValueError("El campo 'arbitro' debe ser True o False.")
        if partido_grabado not in (None, True, False):
            raise ValueError("El campo 'partido_grabado' debe ser True o False.")
        if pecheras not in (None, True, False):
            raise ValueError("El campo 'pecheras' debe ser True o False.")

    # ============================
    # CREAR SERVICIO (Atómica)
    # ============================
    def crear_servicio(self, cant_personas_asado=0, arbitro=False,
                       partido_grabado=False, pecheras=False, cant_paletas=0) -> ServicioAdicional:
        self._validar_campos(cant_personas_asado, arbitro, partido_grabado, pecheras, cant_paletas)

        servicio = ServicioAdicional(
            cant_personas_asado=cant_personas_asado,
            arbitro=arbitro,
            partido_grabado=partido_grabado,
            pecheras=pecheras,
            cant_paletas=cant_paletas
        )

        repo = ServicioAdicionalRepository()
        # repo.agregar es atómico
        repo.agregar(servicio)
        return servicio

    # ============================
    # OBTENER / LISTAR (Atómicas)
    # ============================
    def listar_servicios(self) -> list[ServicioAdicional]:
        repo = ServicioAdicionalRepository()
        # Lectura atómica
        return repo.listar_todos()

    def obtener_servicio_por_id(self, id_servicio) -> ServicioAdicional:
        repo = ServicioAdicionalRepository()
        # Lectura atómica
        servicio = repo.obtener_por_id(id_servicio)
        if not servicio:
            raise ValueError("Servicio adicional no encontrado.")
        return servicio

    # ============================
    # ACTUALIZAR (Atómica)
    # ============================
    def actualizar_servicio(self, id_servicio, **datos_actualizados) -> ServicioAdicional:
        repo = ServicioAdicionalRepository()

        # Lectura atómica
        servicio = repo.obtener_por_id(id_servicio)
        if not servicio:
            raise ValueError("Servicio adicional no encontrado.")

        # Validar campos antes de actualizar el objeto
        self._validar_campos(
            cant_personas_asado=datos_actualizados.get("cant_personas_asado", servicio.cant_personas_asado),
            arbitro=datos_actualizados.get("arbitro", servicio.arbitro),
            partido_grabado=datos_actualizados.get("partido_grabado", servicio.partido_grabado),
            pecheras=datos_actualizados.get("pecheras", servicio.pecheras),
            cant_paletas=datos_actualizados.get("cant_paletas", servicio.cant_paletas)
        )

        # Actualizar el objeto de dominio
        for campo, valor in datos_actualizados.items():
            if hasattr(servicio, campo):
                setattr(servicio, campo, valor)

        # Escritura atómica
        repo.actualizar(servicio)
        return servicio

    # ============================
    # ELIMINAR (Atómica)
    # ============================
    def eliminar_servicio(self, id_servicio):
        repo = ServicioAdicionalRepository()

        # Lectura atómica
        servicio = repo.obtener_por_id(id_servicio)
        if not servicio:
            raise ValueError("Servicio adicional no encontrado.")

        # Escritura atómica
        repo.eliminar(id_servicio)
        return {"mensaje": f"Servicio adicional {id_servicio} eliminado correctamente."}