from datetime import date, time
from backend.app.dominio.turno import Turno
from backend.app.dto.turno_dto import TurnoDTO
from backend.app.repositorios.turno_repo import TurnoRepository
from backend.app.repositorios.cancha_repo import CanchaRepository
from backend.app.repositorios.reserva_repo import ReservaRepository


class TurnoService:

    # ============================
    # VALIDACIONES
    # ============================
    def _validar_campos(self, id_cancha, fecha, hora_inicio, hora_fin):
        if not id_cancha:
            raise ValueError("El campo 'id_cancha' es obligatorio.")
        if not fecha:
            raise ValueError("Debe especificarse una fecha.")
        if not (hora_inicio and hora_fin):
            raise ValueError("Debe indicar hora de inicio y hora de fin.")
        if hora_inicio >= hora_fin:
            raise ValueError("La hora de inicio debe ser anterior a la hora de fin.")
        # validar que la cancha exista
        repo_cancha = CanchaRepository()
        try:
            cancha = repo_cancha.obtener_por_id(id_cancha)
            if not cancha:
                raise ValueError("La cancha especificada no existe.")
        finally:
            repo_cancha.cerrar()

    def _turno_disponible(self, id_cancha, fecha, hora_inicio, hora_fin):
        repo_turno = TurnoRepository()
        try:
            turnos = repo_turno.listar_todos()
        finally:
            repo_turno.cerrar()

        for t in turnos:
            if t.id_cancha == id_cancha and t.fecha == fecha:
                if not (hora_fin <= t.hora_inicio or hora_inicio >= t.hora_fin):
                    return False
        return True

    # ============================
    # CREAR
    # ============================
    def crear_turno(self, id_cancha: int, fecha: date, hora_inicio: time, hora_fin: time, estado="disponible"):
        self._validar_campos(id_cancha, fecha, hora_inicio, hora_fin)
        if not self._turno_disponible(id_cancha, fecha, hora_inicio, hora_fin):
            raise ValueError("Ya existe un turno que se superpone en ese horario para la misma cancha.")

        turno = Turno(
            id_cancha=id_cancha,
            fecha=fecha,
            hora_inicio=hora_inicio,
            hora_fin=hora_fin,
            estado=estado
        )

        repo = TurnoRepository()
        try:
            repo.agregar(turno)
            repo.commit()
            return turno
        except Exception:
            repo.rollback()
            raise
        finally:
            repo.cerrar()

    # ============================
    # OBTENER / LISTAR
    # ============================
    def listar_turnos(self) -> list[TurnoDTO]:
        repo = TurnoRepository()
        try:
            # 1. Obtiene las entidades del repositorio
            turnos: list[Turno] = repo.listar_todos()

            # 2. Mapea cada entidad a un DTO
            turnos_dto: list[TurnoDTO] = [
                self._mapear_a_dto(turno)
                for turno in turnos if turno
            ]
            return turnos_dto
        finally:
            repo.cerrar()

    def obtener_turno_por_id(self, id_turno: int):
        repo = TurnoRepository()
        try:
            turno = repo.obtener_por_id(id_turno)
            if not turno:
                raise ValueError("Turno no encontrado.")
            return turno
        finally:
            repo.cerrar()

    def listar_turnos_por_cancha(self, id_cancha: int):
        repo = TurnoRepository()
        try:
            return [t for t in repo.listar_todos() if t.id_cancha == id_cancha]
        finally:
            repo.cerrar()

    # ============================
    # ACTUALIZAR
    # ============================
    def actualizar_turno(self, id_turno, **datos_actualizados):
        repo = TurnoRepository()
        try:
            turno = repo.obtener_por_id(id_turno)
            if not turno:
                raise ValueError("Turno no encontrado.")

            if "hora_inicio" in datos_actualizados or "hora_fin" in datos_actualizados:
                hi = datos_actualizados.get("hora_inicio", turno.hora_inicio)
                hf = datos_actualizados.get("hora_fin", turno.hora_fin)
                if hi >= hf:
                    raise ValueError("La hora de inicio debe ser anterior a la de fin.")
            if "fecha" in datos_actualizados and not datos_actualizados["fecha"]:
                raise ValueError("La fecha no puede ser vacía.")

            for campo, valor in datos_actualizados.items():
                if hasattr(turno, campo):
                    setattr(turno, campo, valor)

            repo.actualizar(turno)
            repo.commit()
            return turno
        except Exception:
            repo.rollback()
            raise
        finally:
            repo.cerrar()

    # ============================
    # ELIMINAR
    # ============================
    def eliminar_turno(self, id_turno):
        repo_turno = TurnoRepository()
        repo_reserva = ReservaRepository()
        try:
            turno = repo_turno.obtener_por_id(id_turno)
            if not turno:
                raise ValueError("Turno no encontrado.")

            reservas = repo_reserva.obtener_todos(
                "SELECT * FROM Reserva WHERE id_turno=? AND estado IN ('pendiente','confirmada')",
                (id_turno,)
            )
            if reservas:
                raise ValueError("No se puede eliminar un turno reservado o pendiente.")

            repo_turno.eliminar(id_turno)
            repo_turno.commit()
            return {"mensaje": f"Turno {id_turno} eliminado correctamente."}
        except Exception:
            repo_turno.rollback()
            raise
        finally:
            repo_turno.cerrar()
            repo_reserva.cerrar()

    # ============================
    # CAMBIO DE ESTADO
    # ============================
    def marcar_como_reservado(self, id_turno):
        repo = TurnoRepository()
        try:
            turno = repo.obtener_por_id(id_turno)
            if not turno:
                raise ValueError("Turno no encontrado.")
            turno.estado = "reservado"
            repo.marcar_como_reservado(id_turno)
            repo.commit()
        except Exception:
            repo.rollback()
            raise
        finally:
            repo.cerrar()

    def marcar_como_disponible(self, id_turno):
        repo = TurnoRepository()
        try:
            turno = repo.obtener_por_id(id_turno)
            if not turno:
                raise ValueError("Turno no encontrado.")
            turno.estado = "disponible"
            repo.marcar_como_disponible(id_turno)
            repo.commit()
        except Exception:
            repo.rollback()
            raise
        finally:
            repo.cerrar()

    def _mapear_a_dto(self, turno:Turno) -> TurnoDTO:
        data = {
            "id_turno": turno.id_turno,
            "id_cancha": turno.id_cancha,
            "fecha": turno.fecha,
            "hora_inicio": turno.hora_inicio,
            "hora_fin": turno.hora_fin,
            "estado": turno.estado
        }


        return TurnoDTO(**data)