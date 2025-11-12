import React from 'react';
// Asegúrate de que la ruta de importación a CanchaTable.jsx sea correcta
import TurnoTable from '../components/tables/TurnoTable.jsx';

export default function TurnosPage() {

    // Función de acción para el botón Agregar
    const handleAgregarTurno = () => {
        console.log("Navegar o abrir modal para Agregar nueva Turno");
    };

    return (
        // Utilizamos la clase 'container' que ya tienes definida en tu CSS
        <div className="container home-page">

            <h1 className="text-3xl font-bold mb-6">Gestión de Turnos</h1>
            <p className="mb-6 text-gray-600">
                Aquí se listarán, crearán, editarán y eliminarán todas los turnos de tu complejo deportivo.
            </p>

            {/* Bloque de Acciones (Usa la clase 'home-actions' de tu CSS) */}
            <div className="home-actions mb-8">
                <button
                    onClick={handleAgregarTurno}
                    className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg shadow-md transition duration-300"
                >
                    + Agregar Turno
                </button>
            </div>

            {/* Componente de la Tabla de Turnos */}
            <TurnoTable />

        </div>
    );
}