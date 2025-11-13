from datetime import date, time
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
        data = {
            "id_turno": turno.id_turno,
            "id_cancha": turno.id_cancha,
            "fecha": turno.fecha,
            "hora_inicio": turno.hora_inicio,
            "hora_fin": turno.hora_fin,
            "estado": turno.estado
        }
        return TurnoDTO(**data)

    # ============================
    # VALIDACIONES DE NEGOCIO
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

        # Validar que la cancha exista (BaseRepository maneja la conexión)
        repo_cancha = CanchaRepository()
        cancha = repo_cancha.obtener_por_id(id_cancha)
        if not cancha:
            raise ValueError("La cancha especificada no existe.")

    def _turno_disponible(self, id_cancha, fecha, hora_inicio, hora_fin):
        """Verifica si el nuevo turno se superpone con algún turno existente."""
        repo_turno = TurnoRepository()
        # La conexión se abre y cierra en listar_todos()
        turnos = repo_turno.listar_todos()

        for t in turnos:
            if t and t.id_cancha == id_cancha and t.fecha == fecha:
                # Chequeo de superposición:
                # El nuevo turno NO se superpone si:
                # 1. Termina antes de que el existente inicie (hora_fin <= t.hora_inicio)
                # 2. O inicia después de que el existente termina (hora_inicio >= t.hora_fin)
                if not (hora_fin <= t.hora_inicio or hora_inicio >= t.hora_fin):
                    return False
        return True

    def _turno_disponible_para_actualizar(self, id_turno_a_ignorar, id_cancha, fecha, hora_inicio, hora_fin):
        """Verifica si el turno actualizado se superpone con otros turnos, ignorándose a sí mismo."""
        repo_turno = TurnoRepository()
        # La conexión se abre y cierra en listar_todos()
        turnos = repo_turno.listar_todos()

        for t in turnos:
            # Ignorar el turno que estamos actualizando
            if t and t.id_turno == id_turno_a_ignorar:
                continue

            if t and t.id_cancha == id_cancha and t.fecha == fecha:
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
        # repo.agregar es atómico: ejecuta INSERT y commitea.
        repo.agregar(turno)
        return self._mapear_a_dto(turno)

    # ============================
    # OBTENER / LISTAR
    # ============================
    def listar_turnos(self) -> list[TurnoDTO]:
        repo = TurnoRepository()
        # La conexión se abre y cierra en listar_todos()
        turnos: list[Turno] = repo.listar_todos()

        # Mapea cada entidad a un DTO
        turnos_dto: list[TurnoDTO] = [
            self._mapear_a_dto(turno)
            for turno in turnos if turno
        ]
        return turnos_dto

    def obtener_turno_por_id(self, id_turno: int):
        repo = TurnoRepository()
        # La conexión se abre y cierra en obtener_por_id()
        turno = repo.obtener_por_id(id_turno)
        if not turno:
            raise ValueError("Turno no encontrado.")
        return self._mapear_a_dto(turno)

    def listar_turnos_por_cancha(self, id_cancha: int):
        repo = TurnoRepository()
        # Este método es ineficiente; idealmente se haría en el repositorio con un WHERE
        # Pero manteniendo la lógica original:
        turnos = repo.listar_todos()
        return [self._mapear_a_dto(t) for t in turnos if t and t.id_cancha == id_cancha]

    # ============================
    # ACTUALIZAR
    # ============================
    def actualizar_turno(self, id_turno, **datos_actualizados):
        repo = TurnoRepository()

        turno = repo.obtener_por_id(id_turno)
        if not turno:
            raise ValueError("Turno no encontrado.")

        # Preparar valores para validación, usando los valores existentes si no se actualizan
        id_cancha = datos_actualizados.get("id_cancha", turno.id_cancha)
        fecha = datos_actualizados.get("fecha", turno.fecha)
        hora_inicio = datos_actualizados.get("hora_inicio", turno.hora_inicio)
        hora_fin = datos_actualizados.get("hora_fin", turno.hora_fin)

        # Validar lógica de horas
        if hora_inicio >= hora_fin:
            raise ValueError("La hora de inicio debe ser anterior a la de fin.")

        if "fecha" in datos_actualizados and not datos_actualizados["fecha"]:
            raise ValueError("La fecha no puede ser vacía.")

        # 🟢 VALIDACIÓN DE UNICIDAD/SUPERPOSICIÓN (Ignorando el turno actual)
        if not self._turno_disponible_para_actualizar(id_turno, id_cancha, fecha, hora_inicio, hora_fin):
            raise ValueError("La modificación se superpone con un turno existente en ese horario.")

        for campo, valor in datos_actualizados.items():
            if hasattr(turno, campo):
                setattr(turno, campo, valor)

        # repo.actualizar es atómico: ejecuta UPDATE y commitea.
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

        # 2. Verificar reservas activas/pendientes (lectura atómica)
        reservas = repo_reserva.obtener_todos(
            "SELECT * FROM Reserva WHERE id_turno=? AND estado IN ('pendiente','confirmada')",
            (id_turno,)
        )
        if reservas:
            raise ValueError("No se puede eliminar un turno reservado o pendiente.")

        # 3. Eliminar (escritura atómica)
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
        # repo.marcar_como_reservado es atómico
        repo.marcar_como_reservado(id_turno)

    def marcar_como_disponible(self, id_turno):
        repo = TurnoRepository()

        turno = repo.obtener_por_id(id_turno)
        if not turno:
            raise ValueError("Turno no encontrado.")

        turno.estado = "disponible"
        # repo.marcar_como_disponible es atómico
        repo.marcar_como_disponible(id_turno)