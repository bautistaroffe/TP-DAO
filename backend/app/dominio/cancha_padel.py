from backend.app.dominio.cancha import Cancha

class CanchaPadel(Cancha):
    """Cancha de pádel."""

    def __init__(self, superficie=None, **kwargs):
        super().__init__(**kwargs)
        self.superficie = superficie

    def calcular_precio_total(self):
        """Ejemplo: si es techada, suma un 15%; si tiene iluminación, otro 10%."""
        factor_techada = 1.15 if self.techada else 1.0
        factor_iluminacion = 1.10 if self.iluminacion else 1.0
        return round(self.precio_base * factor_techada * factor_iluminacion, 2)
