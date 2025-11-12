// src/pages/CanchasPage.jsx

import React, {useCallback, useState} from 'react';
import CanchaTable from '../components/tables/CanchaTable.jsx';
import CanchaForm from "../components/forms/CanchaForm.jsx";

export default function CanchasPage() {

    const [canchaEditId, setCanchaEditId] = useState(null);
    const [refreshKey, setRefreshKey] = useState(0);

    const handleAgregarCancha = () => {
        setCanchaEditId(0); // 0 indica modo Creación
    };

    // Callback llamado por la tabla cuando se hace clic en "Modificar"
    const handleEditStart = useCallback((id_cancha) => {
        setCanchaEditId(id_cancha);
    }, []);

    // Callback para manejar la finalización del formulario (éxito o cancelación)
    const handleFormComplete = () => {
        setCanchaEditId(null); // Volver a la vista de tabla
        setRefreshKey(prev => prev + 1); // Forzar la recarga de la tabla
    };

    // Si canchaEditId no es null, mostrar el formulario
    if (canchaEditId !== null) {
        return (
            <div className="container home-page p-4">
                <CanchaForm
                    idCancha={canchaEditId > 0 ? canchaEditId : null}
                    onSuccess={handleFormComplete}
                    onCancel={handleFormComplete}
                />
            </div>
        );
    }

    // Por defecto, mostrar la tabla
    return (
        <div className="container home-page p-4">

            <h1 className="text-3xl font-bold mb-6">🛠️ Gestión de Canchas</h1>

            {/* Bloque de Acciones con el botón Agregar */}
            <div className="home-actions mb-6 text-left">
                <button
                    onClick={handleAgregarCancha}
                    className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg shadow-md transition duration-300"
                >
                    + Agregar Cancha
                </button>
            </div>

            {/* Componente de la Tabla de Canchas. Key fuerza la recarga. */}
            <CanchaTable
                key={refreshKey}
                onEditStart={handleEditStart} // Pasar el callback para Modificar
            />

        </div>
    );
}