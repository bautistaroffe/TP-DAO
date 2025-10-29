from backend.app.dominio.cancha import Cancha

class CanchaFutbol(Cancha):
    """Cancha de fútbol."""

    def __init__(self, superficie=None, tamaño=None, **kwargs):
        super().__init__(**kwargs)
        self.superficie = superficie
        self.tamaño = tamaño

    def calcular_precio_total(self):
        """Ejemplo de cálculo: precio_base + extras por tamaño o iluminación."""
        factor_tamaño = 1.2 if self.tamaño and "grande" in self.tamaño.lower() else 1.0
        factor_iluminacion = 1.1 if self.iluminacion else 1.0
        return round(self.precio_base * factor_tamaño * factor_iluminacion, 2)
