from datetime import date
from backend.app.repositorios.reserva_repo import ReservaRepository
from backend.app.repositorios.cancha_repo import CanchaRepository
from backend.app.repositorios.adicional_repo import ServicioAdicionalRepository
from backend.app.repositorios.turno_repo import TurnoRepository
from backend.app.repositorios.usuario_repo import UsuarioRepository


class ReportesService:
    """
    Servicio que genera distintos reportes estadísticos y listados
    relacionados con reservas, canchas y utilización del sistema.
    """

    def __init__(self):
        # Se instancian los repositorios necesarios
        self.reserva_repo = ReservaRepository()
        self.cancha_repo = CanchaRepository()
        self.turno_repo = TurnoRepository()
        self.servicio_repo = ServicioAdicionalRepository()
        self.usuario_repo = UsuarioRepository()

    # =====================================================
    # 1️⃣ REPORTE: Reservas por cliente
    # =====================================================
    def generar_reporte_reservas_por_cliente(self, id_cliente: int):
        """Devuelve todas las reservas hechas por un cliente con detalles completos."""
        reservas = self.reserva_repo.obtener_por_cliente(id_cliente)
        if not reservas:
            return {"mensaje": "El cliente no tiene reservas registradas."}

        cliente = self.usuario_repo.obtener_por_id(id_cliente)
        reporte = {
            "cliente": {
                "id_cliente": cliente.id_usuario if cliente else id_cliente,
                "nombre": f"{cliente.nombre} {cliente.apellido}" if cliente else "Desconocido",
                "dni": cliente.dni if cliente else "N/D",
                "email": cliente.email if cliente else "N/D"
            },
            "reservas": []
        }

        for reserva in reservas:
            cancha = self.cancha_repo.obtener_por_id(reserva.id_cancha)
            turno = self.turno_repo.obtener_por_id(reserva.id_turno)

            # Los servicios no tienen 'nombre', devolvemos flags descriptivos
            servicio_info = None
            if reserva.id_servicio:
                servicio = self.servicio_repo.obtener_por_id(reserva.id_servicio)
                servicio_info = {
                    "cant_personas_asado": servicio.cant_personas_asado,
                    "arbitro": bool(servicio.arbitro),
                    "partido_grabado": bool(servicio.partido_grabado),
                    "pecheras": bool(servicio.pecheras),
                    "cant_paletas": servicio.cant_paletas
                } if servicio else None

            reporte["reservas"].append({
                "id_reserva": reserva.id_reserva,
                "cancha": cancha.nombre if cancha else "Desconocida",
                "fecha_turno": turno.fecha if turno else "Desconocida",
                "horario": f"{turno.hora_inicio} - {turno.hora_fin}" if turno else "N/D",
                "servicio_adicional": servicio_info,
                "precio_total": reserva.precio_total,
                "estado": reserva.estado,
                "origen": reserva.origen
            })

        return reporte

    # =====================================================
    # 2️⃣ REPORTE: Reservas por cancha en un período
    # =====================================================
    def generar_reporte_reservas_por_cancha_en_periodo(self, id_cancha: int, fecha_inicio: date, fecha_fin: date):
        """Devuelve las reservas de una cancha entre dos fechas dadas."""
        cancha = self.cancha_repo.obtener_por_id(id_cancha)
        if not cancha:
            raise ValueError("Cancha no encontrada.")

        # 🧩 Llamada al repositorio
        reservas = self.reserva_repo.obtener_reservas_por_cancha_y_periodo(id_cancha, fecha_inicio, fecha_fin)

        # 🔹 Si el repositorio devuelve None, lo convertimos en lista vacía
        if not reservas:
            reservas = []

        reporte = {
            "cancha": cancha.nombre,
            "desde": str(fecha_inicio),  # ✅ Convertimos a str para JSON
            "hasta": str(fecha_fin),
            "reservas": []
        }

        for reserva in reservas:
            try:
                # 🔹 Obtener entidades relacionadas
                cancha_r = self.cancha_repo.obtener_por_id(reserva.id_cancha)
                turno = self.turno_repo.obtener_por_id(reserva.id_turno)

                # 🔹 Evita errores si algo no existe
                cancha_nombre = cancha_r.nombre if cancha_r else "Cancha desconocida"
                fecha_turno = turno.fecha if turno else "Sin turno"
                horario = f"{turno.hora_inicio} - {turno.hora_fin}" if turno else "N/D"

                # 🔹 Servicio adicional
                servicio_info = None
                if reserva.id_servicio:
                    servicio = self.servicio_repo.obtener_por_id(reserva.id_servicio)
                    if servicio:
                        servicio_info = {
                            "cant_personas_asado": servicio.cant_personas_asado,
                            "arbitro": bool(servicio.arbitro),
                            "partido_grabado": bool(servicio.partido_grabado),
                            "pecheras": bool(servicio.pecheras),
                            "cant_paletas": servicio.cant_paletas,
                        }

                # 🔹 Agrega la reserva al reporte
                reporte["reservas"].append({
                    "id_reserva": reserva.id_reserva,
                    "cancha": cancha_nombre,
                    "fecha_turno": fecha_turno,
                    "horario": horario,
                    "servicio_adicional": servicio_info,
                    "precio_total": reserva.precio_total,
                    "estado": reserva.estado,
                    "origen": reserva.origen,
                })

            except Exception as e:
                # 🔸 No bloquea todo el reporte si una reserva tiene error
                print(f"⚠️ Error procesando reserva {getattr(reserva, 'id_reserva', '?')}: {e}")

        return reporte

    # =====================================================
    # 3️⃣ REPORTE: Canchas más reservadas
    # =====================================================
    def generar_reporte_canchas_mas_reservadas(self, top_n: int = 5):
        """
        Devuelve un ranking de las canchas con más reservas confirmadas/pagadas.
        """
        filas = self.cancha_repo.obtener_mas_reservadas(top_n)
        if not filas:
            return {"mensaje": "No hay datos de reservas."}

        total = sum(f["total_reservas"] for f in filas)
        reporte = {
            "total_reservas": total,
            "ranking": []
        }

        for fila in filas:
            porcentaje = round((fila["total_reservas"] / total) * 100, 2) if total > 0 else 0
            reporte["ranking"].append({
                "cancha": fila["nombre"],
                "reservas": fila["total_reservas"],
                "porcentaje": porcentaje
            })

        return reporte

    # =====================================================
    # 4️⃣ REPORTE: Utilización mensual de canchas
    # =====================================================
    def generar_reporte_utilizacion_mensual(self, anio, mes=None):
        """
        Genera un reporte de utilización de canchas.
        - Si solo se indica el año → devuelve reservas agrupadas por mes.
        - Si además se indica un mes (1-12) → devuelve solo ese mes, agrupado por cancha.
        """
        if mes is not None and (mes < 1 or mes > 12):
            raise ValueError("El mes debe estar entre 1 y 12.")

        datos = self.reserva_repo.obtener_utilizacion_mensual(anio, mes)

        if mes:  # 🔹 Si el mes está definido, devolvemos solo ese período
            reporte = []
            for fila in datos:
                reporte.append({
                    "cancha": fila["cancha"],
                    "total_reservas": fila["total_reservas"]
                })
            return reporte

        # 🔹 Si no se pasa mes → agrupamos todo el año por mes y cancha
        reporte = {}
        for fila in datos:
            cancha = fila["cancha"]
            mes_fila = int(fila["mes"])
            total = fila["total_reservas"]
            if cancha not in reporte:
                reporte[cancha] = [0] * 12
            reporte[cancha][mes_fila - 1] = total
        return reporte
