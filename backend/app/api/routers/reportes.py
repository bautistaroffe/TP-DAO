from fastapi import APIRouter, HTTPException, Query
from datetime import date
from backend.app.servicios.reportes_service import ReportesService

router = APIRouter(
    prefix="/reportes",
    tags=["Reportes"]
)

service = ReportesService()

# ============================
# 1️⃣ Listado de reservas por cliente
# ============================
@router.get("/reservas-cliente/{id_cliente}", summary="Listado de reservas por cliente")
def reporte_reservas_por_cliente(id_cliente: int):
    try:
        return service.generar_reporte_reservas_por_cliente(id_cliente)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ============================
# 2️⃣ Reservas por cancha en un período
# ============================
@router.get("/reservas-cancha", summary="Reservas por cancha en un período")
def reporte_reservas_por_cancha(
    id_cancha: int = Query(..., description="ID de la cancha"),
    fecha_inicio: date = Query(..., description="Fecha inicial (YYYY-MM-DD)"),
    fecha_fin: date = Query(..., description="Fecha final (YYYY-MM-DD)")
):
    try:
        return service.generar_reporte_reservas_por_cancha_en_periodo(
            id_cancha=id_cancha,
            fecha_inicio=fecha_inicio,
            fecha_fin=fecha_fin
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ============================
# 3️⃣ Canchas más utilizadas
# ============================
@router.get("/canchas-mas-usadas", summary="Canchas más utilizadas")
def reporte_canchas_mas_usadas(
    top_n: int = Query(5, description="Cantidad de canchas a mostrar en el ranking (por defecto 5)")
):
    try:
        return service.generar_reporte_canchas_mas_reservadas(top_n)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ============================
# 4️⃣ Utilización mensual de canchas
# ============================
@router.get("/utilizacion-mensual", summary="Utilización mensual de canchas")
def reporte_utilizacion_mensual(
    año: int = Query(..., description="Año a consultar (ejemplo: 2025)"),
    mes: int | None = Query(None, description="Mes opcional (1-12). Si se omite, devuelve todo el año.")
):
    try:
        return service.generar_reporte_utilizacion_mensual(año=año, mes=mes)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
