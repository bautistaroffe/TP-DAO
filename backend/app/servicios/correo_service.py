import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from email.mime.image import MIMEImage
import datetime
import locale
import os

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

RUTA_LOGO_FRONTEND = os.path.join(
    os.path.dirname(os.path.dirname(os.path.dirname(BASE_DIR))), # Esto te lleva a TP-DAO/
    "frontend",
    "public",
    "logo.png"
)
class ServicioCorreo:
    SMTP_SERVER = 'smtp.gmail.com'
    SMTP_PORT = 587

    def __init__(self, remitente: str, password_app: str):
        self.remitente = remitente
        self.password_app = password_app

        # 🚨 CORRECCIÓN ESTRUCTURAL: Mover la configuración de locale DENTRO del constructor
        try:
            locale.setlocale(locale.LC_ALL, 'es_AR.UTF-8')
        except locale.Error:
            try:
                locale.setlocale(locale.LC_ALL, 'es_ES.UTF-8')
            except locale.Error:
                # Fallback si no se puede establecer el locale específico
                locale.setlocale(locale.LC_ALL, '')
        # --------------------------------------------------------------------

    def generar_html_comprobante(
            self,
            dia_reserva: str,
            hora_turno: str,
            nombre_cancha: str,
            monto_reserva: float,
            id_reserva: int,
            metodo_pago: str,
            nombre_usuario: str,
    ) -> str:
        """
        Genera un comprobante HTML con los detalles de la reserva y el pago.
        """

        # Formatear el monto como moneda
        try:
            monto_formateado = locale.currency(monto_reserva, grouping=True)
        except Exception:
            monto_formateado = f"${monto_reserva:,.2f}".replace(",", "_").replace(".", ",").replace("_", ".")

        referencia_transaccion = id_reserva

        html_content = f"""
    <!DOCTYPE html>
    <html lang="es">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Comprobante de Pago - Complejo Estadia</title>
        <!-- 🛑 CRÍTICO: Eliminar script de Tailwind CDN, no se ejecuta en correo. -->
        <style>
            /* Definición de estilos críticos para el correo (CSS inline) */
            .color-primary {{ background-color: #1E3A8A; }}
            .color-secondary {{ background-color: #3B82F6; }}
            .color-text {{ color: #1E3A8A; }}
            .color-text-light {{ color: #60A5FA; }}
            body {{ font-family: 'Inter', sans-serif; }}
            .shadow-blue {{ box-shadow: 0 10px 15px -3px rgba(30, 58, 138, 0.3), 0 4px 6px -2px rgba(30, 58, 138, 0.1); }}
            .text-center {{ text-align: center; }}
            .m-auto {{ margin: auto; }}
            .mb-4 {{ margin-bottom: 1rem; }}
            .p-6 {{ padding: 1.5rem; }}
            .font-bold {{ font-weight: 700; }}
            .text-3xl {{ font-size: 1.875rem; }}
        </style>
    </head>
    <body style="background-color: #f3f4f6; padding: 1rem; font-family: sans-serif;">
        <!-- Contenedor principal del comprobante -->
        <div style="max-width: 600px; margin-left: auto; margin-right: auto; background-color: #ffffff; border-radius: 0.75rem; overflow: hidden; box-shadow: 0 10px 15px -3px rgba(30, 58, 138, 0.3);">

            <!-- Encabezado del Comprobante (Fondo Azul Oscuro) -->
            <header class="color-primary" style="color: #ffffff; padding: 1.5rem; display: flex; align-items: center; justify-content: space-between; background-color: #1E3A8A;">
                <div style="display: flex; align-items: center; gap: 1rem;">
                    <!-- 🚨 CORRECCIÓN: Usar imagen embebida del logo (Content ID) -->
                    <img src="cid:logo_complejo" alt="Logo Complejo Estadía" style="height: 40px; width: 40px; color: #ffffff;"/>

                    <h1 style="font-size: 1.875rem; font-weight: 700;">Complejo Estadía</h1>
                </div>
                <span style="font-size: 0.875rem; opacity: 0.8;">{datetime.date.today().strftime('%d/%m/%Y')}</span>
            </header>

            <!-- Sección de Confirmación -->
            <div style="padding: 1.5rem 1.5rem 0.5rem; text-align: center;">
                <!-- 🚨 CORRECCIÓN: Reducir tamaño del tick (h-10 w-10) y usar imagen embebida para mayor compatibilidad -->
                <img src="https://placehold.co/40x40/50C878/ffffff?text=OK" alt="Confirmado" style="display: block; margin: auto; height: 40px; width: 40px; margin-bottom: 1rem;"/>

                <h2 style="font-size: 1.5rem; font-weight: 800; color: #1E3A8A; margin-bottom: 0.5rem;">¡Pago Confirmado con Éxito!</h2>
                <p style="font-size: 1.125rem; color: #4b5563;">
                    Su pago ha sido procesado correctamente y la reserva ha sido asegurada.
                </p>
            </div>

            <!-- Secciones de Datos (Layout en dos columnas) -->
            <div style="padding: 0 1.5rem 1.5rem 1.5rem; display: flex; flex-direction: column; gap: 1rem;">

                <!-- Contenedor de Datos de Reserva -->
                <div style="border: 1px solid #bfdbfe; border-radius: 0.5rem; padding: 1.25rem; background-color: #eff6ff; margin-top: 1rem;">
                    <h3 style="font-size: 1.25rem; font-weight: 600; color: #1E3A8A; margin-bottom: 1rem; border-bottom: 1px solid #93c5fd; padding-bottom: 0.5rem;">Datos de la Reserva</h3>
                    <dl style="color: #4b5563; line-height: 1.5;">
                        <div style="margin-bottom: 0.75rem;">
                            <dt style="font-weight: 500; color: #60A5FA;">Día de la Reserva</dt>
                            <dd style="font-size: 1.125rem; font-weight: 700;">{dia_reserva}</dd>
                        </div>
                        <div style="margin-bottom: 0.75rem;">
                            <dt style="font-weight: 500; color: #60A5FA;">Turno</dt>
                            <dd style="font-size: 1.125rem; font-weight: 700;">{hora_turno}</dd>
                        </div>
                        <div>
                            <dt style="font-weight: 500; color: #60A5FA;">Cancha</dt>
                            <dd style="font-size: 1.125rem; font-weight: 700;">{nombre_cancha}</dd>
                        </div>
                    </dl>
                </div>

                <!-- Contenedor de Datos de Pago -->
                <div style="border: 1px solid #bfdbfe; border-radius: 0.5rem; padding: 1.25rem; background-color: #eff6ff;">
                    <h3 style="font-size: 1.25rem; font-weight: 600; color: #1E3A8A; margin-bottom: 1rem; border-bottom: 1px solid #93c5fd; padding-bottom: 0.5rem;">Datos del Pago</h3>
                    <dl style="color: #4b5563; line-height: 1.5;">
                        <div style="margin-bottom: 0.75rem;">
                            <dt style="font-weight: 500; color: #60A5FA;">Nro. de Transacción (Ref. Reserva)</dt>
                            <dd style="font-size: 1.125rem; font-weight: 700;">{referencia_transaccion}</dd>
                        </div>
                        <div style="margin-bottom: 0.75rem;">
                            <dt style="font-weight: 500; color: #60A5FA;">Usuario</dt>
                            <dd style="font-size: 1.125rem; font-weight: 700;">{nombre_usuario}</dd>
                        </div>
                        <div>
                            <dt style="font-weight: 500; color: #60A5FA;">Método de Pago</dt>
                            <dd style="font-size: 1.125rem; font-weight: 700;">{metodo_pago}</dd>
                        </div>
                    </dl>
                </div>
            </div>

            <!-- Total Pagado (Banda inferior Azul Brillante) -->
            <div class="color-secondary" style="background-color: #3B82F6; color: #ffffff; padding: 1.5rem; display: flex; justify-content: space-between; align-items: center; margin-top: 1rem;">
                <span style="font-size: 1.125rem; font-weight: 600; text-transform: uppercase;">Monto Total Pagado</span>
                <span style="font-size: 2.25rem; font-weight: 800;">{monto_formateado}</span>
            </div>

            <!-- Pie de página -->
            <footer style="text-align: center; padding: 1rem; color: #6b7280; font-size: 0.875rem;">
                Gracias por elegir Complejo Estadía. ¡Lo esperamos!
            </footer>
        </div>
    </body>
    </html>
        """
        return html_content

    def enviar_correo(self, reserva, email_contacto, id_reserva=None):  # 🚨 CORRECCIÓN: Agregar 'self'
        try:
            mensaje = MIMEMultipart("related")
            if id_reserva is not None:
                mensaje["Subject"] = (
                    f"Comprobante de reserva #{id_reserva} - Complejo Estadía"
                )
            else:
                mensaje["Subject"] = (
                    "Comprobante de reserva - Complejo Estadía"
                )
            mensaje["From"] = self.remitente
            mensaje["To"] = email_contacto

            # Generar el contenido HTML del correo
            html_content = self.generar_html_comprobante(
                reserva.dia_reserva,
                reserva.hora_turno,
                reserva.nombre_cancha,
                reserva.monto_reserva,
                id_reserva,  # Pasamos el ID de Reserva
                reserva.metodo_pago,
                reserva.nombre_usuario,
            )

            # Adjuntar el contenido HTML al mensaje
            mensaje.attach(MIMEText(html_content, "html"))

            # Adjuntar el logo embebido
            # 🚨 NOTA: Se asume que esta ruta es correcta para el entorno de ejecución
            with open(RUTA_LOGO_FRONTEND, "rb") as img_file:
                img = MIMEImage(img_file.read())
                img.add_header("Content-ID", "<logo_complejo>")
                img.add_header("Content-Disposition", "inline", filename="logo_complejo.png")
                mensaje.attach(img)

            # Enviar el correo vía SMTP
            with smtplib.SMTP(self.SMTP_SERVER, self.SMTP_PORT) as servidor:
                servidor.starttls()
                servidor.login(self.remitente, self.password_app)
                servidor.send_message(mensaje)
        except Exception as e:
            print(f"Error al enviar el correo: {e}")
            raise e