from backend.app.dominio.reserva import Reserva
from backend.app.dto.reserva_dto import ReservaDTO
from backend.app.repositorios.reserva_repo import ReservaRepository
from backend.app.repositorios.cancha_repo import CanchaRepository
from backend.app.repositorios.adicional_repo import ServicioAdicionalRepository
from backend.app.repositorios.turno_repo import TurnoRepository
from backend.app.repositorios.pago_repo import PagoRepository


class ReservaService:
    # ============================
    # MAPEO Y VALIDACIONES
    # ============================
    def _mapear_a_dto(self, reserva: Reserva) -> ReservaDTO:
        data = {
            "id_reserva": reserva.id_reserva,
            "id_cancha": reserva.id_cancha,
            "id_turno": reserva.id_turno,
            "id_cliente": reserva.id_cliente,
            "id_torneo": reserva.id_torneo,
            "id_servicio": reserva.id_servicio,
            "precio_total": reserva.precio_total,
            "estado": reserva.estado,
            "origen": reserva.origen
        }
        return ReservaDTO(**data)

    def _validar_campos(self, id_cancha, id_turno, id_cliente):
        if not id_cancha or id_cancha <= 0:
            raise ValueError("El ID de la cancha es obligatorio y debe ser válido.")
        if not id_turno or id_turno <= 0:
            raise ValueError("El ID del turno es obligatorio y debe ser válido.")
        if not id_cliente or id_cliente <= 0:
            raise ValueError("El ID del cliente es obligatorio y debe ser válido.")

    def _turno_disponible(self, id_cancha, id_turno):
        """Verifica si el turno no está pendiente ni confirmado en otra reserva (Lectura atómica)."""
        repo = ReservaRepository()
        filas = repo.obtener_todos("""
            SELECT * FROM Reserva
            WHERE id_cancha=? AND id_turno=? AND estado IN ('pendiente', 'confirmada')
        """, (id_cancha, id_turno))
        return len(filas) == 0

    # ============================
    # CREAR RESERVA (Transacción: Afecta a Reserva y Turno)
    # ============================
    def crear_reserva(self, id_cancha, id_turno, id_cliente,
                      id_torneo=None, id_servicio=None, origen="particular"):
        self._validar_campos(id_cancha, id_turno, id_cliente)

        repo_reserva = ReservaRepository()
        repo_cancha = CanchaRepository()
        repo_servicio = ServicioAdicionalRepository()

        # 1. Verificar disponibilidad (Lectura atómica)
        if not self._turno_disponible(id_cancha, id_turno):
            raise ValueError("El turno seleccionado no está disponible.")

        # Obtener entidades (Lecturas atómicas)
        cancha = repo_cancha.obtener_por_id(id_cancha)
        if not cancha:
            raise ValueError("Cancha no encontrada.")

        servicio_adicional = None
        if id_servicio:
            servicio_adicional = repo_servicio.obtener_por_id(id_servicio)
            if not servicio_adicional:
                raise ValueError("Servicio adicional no encontrado.")

        # 2. Construir objeto de dominio
        reserva = Reserva(
            id_cancha=id_cancha,
            id_turno=id_turno,
            id_cliente=id_cliente,
            id_torneo=id_torneo,
            id_servicio=id_servicio,
            estado="pendiente",
            origen=origen
        )
        reserva.calcular_costo_reserva(cancha, servicio_adicional)

        # 3. Iniciar transacción
        repo_reserva.iniciar_transaccion()
        try:
            # 🟢 Escritura 1: Agregar reserva (usa la conexión transaccional)
            repo_reserva.agregar(reserva)

            # 🟢 Escritura 2: Marcar Turno como reservado (FORZAMOS A USAR CONEXIÓN DE REPO_RESERVA)
            # Usamos el método ejecutar del repositorio de reserva para asegurar la misma conexión.
            repo_reserva.ejecutar("""
                UPDATE Turno
                SET estado = 'reservado'
                WHERE id_turno = ?
            """, (id_turno,))

            # 4. Confirmar
            repo_reserva.confirmar_transaccion()

            return {
                "mensaje": "Reserva creada correctamente.",
                "reserva": self._mapear_a_dto(reserva)
            }

        except Exception as e:
            # 5. Revertir
            repo_reserva.revertir_transaccion()
            raise e

    # ============================
    # OBTENER / LISTAR (Atómicas)
    # ============================
    def listar_reservas(self) -> list[ReservaDTO]:
        repo = ReservaRepository()
        reservas: list[Reserva] = repo.listar_todas()
        reservas_dto: list[ReservaDTO] = [
            self._mapear_a_dto(reserva)
            for reserva in reservas if reserva
        ]
        return reservas_dto

    def obtener_reserva_por_id(self, id_reserva) -> ReservaDTO:
        repo = ReservaRepository()
        reserva = repo.obtener_por_id(id_reserva)
        if not reserva:
            raise ValueError("Reserva no encontrada.")
        return self._mapear_a_dto(reserva)

    # ============================
    # CANCELAR RESERVA (Transacción: Afecta a Reserva y Turno)
    # ============================
    def cancelar_reserva(self, id_reserva):
        repo_reserva = ReservaRepository()
        repo_pago = PagoRepository()

        # 1. Obtener datos (Lecturas atómicas)
        reserva = repo_reserva.obtener_por_id(id_reserva)
        if not reserva:
            raise ValueError("Reserva no encontrada.")
        if reserva.estado not in ("pendiente"):
            raise ValueError("Solo se pueden cancelar reservas pendientes.")
        if reserva.estado == "confirmada":
            raise ValueError("No se puede cancelar una reserva que ya fue pagada.")

        # 2. Iniciar transacción
        repo_reserva.iniciar_transaccion()
        try:
            # Escrituras dentro de la transacción
            reserva.estado = "cancelada"
            repo_reserva.actualizar(reserva)

            # 🟢 Escritura 2: Marcar Turno como disponible (FORZAMOS A USAR CONEXIÓN DE REPO_RESERVA)
            repo_reserva.ejecutar("""
                UPDATE Turno
                SET estado = 'disponible'
                WHERE id_turno = ?
            """, (reserva.id_turno,))

            # 3. Confirmar
            repo_reserva.confirmar_transaccion()

            return {"mensaje": f"Reserva {id_reserva} cancelada correctamente."}

        except Exception as e:
            # 4. Revertir
            repo_reserva.revertir_transaccion()
            raise e

    # ============================
    # MODIFICAR RESERVA (Transacción: Afecta a Reserva y Turno)
    # ============================
    def modificar_reserva(self, id_reserva, nuevo_id_turno=None,
                          nuevo_id_servicio=None, nuevo_id_cliente=None) -> ReservaDTO:
        repo_reserva = ReservaRepository()
        repo_cancha = CanchaRepository()
        repo_servicio = ServicioAdicionalRepository()
        repo_pago = PagoRepository()

        # 1. Obtener reserva inicial (Lectura atómica)
        reserva = repo_reserva.obtener_por_id(id_reserva)
        if not reserva:
            raise ValueError("Reserva no encontrada.")
        if reserva.estado != "pendiente":
            raise ValueError("Solo se pueden modificar reservas pendientes.")

        # 2. Iniciar transacción
        repo_reserva.iniciar_transaccion()
        try:
            # 1️⃣ Cambiar turno
            if nuevo_id_turno and nuevo_id_turno != reserva.id_turno:
                # Verificación de disponibilidad (Lectura atómica)
                if not self._turno_disponible(reserva.id_cancha, nuevo_id_turno):
                    raise ValueError("El nuevo turno no está disponible.")

                # 🟢 Escritura 1: Marcar turno viejo como disponible (FORZAMOS CONEXIÓN)
                repo_reserva.ejecutar("""
                    UPDATE Turno
                    SET estado = 'disponible'
                    WHERE id_turno = ?
                """, (reserva.id_turno,))

                # 🟢 Escritura 2: Marcar turno nuevo como reservado (FORZAMOS CONEXIÓN)
                repo_reserva.ejecutar("""
                    UPDATE Turno
                    SET estado = 'reservado'
                    WHERE id_turno = ?
                """, (nuevo_id_turno,))

                reserva.id_turno = nuevo_id_turno

            # 2️⃣ Cambiar servicio adicional
            if nuevo_id_servicio is not None:
                servicio = repo_servicio.obtener_por_id(nuevo_id_servicio)
                if not servicio and nuevo_id_servicio is not None:
                    raise ValueError("Servicio adicional no encontrado.")
                reserva.id_servicio = nuevo_id_servicio

            # 3️⃣ Cambiar cliente
            if nuevo_id_cliente is not None:
                pago = repo_pago.obtener_por_reserva(reserva.id_reserva)
                if pago:
                    raise ValueError("No se puede cambiar el cliente de una reserva ya pagada.")
                reserva.id_cliente = nuevo_id_cliente

            # 4️⃣ Recalcular precio (Lecturas atómicas)
            cancha = repo_cancha.obtener_por_id(reserva.id_cancha)
            servicio_final = repo_servicio.obtener_por_id(reserva.id_servicio) if reserva.id_servicio else None
            reserva.calcular_costo_reserva(cancha, servicio_final)

            # 5️⃣ Guardar cambios (Escritura dentro de la transacción)
            repo_reserva.actualizar(reserva)

            # 6. Confirmar
            repo_reserva.confirmar_transaccion()

            return self._mapear_a_dto(reserva)

        except Exception as e:
            # 7. Revertir
            repo_reserva.revertir_transaccion()
            raise e