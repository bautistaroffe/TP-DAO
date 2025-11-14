from fastapi import APIRouter, HTTPException, Depends
from backend.app.servicios.correo_service import ServicioCorreo
from backend.app.dto.correo_dto import ComprobanteRequest
REMITENTE_CORREO = "manupereiraduarte@gmail.com"
PASSWORD_CORREO = "zjwh fgmg qyuq vtyv"

router = APIRouter(
    prefix="/correos",
    tags=["Correos"]
)

# Instanciamos el servicio de correo con las credenciales necesarias
correo_sender = ServicioCorreo(
    remitente=REMITENTE_CORREO,
    password_app=PASSWORD_CORREO
)


# ============================
# POST /correos/enviar-comprobante
# ============================
@router.post("/enviar-comprobante", summary="Envía el comprobante de pago al cliente")
def enviar_comprobante_endpoint(datos: ComprobanteRequest):
    try:
        # Llamar al método del servicio de dominio con los datos del DTO
        # El DTO asegura que todos los campos requeridos estén presentes
        correo_sender.enviar_correo(
            reserva=datos,  # El método de tu servicio está diseñado para aceptar el objeto 'datos'
            email_contacto=datos.email_contacto,
            id_reserva=datos.id_reserva
        )
        return {"mensaje": f"Comprobante enviado exitosamente a {datos.email_contacto}"}

    except Exception as e:
        # Errores pueden ser fallos de SMTP, credenciales o lectura de archivos
        print(f"Error detallado al intentar enviar correo: {e}")
        raise HTTPException(status_code=500, detail=f"Fallo al enviar el correo: {str(e)}")