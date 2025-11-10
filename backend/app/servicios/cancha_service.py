from backend.app.repositorios.cancha_repo import CanchaRepository

class CanchaService:
    def __init__(self):
        self.cancha_repo = CanchaRepository()
    
    def agregar_cancha(self, cancha):
        return self.cancha_repo.agregar(cancha)
    
    def listar_canchas(self):
        return self.cancha_repo.listar_todas()
    
    def obtener_cancha_por_id(self, id_cancha):
        return self.cancha_repo.obtener_por_id(id_cancha)
    
    def actualizar_cancha(self, cancha):
        self.cancha_repo.actualizar(cancha)
    
    def eliminar_cancha(self, id_cancha):
        self.cancha_repo.eliminar(id_cancha)
    
    def obtener_canchas_por_tipo(self, tipo):
        # tipo puede ser 'futbol', 'basquet' o 'padel'
        return self.cancha_repo.obtener_por_tipo(tipo)
    
    