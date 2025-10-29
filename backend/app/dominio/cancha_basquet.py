from backend.app.dominio.cancha import Cancha

class CanchaBasquet(Cancha):
    """Cancha de básquet."""

    def __init__(self, tamaño=None, **kwargs):
        super().__init__(**kwargs)
        self.tamaño = tamaño

    def calcular_precio_total(self):
        """Ejemplo: precio_base con recargo por iluminación."""
        factor_iluminacion = 1.2 if self.iluminacion else 1.0
        return round(self.precio_base * factor_iluminacion, 2)