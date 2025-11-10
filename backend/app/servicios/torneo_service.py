# python
from datetime import date

from backend.app.dominio.torneo import Torneo
from backend.app.dominio.reserva import Reserva
from backend.app.repositorios.torneo_repo import TorneoRepository
from backend.app.repositorios.reserva_repo import ReservaRepository
from backend.app.repositorios.turno_repo import TurnoRepository
from backend.app.repositorios.cancha_repo import CanchaRepository
from backend.app.repositorios.adicional_repo import ServicioAdicionalRepository


class TorneoService:
    def __init__(self):
        self.torneo_repo = TorneoRepository()

    def _validar_campos(self, nombre: str, fecha_inicio=None, fecha_fin=None):
        if not nombre or not nombre.strip():
            raise ValueError("El nombre del torneo es obligatorio.")
        if fecha_inicio and fecha_fin and fecha_inicio > fecha_fin:
            raise ValueError("La fecha de inicio no puede ser posterior a la fecha de fin.")

    # ---------- ABM Torneo ----------
    def crear_torneo(self, nombre: str, categoria: str = None, fecha_inicio: date = None, fecha_fin: date = None, estado: str = "programado") -> Torneo:
        self._validar_campos(nombre, fecha_inicio, fecha_fin)
        torneo = Torneo(
            nombre=nombre.strip(),
            categoria=categoria,
            fecha_inicio=fecha_inicio,
            fecha_fin=fecha_fin,
            estado=estado
        )
        try:
            self.torneo_repo.agregar(torneo)
            self.torneo_repo.commit()
            return torneo
        except Exception:
            self.torneo_repo.rollback()
            raise
        finally:
            self.torneo_repo.cerrar()

    def obtener_por_id(self, id_torneo):
        try:
            return self.torneo_repo.obtener_por_id(id_torneo)
        finally:
            self.torneo_repo.cerrar()

    def listar_todos(self):
        try:
            return self.torneo_repo.listar_todos()
        finally:
            self.torneo_repo.cerrar()

    def actualizar_torneo(self, torneo: Torneo):
        self._validar_campos(torneo.nombre, torneo.fecha_inicio, torneo.fecha_fin)
        try:
            self.torneo_repo.actualizar(torneo)
            self.torneo_repo.commit()
            return torneo
        except Exception:
            self.torneo_repo.rollback()
            raise
        finally:
            self.torneo_repo.cerrar()

    def eliminar_torneo(self, id_torneo):
        try:
            self.torneo_repo.eliminar(id_torneo)
            self.torneo_repo.commit()
        except Exception:
            self.torneo_repo.rollback()
            raise
        finally:
            self.torneo_repo.cerrar()

    def cancelar_torneo(self, id_torneo, cancelar_reservas=True):
        """
        Marca el torneo como 'cancelado'. Si cancelar_reservas=True,
        también cancela reservas pendientes/confirmadas asociadas y libera turnos.
        """
        reserva_repo = ReservaRepository()
        turno_repo = TurnoRepository()
        try:
            if cancelar_reservas:
                filas = reserva_repo.obtener_todos(
                    "SELECT * FROM Reserva WHERE id_torneo=? AND estado IN ('pendiente','confirmada')",
                    (id_torneo,)
                )
                for f in filas:
                    # obtener objeto Reserva para actualizar
                    r = Reserva(**f)
                    r.estado = "cancelada"
                    reserva_repo.actualizar(r)
                    # liberar turno asociado
                    if r.id_turno:
                        turno_repo.marcar_como_disponible(r.id_turno)
                reserva_repo.commit()

            # actualizar torneo
            torneo = self.torneo_repo.obtener_por_id(id_torneo)
            if not torneo:
                raise ValueError("Torneo no encontrado.")
            torneo.estado = "cancelado"
            self.torneo_repo.actualizar(torneo)
            self.torneo_repo.commit()
            return torneo
        except Exception:
            reserva_repo.rollback()
            self.torneo_repo.rollback()
            raise
        finally:
            reserva_repo.cerrar()
            turno_repo.cerrar()
            self.torneo_repo.cerrar()

    # ---------- Helpers de disponibilidad ----------
    def _turno_disponible(self, id_cancha, id_turno, reserva_repo: ReservaRepository = None) -> bool:
        repo_local = False
        if reserva_repo is None:
            reserva_repo = ReservaRepository()
            repo_local = True
        filas = reserva_repo.obtener_todos(
            "SELECT * FROM Reserva WHERE id_cancha=? AND id_turno=? AND estado IN ('pendiente', 'confirmada')",
            (id_cancha, id_turno)
        )
        if repo_local:
            reserva_repo.cerrar()
        return len(filas) == 0

    # ---------- Operaciones sobre reservas asociadas al torneo ----------
    def crear_reserva_para_torneo(self, id_torneo, id_cancha, id_turno, id_cliente, id_servicio=None, origen="torneo"):
        """
        Crea una única reserva (por un turno) asociada al torneo.
        """
        return self.crear_reservas_para_torneo(id_torneo, [{
            "id_cancha": id_cancha,
            "id_turno": id_turno,
            "id_cliente": id_cliente,
            "id_servicio": id_servicio,
            "origen": origen
        }])[0]

    def crear_reservas_para_torneo(self, id_torneo, reservas: list):
        """
        Crea múltiples reservas en una sola transacción.
        Cada elemento de 'reservas' es un dict con:
          - id_cancha (obligatorio)
          - id_turno (obligatorio)
          - id_cliente (obligatorio)
          - id_servicio (opcional)
          - origen (opcional)
        Devuelve la lista de objetos Reserva creados.
        """
        # validar torneo
        torneo = self.torneo_repo.obtener_por_id(id_torneo)
        self.torneo_repo.cerrar()
        if not torneo:
            raise ValueError("Torneo no encontrado.")

        reserva_repo = ReservaRepository()
        turno_repo = TurnoRepository()
        cancha_repo = CanchaRepository()
        servicio_repo = ServicioAdicionalRepository()

        creadas = []
        try:
            for r in reservas:
                id_cancha = r["id_cancha"]
                id_turno = r["id_turno"]
                id_cliente = r["id_cliente"]
                id_servicio = r.get("id_servicio")
                origen = r.get("origen", "torneo")

                if not self._turno_disponible(id_cancha, id_turno, reserva_repo):
                    raise ValueError(f"Turno {id_turno} en cancha {id_cancha} no disponible.")

                cancha = cancha_repo.obtener_por_id(id_cancha)
                servicio = servicio_repo.obtener_por_id(id_servicio) if id_servicio else None

                reserva = Reserva(
                    id_cancha=id_cancha,
                    id_turno=id_turno,
                    id_cliente=id_cliente,
                    id_torneo=id_torneo,
                    id_servicio=id_servicio,
                    estado="pendiente",
                    origen=origen
                )

                # calcular costo por turno (mismo que ReservaService)
                reserva.calcular_costo_reserva(cancha, servicio)

                reserva_repo.agregar(reserva)
                turno_repo.marcar_como_reservado(id_turno)

                creadas.append(reserva)

            reserva_repo.commit()
            return creadas
        except Exception:
            reserva_repo.rollback()
            raise
        finally:
            reserva_repo.cerrar()
            turno_repo.cerrar()
            cancha_repo.cerrar()
            servicio_repo.cerrar()

    def cancelar_reserva_del_torneo(self, id_torneo, id_reserva):
        reserva_repo = ReservaRepository()
        turno_repo = TurnoRepository()
        try:
            reserva = reserva_repo.obtener_por_id(id_reserva)
            if not reserva:
                raise ValueError("Reserva no encontrada.")
            if reserva.id_torneo != id_torneo:
                raise ValueError("La reserva no pertenece a este torneo.")
            if reserva.estado not in ("pendiente", "confirmada"):
                raise ValueError("Solo se pueden cancelar reservas pendientes o confirmadas.")

            reserva.estado = "cancelada"
            reserva_repo.actualizar(reserva)
            # liberar turno asociado
            if reserva.id_turno:
                turno_repo.marcar_como_disponible(reserva.id_turno)
            reserva_repo.commit()
        except Exception:
            reserva_repo.rollback()
            raise
        finally:
            reserva_repo.cerrar()
            turno_repo.cerrar()

    def modificar_reserva_del_torneo(self, id_torneo, id_reserva, nuevo_id_turno=None, nuevo_id_servicio=None, nuevo_id_cliente=None):
        """
        Modifica una reserva (una por turno) asociada al torneo. Solo 'pendiente' se puede modificar.
        """
        reserva_repo = ReservaRepository()
        turno_repo = TurnoRepository()
        cancha_repo = CanchaRepository()
        servicio_repo = ServicioAdicionalRepository()

        try:
            reserva = reserva_repo.obtener_por_id(id_reserva)
            if not reserva:
                raise ValueError("La reserva no existe.")
            if reserva.id_torneo != id_torneo:
                raise ValueError("La reserva no pertenece a este torneo.")
            if reserva.estado != "pendiente":
                raise ValueError("Solo se pueden modificar reservas pendientes.")

            # cambiar turno
            if nuevo_id_turno and nuevo_id_turno != reserva.id_turno:
                if not self._turno_disponible(reserva.id_cancha, nuevo_id_turno, reserva_repo):
                    raise ValueError("El nuevo turno no está disponible.")
                if reserva.id_turno:
                    turno_repo.marcar_como_disponible(reserva.id_turno)
                turno_repo.marcar_como_reservado(nuevo_id_turno)
                reserva.id_turno = nuevo_id_turno

            # servicio y cliente
            if nuevo_id_servicio is not None:
                reserva.id_servicio = nuevo_id_servicio
            if nuevo_id_cliente is not None:
                reserva.id_cliente = nuevo_id_cliente

            cancha = cancha_repo.obtener_por_id(reserva.id_cancha)
            servicio = servicio_repo.obtener_por_id(reserva.id_servicio) if reserva.id_servicio else None
            reserva.calcular_costo_reserva(cancha, servicio)

            reserva_repo.actualizar(reserva)
            reserva_repo.commit()
            return reserva
        except Exception:
            reserva_repo.rollback()
            raise
        finally:
            reserva_repo.cerrar()
            turno_repo.cerrar()
            cancha_repo.cerrar()
            servicio_repo.cerrar()

