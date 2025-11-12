import React from 'react';
// Asegúrate de que la ruta de importación a CanchaTable.jsx sea correcta
import CanchaTable from '../components/tables/CanchaTable.jsx';

export default function CanchasPage() {

    // Función de acción para el botón Agregar
    const handleAgregarCancha = () => {
        console.log("Navegar o abrir modal para Agregar nueva Cancha");
        // Aquí podrías usar navigate('/canchas/nueva') o abrir un modal
    };

    return (
        // Utilizamos la clase 'container' que ya tienes definida en tu CSS
        <div className="container home-page">

            <h1 className="text-3xl font-bold mb-6">🛠️ Gestión de Canchas</h1>
            <p className="mb-6 text-gray-600">
                Aquí se listarán, crearán, editarán y eliminarán todas las canchas de tu complejo deportivo.
            </p>

            {/* Bloque de Acciones (Usa la clase 'home-actions' de tu CSS) */}
            <div className="home-actions mb-8">
                <button
                    onClick={handleAgregarCancha}
                    className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg shadow-md transition duration-300"
                >
                    + Agregar Cancha
                </button>
            </div>

            {/* Componente de la Tabla de Canchas */}
            <CanchaTable />

        </div>
    );
}