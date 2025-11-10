from datetime import date, time
from backend.app.dominio.turno import Turno
from backend.app.repositorios.turno_repo import TurnoRepository
from backend.app.repositorios.cancha_repo import CanchaRepository
from backend.app.repositorios.reserva_repo import ReservaRepository


class TurnoService:
    def __init__(self):
        self.turno_repo = TurnoRepository()
        self.cancha_repo = CanchaRepository()
        self.reserva_repo = ReservaRepository()

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
        cancha = self.cancha_repo.obtener_por_id(id_cancha)
        if not cancha:
            raise ValueError("La cancha especificada no existe.")

    def _turno_disponible(self, id_cancha, fecha, hora_inicio, hora_fin):
        """
        Verifica si ya existe un turno en esa cancha que se superponga en horario.
        """
        turnos = self.turno_repo.listar_todos()
        for t in turnos:
            if t.id_cancha == id_cancha and t.fecha == fecha:
                # comparar horas
                if not (hora_fin <= t.hora_inicio or hora_inicio >= t.hora_fin):
                    return False
        return True

    # ============================
    # CREAR TURNO
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

        try:
            self.turno_repo.agregar(turno)
            self.turno_repo.commit()
            return turno
        except Exception:
            self.turno_repo.rollback()
            raise
        finally:
            self.turno_repo.cerrar()
            self.cancha_repo.cerrar()

    # ============================
    # OBTENER / LISTAR
    # ============================
    def listar_turnos(self):
        try:
            return self.turno_repo.listar_todos()
        finally:
            self.turno_repo.cerrar()

    def obtener_turno_por_id(self, id_turno: int):
        try:
            turno = self.turno_repo.obtener_por_id(id_turno)
            if not turno:
                raise ValueError("Turno no encontrado.")
            return turno
        finally:
            self.turno_repo.cerrar()

    def listar_turnos_por_cancha(self, id_cancha: int):
        try:
            return [t for t in self.turno_repo.listar_todos() if t.id_cancha == id_cancha]
        finally:
            self.turno_repo.cerrar()

    # ============================
    # ACTUALIZAR
    # ============================
    def actualizar_turno(self, id_turno, **datos_actualizados):
        try:
            turno = self.turno_repo.obtener_por_id(id_turno)
            if not turno:
                raise ValueError("Turno no encontrado.")

            # validar si se cambian horas o fecha
            if "hora_inicio" in datos_actualizados or "hora_fin" in datos_actualizados:
                hi = datos_actualizados.get("hora_inicio", turno.hora_inicio)
                hf = datos_actualizados.get("hora_fin", turno.hora_fin)
                if hi >= hf:
                    raise ValueError("La hora de inicio debe ser anterior a la de fin.")
            if "fecha" in datos_actualizados:
                if not datos_actualizados["fecha"]:
                    raise ValueError("La fecha no puede ser vacía.")

            # aplicar cambios válidos
            for campo, valor in datos_actualizados.items():
                if hasattr(turno, campo):
                    setattr(turno, campo, valor)

            self.turno_repo.actualizar(turno)
            self.turno_repo.commit()
            return turno
        except Exception:
            self.turno_repo.rollback()
            raise
        finally:
            self.turno_repo.cerrar()

    # ============================
    # ELIMINAR
    # ============================
    def eliminar_turno(self, id_turno):
        """
        Elimina un turno solo si no está reservado.
        """
        try:
            turno = self.turno_repo.obtener_por_id(id_turno)
            if not turno:
                raise ValueError("Turno no encontrado.")

            reservas = self.reserva_repo.obtener_todos(
                "SELECT * FROM Reserva WHERE id_turno=? AND estado IN ('pendiente','confirmada')",
                (id_turno,)
            )
            if reservas:
                raise ValueError("No se puede eliminar un turno reservado o pendiente.")

            self.turno_repo.eliminar(id_turno)
            self.turno_repo.commit()
            return {"mensaje": f"Turno {id_turno} eliminado correctamente."}
        except Exception:
            self.turno_repo.rollback()
            raise
        finally:
            self.turno_repo.cerrar()
            self.reserva_repo.cerrar()

    # ============================
    # CAMBIO DE ESTADO
    # ============================
    def marcar_como_reservado(self, id_turno):
        try:
            turno = self.turno_repo.obtener_por_id(id_turno)
            if not turno:
                raise ValueError("Turno no encontrado.")
            turno.estado = "reservado"
            self.turno_repo.marcar_como_reservado(id_turno)
            self.turno_repo.commit()
        except Exception:
            self.turno_repo.rollback()
            raise
        finally:
            self.turno_repo.cerrar()

    def marcar_como_disponible(self, id_turno):
        try:
            turno = self.turno_repo.obtener_por_id(id_turno)
            if not turno:
                raise ValueError("Turno no encontrado.")
            turno.estado = "disponible"
            self.turno_repo.marcar_como_disponible(id_turno)
            self.turno_repo.commit()
        except Exception:
            self.turno_repo.rollback()
            raise
        finally:
            self.turno_repo.cerrar()
