import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from email.mime.image import MIMEImage
import datetime
import locale

class ServicioCorreo:

    SMTP_SERVER = 'smtp.gmail.com'
    SMTP_PORT = 587

    def __init__(self, remitente: str, password_app: str):
        self.remitente = remitente
        self.password_app = password_app

    try:
        locale.setlocale(locale.LC_ALL, 'es_AR.UTF-8')
    except locale.Error:
        try:
            locale.setlocale(locale.LC_ALL, 'es_ES.UTF-8')
        except locale.Error:
            # Fallback si no se puede establecer el locale específico
            locale.setlocale(locale.LC_ALL, '')

    def generar_html_comprobante(
            dia_reserva: str,
            hora_turno: str,
            nombre_cancha: str,
            monto_reserva: float,
            id_pago: str,
            metodo_pago: str,
            nombre_usuario: str,
    ) -> str:
        """
        Genera un comprobante HTML con los detalles de la reserva y el pago.

        Args:
            dia_reserva (str): Fecha de la reserva (ej: "31/10/2025").
            hora_turno (str): Rango de hora del turno (ej: "20:00 - 21:00").
            nombre_cancha (str): Nombre de la cancha reservada.
            monto_reserva (float): Monto total pagado.
            id_pago (str): Número de transacción/ID de pago.
            metodo_pago (str): Método de pago utilizado.
            nombre_usuario (str): Nombre completo del usuario.

        Returns:
            str: Cadena de texto con el HTML completo del comprobante.
        """

        # Formatear el monto como moneda
        try:
            monto_formateado = locale.currency(monto_reserva, grouping=True)
        except Exception:
            # Fallback si falla el locale: formato simple en español
            monto_formateado = f"${monto_reserva:,.2f}".replace(",", "_").replace(".", ",").replace("_", ".")

        html_content = f"""
    <!DOCTYPE html>
    <html lang="es">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Comprobante de Pago - Complejo Estadia</title>
        <!-- Carga de Tailwind CSS via CDN -->
        <script src="https://cdn.tailwindcss.com"></script>
        <style>
            /* Estilos personalizados para la paleta de azules */
            .color-primary {{ background-color: #1E3A8A; }} /* Azul Oscuro */
            .color-secondary {{ background-color: #3B82F6; }} /* Azul Brillante */
            .color-text {{ color: #1E3A8A; }}
            .color-text-light {{ color: #60A5FA; }}
            .shadow-blue {{ box-shadow: 0 10px 15px -3px rgba(30, 58, 138, 0.3), 0 4px 6px -2px rgba(30, 58, 138, 0.1); }}

            /* Fuente Inter por defecto de Tailwind */
            body {{ font-family: 'Inter', sans-serif; }}
        </style>
    </head>
    <body class="bg-gray-100 p-4 sm:p-8">
        <!-- Contenedor principal del comprobante -->
        <div class="max-w-3xl mx-auto bg-white rounded-xl overflow-hidden shadow-blue">

            <!-- Encabezado del Comprobante (Fondo Azul Oscuro) -->
            <header class="color-primary text-white p-6 sm:p-8 flex items-center justify-between">
                <div class="flex items-center space-x-4">
                    <!-- Logo Placeholder (Icono de Balón de Fútbol/Deporte en SVG) -->
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-10 w-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    <h1 class="text-3xl font-bold">Complejo Estadía</h1>
                </div>
                <span class="text-sm opacity-80">{datetime.date.today().strftime('%d/%m/%Y')}</span>
            </header>

            <!-- Sección de Confirmación -->
            <div class="p-6 sm:p-8 text-center">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-16 w-16 text-green-500 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <h2 class="text-2xl sm:text-3xl font-extrabold color-text mb-2">¡Pago Confirmado con Éxito!</h2>
                <p class="text-lg text-gray-600">
                    Su pago ha sido procesado correctamente y la reserva ha sido asegurada.
                </p>
            </div>

            <!-- Secciones de Datos (Grid Responsivo) -->
            <div class="p-6 sm:p-8 pt-0 grid grid-cols-1 md:grid-cols-2 gap-6">

                <!-- Columna de Datos de Reserva -->
                <div class="border border-blue-200 rounded-lg p-5 bg-blue-50">
                    <h3 class="text-xl font-semibold color-text mb-4 border-b pb-2 border-blue-300">Datos de la Reserva</h3>
                    <dl class="space-y-3 text-gray-700">
                        <div>
                            <dt class="font-medium color-text-light">Día de la Reserva</dt>
                            <dd class="text-lg font-bold">{dia_reserva}</dd>
                        </div>
                        <div>
                            <dt class="font-medium color-text-light">Turno</dt>
                            <dd class="text-lg font-bold">{hora_turno}</dd>
                        </div>
                        <div>
                            <dt class="font-medium color-text-light">Cancha</dt>
                            <dd class="text-lg font-bold">{nombre_cancha}</dd>
                        </div>
                    </dl>
                </div>

                <!-- Columna de Datos de Pago -->
                <div class="border border-blue-200 rounded-lg p-5 bg-blue-50">
                    <h3 class="text-xl font-semibold color-text mb-4 border-b pb-2 border-blue-300">Datos del Pago</h3>
                    <dl class="space-y-3 text-gray-700">
                        <div>
                            <dt class="font-medium color-text-light">Nro. de Transacción</dt>
                            <dd class="text-lg font-bold">{id_pago}</dd>
                        </div>
                        <div>
                            <dt class="font-medium color-text-light">Usuario</dt>
                            <dd class="text-lg font-bold">{nombre_usuario}</dd>
                        </div>
                        <div>
                            <dt class="font-medium color-text-light">Método de Pago</dt>
                            <dd class="text-lg font-bold">{metodo_pago}</dd>
                        </div>
                    </dl>
                </div>
            </div>

            <!-- Total Pagado (Banda inferior Azul Brillante) -->
            <div class="color-secondary text-white p-6 sm:p-8 flex justify-between items-center mt-4">
                <span class="text-lg font-semibold uppercase">Monto Total Pagado</span>
                <span class="text-4xl font-extrabold">{monto_formateado}</span>
            </div>

            <!-- Pie de página -->
            <footer class="text-center p-4 text-gray-500 text-sm">
                Gracias por elegir Complejo Estadía. ¡Lo esperamos!
            </footer>
        </div>
    </body>
    </html>
        """
        return html_content

def enviar_correo(self, reserva, email_contacto, id_reserva=None):
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
            dia_reserva=reserva.dia_reserva,
            hora_turno=reserva.hora_turno,
            nombre_cancha=reserva.nombre_cancha,
            monto_reserva=reserva.monto_reserva,
            id_pago=reserva.id_pago,
            metodo_pago=reserva.metodo_pago,
            nombre_usuario=reserva.nombre_usuario,
        )

        # Adjuntar el contenido HTML al mensaje
        mensaje.attach(MIMEText(html_content, "html"))

        # Adjuntar el logo embebido
        with open("backend/app/servicios/logo_complejo.png", "rb") as img_file:
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
