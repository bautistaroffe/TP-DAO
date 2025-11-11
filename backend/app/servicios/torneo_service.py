from datetime import date
from backend.app.dominio.torneo import Torneo
from backend.app.dominio.reserva import Reserva
from backend.app.repositorios.torneo_repo import TorneoRepository
from backend.app.repositorios.reserva_repo import ReservaRepository
from backend.app.repositorios.turno_repo import TurnoRepository
from backend.app.repositorios.cancha_repo import CanchaRepository
from backend.app.repositorios.adicional_repo import ServicioAdicionalRepository


class TorneoService:
    # ============================
    # VALIDACIONES
    # ============================
    def _validar_campos(self, nombre: str, fecha_inicio=None, fecha_fin=None):
        if not nombre or not nombre.strip():
            raise ValueError("El nombre del torneo es obligatorio.")
        if fecha_inicio and fecha_fin and fecha_inicio > fecha_fin:
            raise ValueError("La fecha de inicio no puede ser posterior a la fecha de fin.")

    # ---------- ABM Torneo ----------
    def crear_torneo(self, nombre: str, categoria: str = None,
                     fecha_inicio: date = None, fecha_fin: date = None,
                     estado: str = "programado") -> Torneo:
        self._validar_campos(nombre, fecha_inicio, fecha_fin)
        torneo = Torneo(
            nombre=nombre.strip(),
            categoria=categoria,
            fecha_inicio=fecha_inicio,
            fecha_fin=fecha_fin,
            estado=estado
        )

        repo = TorneoRepository()
        try:
            repo.agregar(torneo)
            repo.commit()
            return torneo
        except Exception:
            repo.rollback()
            raise
        finally:
            repo.cerrar()

    def obtener_por_id(self, id_torneo):
        repo = TorneoRepository()
        try:
            return repo.obtener_por_id(id_torneo)
        finally:
            repo.cerrar()

    def listar_todos(self):
        repo = TorneoRepository()
        try:
            return repo.listar_todos()
        finally:
            repo.cerrar()

    def actualizar_torneo(self, torneo: Torneo):
        self._validar_campos(torneo.nombre, torneo.fecha_inicio, torneo.fecha_fin)
        repo = TorneoRepository()
        try:
            repo.actualizar(torneo)
            repo.commit()
            return torneo
        except Exception:
            repo.rollback()
            raise
        finally:
            repo.cerrar()

    def eliminar_torneo(self, id_torneo):
        repo = TorneoRepository()
        try:
            repo.eliminar(id_torneo)
            repo.commit()
        except Exception:
            repo.rollback()
            raise
        finally:
            repo.cerrar()

    # ---------- CANCELAR TORNEO ----------
    def cancelar_torneo(self, id_torneo, cancelar_reservas=True):
        repo_torneo = TorneoRepository()
        repo_reserva = ReservaRepository()
        repo_turno = TurnoRepository()

        try:
            if cancelar_reservas:
                filas = repo_reserva.obtener_todos(
                    "SELECT * FROM Reserva WHERE id_torneo=? AND estado IN ('pendiente','confirmada')",
                    (id_torneo,)
                )
                for f in filas:
                    r = Reserva(**f)
                    r.estado = "cancelada"
                    repo_reserva.actualizar(r)
                    if r.id_turno:
                        repo_turno.marcar_como_disponible(r.id_turno)
                repo_reserva.commit()

            torneo = repo_torneo.obtener_por_id(id_torneo)
            if not torneo:
                raise ValueError("Torneo no encontrado.")
            torneo.estado = "cancelado"
            repo_torneo.actualizar(torneo)
            repo_torneo.commit()
            return torneo
        except Exception:
            repo_reserva.rollback()
            repo_torneo.rollback()
            raise
        finally:
            repo_reserva.cerrar()
            repo_turno.cerrar()
            repo_torneo.cerrar()

    # ---------- HELPERS ----------
    def _turno_disponible(self, id_cancha, id_turno, reserva_repo: ReservaRepository = None) -> bool:
        repo_local = False
        if reserva_repo is None:
            reserva_repo = ReservaRepository()
            repo_local = True
        try:
            filas = reserva_repo.obtener_todos(
                "SELECT * FROM Reserva WHERE id_cancha=? AND id_turno=? AND estado IN ('pendiente', 'confirmada')",
                (id_cancha, id_turno)
            )
            return len(filas) == 0
        finally:
            if repo_local:
                reserva_repo.cerrar()

    # ---------- RESERVAS DE TORNEO ----------
    def crear_reserva_para_torneo(self, id_torneo, id_cancha, id_turno,
                                  id_cliente, id_servicio=None, origen="torneo"):
        return self.crear_reservas_para_torneo(id_torneo, [{
            "id_cancha": id_cancha,
            "id_turno": id_turno,
            "id_cliente": id_cliente,
            "id_servicio": id_servicio,
            "origen": origen
        }])[0]

    def crear_reservas_para_torneo(self, id_torneo, reservas: list):
        repo_torneo = TorneoRepository()
        torneo = repo_torneo.obtener_por_id(id_torneo)
        repo_torneo.cerrar()

        if not torneo:
            raise ValueError("Torneo no encontrado.")

        repo_reserva = ReservaRepository()
        repo_turno = TurnoRepository()
        repo_cancha = CanchaRepository()
        repo_servicio = ServicioAdicionalRepository()

        creadas = []
        try:
            for r in reservas:
                id_cancha = r["id_cancha"]
                id_turno = r["id_turno"]
                id_cliente = r["id_cliente"]
                id_servicio = r.get("id_servicio")
                origen = r.get("origen", "torneo")

                if not self._turno_disponible(id_cancha, id_turno, repo_reserva):
                    raise ValueError(f"Turno {id_turno} en cancha {id_cancha} no disponible.")

                cancha = repo_cancha.obtener_por_id(id_cancha)
                servicio = repo_servicio.obtener_por_id(id_servicio) if id_servicio else None

                reserva = Reserva(
                    id_cancha=id_cancha,
                    id_turno=id_turno,
                    id_cliente=id_cliente,
                    id_torneo=id_torneo,
                    id_servicio=id_servicio,
                    estado="pendiente",
                    origen=origen
                )

                reserva.calcular_costo_reserva(cancha, servicio)
                repo_reserva.agregar(reserva)
                repo_turno.marcar_como_reservado(id_turno)

                creadas.append(reserva)

            repo_reserva.commit()
            return creadas
        except Exception:
            repo_reserva.rollback()
            raise
        finally:
            repo_reserva.cerrar()
            repo_turno.cerrar()
            repo_cancha.cerrar()
            repo_servicio.cerrar()

    def cancelar_reserva_del_torneo(self, id_torneo, id_reserva):
        repo_reserva = ReservaRepository()
        repo_turno = TurnoRepository()
        try:
            reserva = repo_reserva.obtener_por_id(id_reserva)
            if not reserva:
                raise ValueError("Reserva no encontrada.")
            if reserva.id_torneo != id_torneo:
                raise ValueError("La reserva no pertenece a este torneo.")
            if reserva.estado not in ("pendiente", "confirmada"):
                raise ValueError("Solo se pueden cancelar reservas pendientes o confirmadas.")

            reserva.estado = "cancelada"
            repo_reserva.actualizar(reserva)
            if reserva.id_turno:
                repo_turno.marcar_como_disponible(reserva.id_turno)
            repo_reserva.commit()
        except Exception:
            repo_reserva.rollback()
            raise
        finally:
            repo_reserva.cerrar()
            repo_turno.cerrar()

    def modificar_reserva_del_torneo(self, id_torneo, id_reserva,
                                     nuevo_id_turno=None, nuevo_id_servicio=None, nuevo_id_cliente=None):
        repo_reserva = ReservaRepository()
        repo_turno = TurnoRepository()
        repo_cancha = CanchaRepository()
        repo_servicio = ServicioAdicionalRepository()

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
                if not self._turno_disponible(reserva.id_cancha, nuevo_id_turno, repo_reserva):
                    raise ValueError("El nuevo turno no está disponible.")
                if reserva.id_turno:
                    repo_turno.marcar_como_disponible(reserva.id_turno)
                repo_turno.marcar_como_reservado(nuevo_id_turno)
                reserva.id_turno = nuevo_id_turno

            # Cambiar servicio y cliente
            if nuevo_id_servicio is not None:
                reserva.id_servicio = nuevo_id_servicio
            if nuevo_id_cliente is not None:
                reserva.id_cliente = nuevo_id_cliente

            cancha = repo_cancha.obtener_por_id(reserva.id_cancha)
            servicio = repo_servicio.obtener_por_id(reserva.id_servicio) if reserva.id_servicio else None
            reserva.calcular_costo_reserva(cancha, servicio)

            repo_reserva.actualizar(reserva)
            repo_reserva.commit()
            return reserva
        except Exception:
            repo_reserva.rollback()
            raise
        finally:
            repo_reserva.cerrar()
            repo_turno.cerrar()
            repo_cancha.cerrar()
            repo_servicio.cerrar()
