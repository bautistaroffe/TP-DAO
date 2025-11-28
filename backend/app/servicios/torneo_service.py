from datetime import date
from backend.app.dominio.torneo import Torneo
from backend.app.dominio.reserva import Reserva
from backend.app.dto.torneo_dto import TorneoDTO
from backend.app.dto.turno_dto import TurnoDTO
from backend.app.repositorios.torneo_repo import TorneoRepository
from backend.app.repositorios.reserva_repo import ReservaRepository
from backend.app.repositorios.turno_repo import TurnoRepository
from backend.app.repositorios.cancha_repo import CanchaRepository
from backend.app.repositorios.adicional_repo import ServicioAdicionalRepository


class TorneoService:
    # ============================
    # MAPEO
    # ============================
    def _mapear_a_dto(self, torneo: Torneo) -> TorneoDTO:
        data = {
            "id_torneo": torneo.id_torneo,
            "nombre": torneo.nombre,
            "categoria": torneo.categoria,
            "fecha_inicio": torneo.fecha_inicio,
            "fecha_fin": torneo.fecha_fin,
            "estado": torneo.estado
        }
        return TorneoDTO(**data)

    # ============================
    # VALIDACIONES
    # ============================
    def _validar_campos(self, nombre: str, fecha_inicio=None, fecha_fin=None):
        if not nombre or not nombre.strip():
            raise ValueError("El nombre del torneo es obligatorio.")
        if fecha_inicio and fecha_fin and fecha_inicio > fecha_fin:
            raise ValueError("La fecha de inicio no puede ser posterior a la fecha de fin.")

    # ---------- ABM Torneo (Operaciones atómicas por defecto) ----------
    def crear_torneo(self, nombre: str, categoria: str = None,
                     fecha_inicio: date = None, fecha_fin: date = None,
                     estado: str = "programado") -> TorneoDTO:
        self._validar_campos(nombre, fecha_inicio, fecha_fin)
        torneo = Torneo(
            nombre=nombre.strip(),
            categoria=categoria,
            fecha_inicio=fecha_inicio,
            fecha_fin=fecha_fin,
            estado=estado
        )
        repo = TorneoRepository()
        repo.agregar(torneo)
        return self._mapear_a_dto(torneo)

    def obtener_por_id(self, id_torneo) -> TorneoDTO:
        repo = TorneoRepository()
        torneo = repo.obtener_por_id(id_torneo)
        if not torneo:
            raise ValueError("Torneo no encontrado.")
        return self._mapear_a_dto(torneo)

    def listar_todos(self) -> list[TorneoDTO]:
        repo = TorneoRepository()
        torneos: list[Torneo] = repo.listar_todos()
        torneos_dto: list[TorneoDTO] = [
            self._mapear_a_dto(torneo)
            for torneo in torneos if torneo
        ]
        return torneos_dto

    def actualizar_torneo(self, torneo: Torneo) -> TorneoDTO:
        self._validar_campos(torneo.nombre, torneo.fecha_inicio, torneo.fecha_fin)
        repo = TorneoRepository()
        repo.actualizar(torneo)
        return self._mapear_a_dto(torneo)

    def eliminar_torneo(self, id_torneo):
        repo = TorneoRepository()
        repo.eliminar(id_torneo)
        return {"mensaje": f"Torneo {id_torneo} eliminado correctamente."}

    # ---------- CANCELAR TORNEO (Transacción) ----------
    def cancelar_torneo(self, id_torneo, cancelar_reservas=True) -> TorneoDTO:
        repo_torneo = TorneoRepository()
        repo_reserva = ReservaRepository()
        repo_turno = TurnoRepository()

        # Iniciar una transacción para asegurar que todas las cancelaciones sean atómicas
        repo_torneo.iniciar_transaccion()
        try:
            # 1. Obtener y verificar el torneo
            torneo = repo_torneo.obtener_por_id(id_torneo)
            if not torneo:
                raise ValueError("Torneo no encontrado.")

            # 2. Cancelar reservas asociadas
            if cancelar_reservas:
                # Nota: Las lecturas dentro de una transacción usan la misma conexión si no se cierran explícitamente.
                filas = repo_reserva.obtener_todos(
                    "SELECT * FROM Reserva WHERE id_torneo=? AND estado IN ('pendiente','confirmada')",
                    (id_torneo,)
                )
                for f in filas:
                    r = Reserva(**f)
                    r.estado = "cancelada"
                    repo_reserva.actualizar(r)
                    if r.id_turno:
                        repo_turno.marcar_como_disponible(r.id_turno)  # UPDATE de turno

            # 3. Cancelar el torneo
            torneo.estado = "cancelado"
            repo_torneo.actualizar(torneo)  # UPDATE de torneo

            # 4. Confirmar transacción
            repo_torneo.confirmar_transaccion()
            return self._mapear_a_dto(torneo)

        except Exception as e:
            # 5. Revertir transacción si hay un fallo
            repo_torneo.revertir_transaccion()
            raise e

    # ---------- HELPERS ----------
    def _turno_disponible(self, id_cancha, id_turno) -> bool:
        """Verifica si un turno específico en una cancha específica ya tiene una reserva activa."""
        repo_reserva = ReservaRepository()
        filas = repo_reserva.obtener_todos(
            "SELECT * FROM Reserva WHERE id_cancha=? AND id_turno=? AND estado IN ('pendiente', 'confirmada')",
            (id_cancha, id_turno)
        )
        return len(filas) == 0

    # ---------- RESERVAS DE TORNEO (Transacciones) ----------
    def crear_reserva_para_torneo(self, id_torneo, id_cancha, id_turno,
                                  id_cliente, id_servicio=None, origen="torneo") -> Reserva:
        # Se reutiliza la lógica del método de lote para la validación y creación.
        # Devuelve el objeto de dominio Reserva
        reservas_creadas = self.crear_reservas_para_torneo(id_torneo, [{
            "id_cancha": id_cancha,
            "id_turno": id_turno,
            "id_cliente": id_cliente,
            "id_servicio": id_servicio,
            "origen": origen
        }])
        return reservas_creadas[0]


    def cancelar_reserva_del_torneo(self, id_torneo, id_reserva):
        repo_reserva = ReservaRepository()
        repo_turno = TurnoRepository()

        # 1. Iniciar transacción
        repo_reserva.iniciar_transaccion()

        try:
            reserva = repo_reserva.obtener_por_id(id_reserva)
            if not reserva:
                raise ValueError("Reserva no encontrada.")
            if reserva.id_torneo != id_torneo:
                raise ValueError("La reserva no pertenece a este torneo.")
            if reserva.estado not in ("pendiente", "confirmada"):
                raise ValueError("Solo se pueden cancelar reservas pendientes o confirmadas.")

            reserva.estado = "cancelada"
            # Escrituras dentro de la transacción
            repo_reserva.actualizar(reserva)  # UPDATE de reserva
            if reserva.id_turno:
                repo_turno.marcar_como_disponible(reserva.id_turno)  # UPDATE de turno

            # 2. Confirmar transacción
            repo_reserva.confirmar_transaccion()
        except Exception as e:
            # 3. Revertir
            repo_reserva.revertir_transaccion()
            raise e

    def modificar_reserva_del_torneo(self, id_torneo, id_reserva,
                                     nuevo_id_turno=None, nuevo_id_servicio=None, nuevo_id_cliente=None) -> Reserva:
        repo_reserva = ReservaRepository()
        repo_turno = TurnoRepository()
        repo_cancha = CanchaRepository()
        repo_servicio = ServicioAdicionalRepository()

        # 1. Iniciar transacción
        repo_reserva.iniciar_transaccion()

        try:
            reserva = repo_reserva.obtener_por_id(id_reserva)
            if not reserva:
                raise ValueError("La reserva no existe.")
            if reserva.id_torneo != id_torneo:
                raise ValueError("La reserva no pertenece a este torneo.")
            if reserva.estado != "pendiente":
                raise ValueError("Solo se pueden modificar reservas pendientes.")

            # Cambiar turno
            if nuevo_id_turno and nuevo_id_turno != reserva.id_turno:
                # La disponibilidad se verifica con una lectura atómica (fuera de la transacción)
                if not self._turno_disponible(reserva.id_cancha, nuevo_id_turno):
                    raise ValueError("El nuevo turno no está disponible.")

                # Escrituras dentro de la transacción
                if reserva.id_turno:
                    repo_turno.marcar_como_disponible(reserva.id_turno)  # UPDATE turno viejo
                repo_turno.marcar_como_reservado(nuevo_id_turno)  # UPDATE turno nuevo
                reserva.id_turno = nuevo_id_turno

            # Cambiar servicio y cliente
            if nuevo_id_servicio is not None:
                reserva.id_servicio = nuevo_id_servicio
            if nuevo_id_cliente is not None:
                reserva.id_cliente = nuevo_id_cliente

            # Lecturas atómicas para recalcular costo
            cancha = repo_cancha.obtener_por_id(reserva.id_cancha)
            servicio = repo_servicio.obtener_por_id(reserva.id_servicio) if reserva.id_servicio else None
            reserva.calcular_costo_reserva(cancha, servicio)

            # Actualizar reserva dentro de la transacción
            repo_reserva.actualizar(reserva)

            # 2. Confirmar transacción
            repo_reserva.confirmar_transaccion()
            return reserva
        except Exception as e:
            # 3. Revertir
            repo_reserva.revertir_transaccion()
            raise e

    def crear_reservas_para_torneo(self, id_torneo, ids_canchas: list[int],
                                   fecha_inicio, fecha_fin,
                                   hora_inicio="00:00", hora_fin="23:59",
                                   id_cliente=None, id_servicio=None, origen="torneo") -> dict:
        """
        Crea reservas para un torneo usando los turnos disponibles dentro del rango de fechas y horas.
        Cada turno se reserva en su propia transacción para evitar bloqueos.
        Devuelve un dict con:
            - 'exitosas': lista de reservas creadas
            - 'fallidas': lista de dicts con turno y error
        """
        repo_reserva = ReservaRepository()
        repo_turno = TurnoRepository()

        # Obtener turnos disponibles
        turnos_disponibles = repo_turno.obtener_disponibles_en_rango_completo(
            fecha_inicio, fecha_fin, hora_inicio, hora_fin, ids_canchas
        )

        if not turnos_disponibles:
            raise ValueError(
                "No hay turnos disponibles en el rango indicado para las canchas seleccionadas."
            )

        exitosas = []
        fallidas = []

        for turno in turnos_disponibles:
            try:
                repo_reserva.iniciar_transaccion()  # abrir transacción por turno

                # Marcar turno como reservado
                repo_turno.marcar_como_reservado(turno.id_turno)

                # Crear reserva
                reserva = Reserva(
                    id_cancha=turno.id_cancha,
                    id_turno=turno.id_turno,
                    id_cliente=id_cliente,
                    id_torneo=id_torneo,
                    id_servicio=id_servicio,
                    precio_total=0,  # se puede calcular después
                    estado="pendiente",
                    origen=origen
                )
                reserva = repo_reserva.agregar(reserva)

                repo_reserva.confirmar_transaccion()  # commit por turno
                exitosas.append(reserva)

            except Exception as e:
                repo_reserva.revertir_transaccion()
                fallidas.append(
                    {"turno": turno.id_turno, "cancha": turno.id_cancha, "error": str(e)}
                )

        return {"exitosas": exitosas, "fallidas": fallidas}

