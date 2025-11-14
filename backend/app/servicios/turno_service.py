from datetime import date, time, datetime
from backend.app.dominio.turno import Turno
from backend.app.dto.turno_dto import TurnoDTO
from backend.app.repositorios.turno_repo import TurnoRepository
from backend.app.repositorios.cancha_repo import CanchaRepository
from backend.app.repositorios.reserva_repo import ReservaRepository

class TurnoService:

    # ============================
    # Mapeo
    # ============================
    def _mapear_a_dto(self, turno: Turno) -> TurnoDTO:
        return TurnoDTO(
            id_turno=turno.id_turno,
            id_cancha=turno.id_cancha,
            fecha=turno.fecha,
            hora_inicio=turno.hora_inicio,
            hora_fin=turno.hora_fin,
            estado=turno.estado
        )

    # ============================
    # VALIDACIONES DE NEGOCIO
    # ============================
    def _validar_campos(self, id_cancha, fecha, hora_inicio, hora_fin):

        if not id_cancha:
            raise ValueError("El campo 'id_cancha' es obligatorio.")

        if not fecha:
            raise ValueError("Debe especificarse una fecha.")

        if not hora_inicio or not hora_fin:
            raise ValueError("Debe indicar hora de inicio y hora de fin.")

        if hora_inicio >= hora_fin:
            raise ValueError("La hora de inicio debe ser anterior a la hora de fin.")

        # Fecha no pasada
        if fecha < datetime.now().date():
            raise ValueError("No se pueden crear turnos en fechas pasadas.")

        # Validar cancha existente
        repo_cancha = CanchaRepository()
        cancha = repo_cancha.obtener_por_id(id_cancha)
        if not cancha:
            raise ValueError("La cancha especificada no existe.")

    # ============================
    # DISPONIBILIDAD
    # ============================
    def _turno_disponible(self, id_cancha, fecha, hora_inicio, hora_fin):

        repo_turno = TurnoRepository()
        turnos_existentes = repo_turno.obtener_turnos_por_cancha_y_fecha(id_cancha, fecha)
        hora_inicio_str = str(hora_inicio)
        hora_fin_str = str(hora_fin)

        for t in turnos_existentes:
            t_inicio_str = str(t.hora_inicio)
            t_fin_str = str(t.hora_fin)
            if hora_inicio_str < t_fin_str and t_inicio_str < hora_fin_str:
                return False
        return True

    def _turno_disponible_para_actualizar(self, id_turno_a_ignorar, id_cancha, fecha, hora_inicio, hora_fin):

        repo_turno = TurnoRepository()
        turnos_existentes = repo_turno.obtener_turnos_por_cancha_y_fecha(id_cancha, fecha)

        for t in turnos_existentes:

            if t.id_turno == id_turno_a_ignorar:
                continue

            if hora_inicio < t.hora_fin and hora_fin > t.hora_inicio:
                return False

        return True

    # ============================
    # CREAR
    # ============================
    def crear_turno(self, id_cancha, fecha, hora_inicio, hora_fin, estado="disponible"):

        # Validaciones (usa _validar_campos que a su vez parsea si es necesario)
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
        repo.agregar(turno)

        return self._mapear_a_dto(turno)
    # ============================
    # OBTENER / LISTAR
    # ============================
    def listar_turnos(self) -> list[TurnoDTO]:
        repo = TurnoRepository()
        turnos = repo.listar_todos()
        return [self._mapear_a_dto(t) for t in turnos if t]

    def obtener_turno_por_id(self, id_turno: int):
        repo = TurnoRepository()
        turno = repo.obtener_por_id(id_turno)
        if not turno:
            raise ValueError("Turno no encontrado.")
        return self._mapear_a_dto(turno)

    def listar_turnos_por_cancha(self, id_cancha: int):
        repo = TurnoRepository()
        turnos = repo.listar_todos()
        return [self._mapear_a_dto(t) for t in turnos if t.id_cancha == id_cancha]

    # ============================
    # ACTUALIZAR
    # ============================
    def actualizar_turno(self, id_turno, **datos_actualizados):
        repo = TurnoRepository()
        turno = repo.obtener_por_id(id_turno)
        if not turno:
            raise ValueError("Turno no encontrado.")

        # Obtener valores para validación
        fecha = datos_actualizados.get("fecha", turno.fecha)
        hora_inicio = datos_actualizados.get("hora_inicio", turno.hora_inicio)
        hora_fin = datos_actualizados.get("hora_fin", turno.hora_fin)
        id_cancha = datos_actualizados.get("id_cancha", turno.id_cancha)

        if hora_inicio >= hora_fin:
            raise ValueError("La hora de inicio debe ser anterior a la de fin.")

        if not self._turno_disponible_para_actualizar(id_turno, id_cancha, fecha, hora_inicio, hora_fin):
            raise ValueError("La modificación se superpone con un turno existente en ese horario.")

        for campo, valor in datos_actualizados.items():
            setattr(turno, campo, valor)

        repo.actualizar(turno)
        return self._mapear_a_dto(turno)

    # ============================
    # ELIMINAR
    # ============================
    def eliminar_turno(self, id_turno):
        repo_turno = TurnoRepository()
        repo_reserva = ReservaRepository()

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
        return {"mensaje": f"Turno {id_turno} eliminado correctamente."}

    # ============================
    # CAMBIO DE ESTADO
    # ============================
    def marcar_como_reservado(self, id_turno):
        repo = TurnoRepository()
        turno = repo.obtener_por_id(id_turno)
        if not turno:
            raise ValueError("Turno no encontrado.")
        turno.estado = "reservado"
        repo.marcar_como_reservado(id_turno)

    def marcar_como_disponible(self, id_turno):
        repo = TurnoRepository()
        turno = repo.obtener_por_id(id_turno)
        if not turno:
            raise ValueError("Turno no encontrado.")
        turno.estado = "disponible"
        repo.marcar_como_disponible(id_turno)

    def listar_turnos_disponibles(self, id_cancha):
        repo = TurnoRepository()
        turnos = repo.obtener_disponibles_por_cancha(id_cancha)
        return [self._mapear_a_dto(t) for t in turnos if t]
